import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Compress repairs into a compact table format to save tokens */
function compressRepairs(repairs: any[]): string {
  if (!repairs || repairs.length === 0) return "";
  const rows = repairs.slice(0, 30).map((r: any, i: number) => {
    const status = r.status === "done" ? "✓" : "⏳";
    const date = r.createdAt ? r.createdAt.slice(0, 10) : "N/A";
    return `${i + 1}. ${status} ${r.clientName} | ${r.deviceModel || "?"} | ${r.problem || "?"} | ${date}`;
  });
  return `\n## Reparaciones activas (${repairs.length}):\nFormato: # Estado Cliente | Equipo | Problema | Fecha\n${rows.join("\n")}`;
}

/** Truncate message history to last N messages to control token usage */
function truncateHistory(messages: any[], maxMessages = 20): any[] {
  if (messages.length <= maxMessages) return messages;
  // Always keep the first message for context, then last (maxMessages-1)
  return [messages[0], ...messages.slice(-(maxMessages - 1))];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, repairs } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Se requiere al menos un mensaje." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch technician knowledge from DB
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: knowledge } = await supabase
      .from("technician_knowledge")
      .select("key, content");

    const knowledgeMap: Record<string, string> = {};
    (knowledge || []).forEach((k: any) => {
      if (k.content?.trim()) knowledgeMap[k.key] = k.content;
    });

    // --- OPTIMIZED SYSTEM PROMPT with Chain-of-Thought ---
    const systemPrompt = `# ROL
Eres "TecniBot", el asistente experto de TecniAviso — una app de gestión de reparaciones de dispositivos electrónicos (celulares, tablets, laptops).

# IDENTIDAD
- Nombre: TecniBot
- Tono: Profesional, directo y amigable. Siempre en español.
- Expertise: Diagnóstico de hardware/software, presupuestos, comunicación con clientes.

# REGLAS ESTRICTAS
1. NUNCA inventes datos de reparaciones ni clientes. Usa SOLO la información proporcionada en el contexto.
2. Si no tienes información suficiente, dilo claramente y pide más detalles.
3. Para diagnósticos, usa razonamiento paso a paso:
   - Paso 1: Identifica los síntomas descritos.
   - Paso 2: Lista las causas más probables (de más a menos probable).
   - Paso 3: Sugiere pruebas de verificación.
   - Paso 4: Recomienda la solución.
4. Para presupuestos, desglosa: costo de pieza + mano de obra + tiempo estimado.
5. Para mensajes a clientes, usa un tono cortés y profesional.

# FORMATO DE RESPUESTA
- Usa Markdown para estructura (encabezados, listas, negritas).
- Sé conciso: responde en menos de 300 palabras salvo que el usuario pida detalle.
- Usa emojis relevantes con moderación (🔧 ⚡ 📱 💰).
${knowledgeMap.system_prompt ? `\n# INSTRUCCIONES PERSONALIZADAS DEL TÉCNICO\n${knowledgeMap.system_prompt}` : ""}
${knowledgeMap.pricing ? `\n# LISTA DE PRECIOS\n${knowledgeMap.pricing}` : ""}
${knowledgeMap.procedures ? `\n# PROCEDIMIENTOS\n${knowledgeMap.procedures}` : ""}
${compressRepairs(repairs)}`;

    // Truncate conversation history to save tokens
    const truncatedMessages = truncateHistory(messages);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: systemPrompt },
              ...truncatedMessages,
            ],
            stream: true,
            temperature: 0.7,
            max_tokens: 1024,
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeout);

      if (!response.ok) {
        const status = response.status;
        const body = await response.text().catch(() => "");
        console.error("AI gateway error:", status, body);

        const errorMap: Record<number, string> = {
          429: "Demasiadas solicitudes. Intenta de nuevo en unos segundos.",
          402: "Créditos agotados. Agrega fondos en tu workspace.",
          503: "El servicio de IA está temporalmente no disponible. Intenta en un momento.",
        };

        return new Response(
          JSON.stringify({
            error: errorMap[status] || "Error del servicio de IA",
            code: status,
          }),
          {
            status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    } catch (fetchError) {
      clearTimeout(timeout);
      if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
        return new Response(
          JSON.stringify({ error: "La solicitud tardó demasiado. Intenta de nuevo.", code: 408 }),
          { status: 408, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw fetchError;
    }
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Error desconocido",
        code: 500,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
