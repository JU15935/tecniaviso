import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export function useChatHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Load conversations
  const fetchConversations = useCallback(async () => {
    const { data } = await supabase
      .from("chat_conversations")
      .select("*")
      .order("updated_at", { ascending: false });
    setConversations((data as Conversation[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load messages for active conversation
  const loadConversation = useCallback(async (convId: string) => {
    setActiveId(convId);
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    setMessages((data as ChatMessage[]) || []);
  }, []);

  // Create new conversation
  const createConversation = useCallback(async (title?: string) => {
    const { data } = await supabase
      .from("chat_conversations")
      .insert({ title: title || "Nueva conversación" })
      .select()
      .single();
    if (data) {
      const conv = data as Conversation;
      setConversations((prev) => [conv, ...prev]);
      setActiveId(conv.id);
      setMessages([]);
      return conv.id;
    }
    return null;
  }, []);

  // Save a message
  const saveMessage = useCallback(
    async (convId: string, role: "user" | "assistant", content: string) => {
      const { data } = await supabase
        .from("chat_messages")
        .insert({ conversation_id: convId, role, content })
        .select()
        .single();

      // Update conversation title from first user message
      if (role === "user") {
        const short = content.slice(0, 60) + (content.length > 60 ? "..." : "");
        await supabase
          .from("chat_conversations")
          .update({ title: short, updated_at: new Date().toISOString() })
          .eq("id", convId);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId ? { ...c, title: short, updated_at: new Date().toISOString() } : c
          )
        );
      } else {
        await supabase
          .from("chat_conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", convId);
      }

      return data as ChatMessage | null;
    },
    []
  );

  // Update last assistant message (for streaming)
  const updateLastAssistantMessage = useCallback(
    async (msgId: string, content: string) => {
      await supabase.from("chat_messages").update({ content }).eq("id", msgId);
    },
    []
  );

  // Delete conversation
  const deleteConversation = useCallback(
    async (convId: string) => {
      await supabase.from("chat_conversations").delete().eq("id", convId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (activeId === convId) {
        setActiveId(null);
        setMessages([]);
      }
    },
    [activeId]
  );

  // Start fresh
  const newChat = useCallback(() => {
    setActiveId(null);
    setMessages([]);
  }, []);

  return {
    conversations,
    activeId,
    setActiveId,
    messages,
    setMessages,
    loading,
    loadConversation,
    createConversation,
    saveMessage,
    updateLastAssistantMessage,
    deleteConversation,
    newChat,
    fetchConversations,
  };
}
