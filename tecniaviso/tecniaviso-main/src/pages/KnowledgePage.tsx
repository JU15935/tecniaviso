import { useState, useEffect } from "react";
import { Save, Brain, DollarSign, ClipboardList, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDarkMode } from "@/hooks/useDarkMode";
import { Link } from "react-router-dom";

interface KnowledgeEntry {
  key: string;
  content: string;
}

const sections = [
  {
    key: "system_prompt",
    label: "Instrucciones generales",
    description: "Dile a la IA cómo debe comportarse, qué especialidades tienes, tu nombre, marca, etc.",
    icon: Brain,
    placeholder:
      "Ej: Me llamo Carlos y tengo un taller de reparación de celulares en Madrid. Me especializo en dispositivos Apple y Samsung. Siempre trata al cliente de usted...",
  },
  {
    key: "pricing",
    label: "Precios y tarifas",
    description: "Lista de precios para que la IA pueda generar presupuestos automáticos.",
    icon: DollarSign,
    placeholder:
      "Ej:\n- Cambio de pantalla iPhone 13: 120€\n- Cambio de batería Samsung S22: 45€\n- Reparación placa base: desde 80€\n- Diagnóstico: gratis\n- Mano de obra: 20€/hora",
  },
  {
    key: "procedures",
    label: "Procedimientos y protocolos",
    description: "Pasos que sigues en tus reparaciones, garantías, políticas de tu negocio.",
    icon: ClipboardList,
    placeholder:
      "Ej:\n- Todas las reparaciones tienen 3 meses de garantía\n- Se hace diagnóstico previo sin costo\n- Tiempo estimado de reparación: 24-48 horas\n- Se notifica al cliente por WhatsApp cuando está listo",
  },
];

export default function KnowledgePage() {
  useDarkMode();
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadKnowledge();
  }, []);

  const loadKnowledge = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("technician_knowledge")
      .select("key, content");

    if (error) {
      toast({ title: "Error", description: "No se pudo cargar la configuración.", variant: "destructive" });
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

  const getValue = (key: string) => entries.find((e) => e.key === key)?.content || "";

  const setValue = (key: string, content: string) => {
    setEntries((prev) => {
      const existing = prev.find((e) => e.key === key);
      if (existing) return prev.map((e) => (e.key === key ? { ...e, content } : e));
      return [...prev, { key, content }];
    });
  };

  const handleSave = async () => {
    setSaving(true);
    let hasError = false;

    for (const entry of entries) {
      const { error } = await supabase
        .from("technician_knowledge")
        .update({ content: entry.content, updated_at: new Date().toISOString() })
        .eq("key", entry.key);

      if (error) {
        hasError = true;
        console.error("Error saving", entry.key, error);
      }
    }

    if (hasError) {
      toast({ title: "Error", description: "Hubo un problema al guardar algunos campos.", variant: "destructive" });
    } else {
      toast({ title: "✅ Guardado", description: "Tu información ha sido actualizada. La IA ya la tiene en cuenta." });
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-lg h-14 flex items-center px-3 sm:px-4 gap-3">
        <Link to="/" className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft size={18} className="text-foreground" />
        </Link>
        <Brain size={20} className="text-primary" />
        <h1 className="text-base font-semibold text-foreground">Configurar IA</h1>
      </header>

      <div className="max-w-2xl mx-auto px-3 sm:px-5 py-6 space-y-6">
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4">
          <p className="text-sm text-foreground font-medium">💡 ¿Cómo funciona?</p>
          <p className="text-xs text-muted-foreground mt-1">
            Todo lo que escribas aquí será el conocimiento de tu asistente IA. Cuanta más información le des,
            mejor te ayudará con diagnósticos, presupuestos y mensajes a clientes.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        ) : (
          <>
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.key} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{section.label}</p>
                      <p className="text-xs text-muted-foreground">{section.description}</p>
                    </div>
                  </div>
                  <textarea
                    value={getValue(section.key)}
                    onChange={(e) => setValue(section.key, e.target.value)}
                    placeholder={section.placeholder}
                    rows={6}
                    className="form-input resize-none text-sm"
                  />
                </div>
              );
            })}

            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Guardando..." : "Guardar configuración"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
