import type React from "react";
import { useState, useRef } from "react";
import {
  Wrench,
  FileText,
  MessageSquare,
  DollarSign,
  Smartphone,
} from "lucide-react";
import AIChatCard from "@/components/ui/ai-chat-card";
import { motion, AnimatePresence } from "framer-motion";

interface AIAssistantWelcomeProps {
  onSuggestionSelect: (text: string) => void;
}

const commandSuggestions = {
  diagnostico: [
    "¿Qué puede causar que un iPhone no encienda?",
    "Pantalla con líneas verdes en Samsung Galaxy",
    "Celular se reinicia solo constantemente",
    "No carga la batería aunque cambié el cable",
    "El micrófono no funciona en llamadas",
  ],
  presupuesto: [
    "¿Cuánto cobrar por cambio de pantalla iPhone 13?",
    "Precio estimado de reparación de placa base",
    "Costo de cambio de batería Samsung A54",
    "¿Vale la pena reparar un celular de 5 años?",
    "Genera un presupuesto para cambio de puerto de carga",
  ],
  mensaje: [
    "Escribe un mensaje para avisar que la reparación está lista",
    "Mensaje para pedir autorización de reparación adicional",
    "Aviso de que el repuesto no está disponible",
    "Mensaje de seguimiento después de la entrega",
    "Recordatorio de recogida para un cliente",
  ],
};

export function AIAssistantWelcome({ onSuggestionSelect }: AIAssistantWelcomeProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8 gap-6">
      {/* Animated chat card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <AIChatCard />
      </motion.div>

      {/* Welcome text */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="text-center"
      >
        <h2 className="text-lg font-semibold text-foreground">
          Asistente TecniAviso
        </h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Pregúntame sobre diagnósticos, presupuestos o genera mensajes para tus clientes
        </p>
      </motion.div>

      {/* Category buttons */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="flex flex-wrap justify-center gap-2"
      >
        <CommandButton
          icon={<Wrench size={16} />}
          label="Diagnóstico"
          isActive={activeCategory === "diagnostico"}
          onClick={() => setActiveCategory(activeCategory === "diagnostico" ? null : "diagnostico")}
        />
        <CommandButton
          icon={<DollarSign size={16} />}
          label="Presupuesto"
          isActive={activeCategory === "presupuesto"}
          onClick={() => setActiveCategory(activeCategory === "presupuesto" ? null : "presupuesto")}
        />
        <CommandButton
          icon={<MessageSquare size={16} />}
          label="Mensaje"
          isActive={activeCategory === "mensaje"}
          onClick={() => setActiveCategory(activeCategory === "mensaje" ? null : "mensaje")}
        />
      </motion.div>

      {/* Suggestions */}
      <AnimatePresence mode="wait">
        {activeCategory && (
          <motion.div
            key={activeCategory}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="w-full max-w-md overflow-hidden"
          >
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border bg-secondary/30">
                <p className="text-xs font-medium text-muted-foreground">
                  {activeCategory === "diagnostico"
                    ? "Sugerencias de diagnóstico"
                    : activeCategory === "presupuesto"
                    ? "Sugerencias de presupuesto"
                    : "Sugerencias de mensajes"}
                </p>
              </div>
              <div className="divide-y divide-border">
                {commandSuggestions[activeCategory as keyof typeof commandSuggestions].map(
                  (suggestion, index) => (
                    <motion.button
                      key={suggestion}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      onClick={() => onSuggestionSelect(suggestion)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors"
                    >
                      {activeCategory === "diagnostico" ? (
                        <Smartphone size={14} className="shrink-0 text-primary" />
                      ) : activeCategory === "presupuesto" ? (
                        <DollarSign size={14} className="shrink-0 text-primary" />
                      ) : (
                        <FileText size={14} className="shrink-0 text-primary" />
                      )}
                      <span className="text-sm text-foreground">{suggestion}</span>
                    </motion.button>
                  )
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface CommandButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function CommandButton({ icon, label, isActive, onClick }: CommandButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
        isActive
          ? "bg-primary/15 text-primary ring-1 ring-primary/30"
          : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
      }`}
    >
      <span className={isActive ? "text-primary" : "text-muted-foreground"}>{icon}</span>
      {label}
    </button>
  );
}
