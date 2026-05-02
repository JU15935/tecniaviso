import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Mic, MicOff, Volume2, VolumeX, Bot, User, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { AIAssistantWelcome } from "@/components/ui/ai-assistant-welcome";

type Msg = { role: "user" | "assistant"; content: string };

interface AIChatPanelProps {
  repairs: Array<{
    clientName: string;
    deviceModel: string;
    problem: string;
    status: string;
    createdAt: string;
  }>;
  conversationId: string | null;
  onConversationCreated?: (id: string) => void;
  onMessageSaved?: (convId: string, role: "user" | "assistant", content: string) => Promise<any>;
  onAssistantMessageUpdated?: (msgId: string, content: string) => Promise<void>;
  initialMessages?: Msg[];
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
const MAX_RETRIES = 2;
const RETRY_DELAY = 1500;

/** Classify error for UX */
function classifyError(status: number, message: string): { icon: string; text: string; retryable: boolean } {
  if (status === 429) return { icon: "⏱️", text: "Demasiadas solicitudes. Espera unos segundos.", retryable: true };
  if (status === 402) return { icon: "💳", text: "Créditos agotados. Agrega fondos en tu workspace.", retryable: false };
  if (status === 408) return { icon: "⏳", text: "La solicitud tardó demasiado.", retryable: true };
  if (status === 503) return { icon: "🔧", text: "Servicio temporalmente no disponible.", retryable: true };
  if (!navigator.onLine) return { icon: "📡", text: "Sin conexión a internet.", retryable: true };
  return { icon: "⚠️", text: message || "Error al conectar con la IA.", retryable: true };
}

export default function AIChatPanel({
  repairs,
  conversationId,
  onConversationCreated,
  onMessageSaved,
  onAssistantMessageUpdated,
  initialMessages,
}: AIChatPanelProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamPhase, setStreamPhase] = useState<"idle" | "thinking" | "streaming">("idle");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastError, setLastError] = useState<{ text: string; retryable: boolean } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const assistantMsgIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastUserMsgRef = useRef<string>("");

  useEffect(() => {
    setMessages(initialMessages || []);
  }, [initialMessages, conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamPhase]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const streamChat = useCallback(
    async (allMessages: Msg[], convId: string, signal: AbortSignal) => {
      setStreamPhase("thinking");

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages, repairs }),
        signal,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Error de conexión", code: resp.status }));
        const classified = classifyError(err.code || resp.status, err.error);
        throw { ...classified, status: err.code || resp.status };
      }

      if (!resp.body) throw { text: "No se recibió respuesta", retryable: true, status: 500 };

      // Create assistant message in DB
      let savedMsg: any = null;
      if (onMessageSaved) {
        savedMsg = await onMessageSaved(convId, "assistant", "");
        assistantMsgIdRef.current = savedMsg?.id || null;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantSoFar = "";
      let streamDone = false;
      let firstToken = true;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              if (firstToken) {
                setStreamPhase("streaming");
                firstToken = false;
              }
              assistantSoFar += content;
              const current = assistantSoFar;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: current } : m));
                }
                return [...prev, { role: "assistant", content: current }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Flush remaining buffer
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              const current = assistantSoFar;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: current } : m));
                }
                return [...prev, { role: "assistant", content: current }];
              });
            }
          } catch { /* ignore partial */ }
        }
      }

      if (assistantMsgIdRef.current && onAssistantMessageUpdated) {
        await onAssistantMessageUpdated(assistantMsgIdRef.current, assistantSoFar);
      }

      return assistantSoFar;
    },
    [repairs, onMessageSaved, onAssistantMessageUpdated]
  );

  const send = async (text: string, retry = false) => {
    if (!text.trim() || isLoading) return;
    setLastError(null);

    const userMsg: Msg = { role: "user", content: text.trim() };
    const newMessages = retry ? messages : [...messages, userMsg];
    if (!retry) {
      setMessages(newMessages);
      setInput("");
      lastUserMsgRef.current = text.trim();
    }
    setIsLoading(true);

    // Abort previous request if any
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    let attempts = 0;
    let lastErr: any = null;

    while (attempts <= MAX_RETRIES) {
      try {
        let convId = conversationId;
        if (!convId && onConversationCreated) {
          const { data } = await (await import("@/integrations/supabase/client")).supabase
            .from("chat_conversations")
            .insert({ title: text.trim().slice(0, 60) })
            .select()
            .single();
          if (data) {
            convId = data.id;
            onConversationCreated(convId);
          }
        }

        if (!convId) throw { text: "No se pudo crear la conversación", retryable: false, status: 500 };

        if (!retry && attempts === 0 && onMessageSaved) {
          await onMessageSaved(convId, "user", text.trim());
        }

        await streamChat(newMessages, convId, controller.signal);
        setStreamPhase("idle");
        setIsLoading(false);
        return;
      } catch (e: any) {
        lastErr = e;
        if (e.name === "AbortError" || controller.signal.aborted) {
          setStreamPhase("idle");
          setIsLoading(false);
          return;
        }
        if (e.retryable && e.status === 429 && attempts < MAX_RETRIES) {
          attempts++;
          await new Promise((r) => setTimeout(r, RETRY_DELAY * attempts));
          continue;
        }
        break;
      }
    }

    // Show error
    const errorInfo = lastErr?.text
      ? { text: `${lastErr.icon || "⚠️"} ${lastErr.text}`, retryable: lastErr.retryable ?? true }
      : { text: "⚠️ Error al conectar con la IA.", retryable: true };

    setLastError(errorInfo);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: errorInfo.text },
    ]);
    setStreamPhase("idle");
    setIsLoading(false);
  };

  const handleRetry = () => {
    if (lastUserMsgRef.current) {
      // Remove the error message
      setMessages((prev) => prev.filter((_, i) => i < prev.length - 1));
      send(lastUserMsgRef.current, true);
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setStreamPhase("idle");
    setIsLoading(false);
  };

  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Tu navegador no soporta reconocimiento de voz.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "es-MX";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      setTimeout(() => send(transcript), 100);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    if (isSpeaking) { stopSpeaking(); return; }

    const cleanText = text
      .replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1")
      .replace(/__(.+?)__/g, "$1").replace(/_(.+?)_/g, "$1")
      .replace(/#{1,6}\s?/g, "").replace(/`(.+?)`/g, "$1")
      .replace(/\[(.+?)\]\(.+?\)/g, "$1").replace(/[-*+]\s/g, "")
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{27BF}\u{2B50}\u{2702}-\u{27B0}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}\u{2300}-\u{23FF}\u{2190}-\u{21FF}\u{25A0}-\u{25FF}\u{2660}-\u{2667}\u{2934}-\u{2935}\u{3030}\u{303D}\u{3297}\u{3299}]/gu, "")
      .replace(/\n{2,}/g, ". ").replace(/\n/g, " ")
      .replace(/\s{2,}/g, " ").trim();

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "es-MX";
    utterance.rate = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-4">
        {messages.length === 0 && streamPhase === "idle" && (
          <AIAssistantWelcome onSuggestionSelect={(text) => send(text)} />
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={`${conversationId}-${i}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={14} className="text-primary" />
              </div>
            )}
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-secondary text-secondary-foreground rounded-bl-md"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
              {msg.role === "assistant" && msg.content && !msg.content.startsWith("⚠️") && !msg.content.startsWith("⏱️") && !msg.content.startsWith("💳") && !msg.content.startsWith("⏳") && !msg.content.startsWith("🔧") && !msg.content.startsWith("📡") && (
                <button
                  onClick={() => speak(msg.content)}
                  className="mt-1.5 p-1 rounded-md hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors"
                  title={isSpeaking ? "Detener voz" : "Escuchar respuesta"}
                >
                  {isSpeaking ? <VolumeX size={13} className="text-destructive" /> : <Volume2 size={13} />}
                </button>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <User size={14} className="text-muted-foreground" />
              </div>
            )}
          </motion.div>
        ))}

        {/* Thinking indicator */}
        <AnimatePresence>
          {streamPhase === "thinking" && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Bot size={14} className="text-primary" />
              </div>
              <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-primary/60"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">Analizando...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Retry button for errors */}
        {lastError?.retryable && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-sm text-foreground hover:bg-accent transition-colors"
            >
              <RefreshCw size={14} />
              Reintentar
            </button>
          </motion.div>
        )}
      </div>

      {/* Speaking bar */}
      {isSpeaking && (
        <div className="px-3 sm:px-4 pb-1">
          <button
            onClick={stopSpeaking}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors"
          >
            <VolumeX size={16} />
            Detener voz
          </button>
        </div>
      )}

      {/* Stop generation bar */}
      {isLoading && streamPhase !== "idle" && (
        <div className="px-3 sm:px-4 pb-1">
          <button
            onClick={handleStop}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-muted text-sm text-foreground font-medium hover:bg-accent transition-colors"
          >
            <Loader2 size={14} className="animate-spin" />
            Detener generación
          </button>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border p-3 sm:p-4 bg-card">
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="flex gap-2 items-end"
        >
          <button
            type="button"
            onClick={toggleVoice}
            className={`shrink-0 p-2.5 rounded-xl transition-all ${
              isListening
                ? "bg-destructive text-destructive-foreground animate-pulse"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
            title={isListening ? "Detener micrófono" : "Hablar"}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Escuchando..." : "Escribe tu pregunta..."}
            disabled={isLoading || isListening}
            className="flex-1 form-input !rounded-xl text-sm"
          />

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="shrink-0 p-2.5 rounded-xl btn-primary disabled:opacity-40"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
