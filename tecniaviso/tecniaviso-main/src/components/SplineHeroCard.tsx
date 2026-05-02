import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";
import { MessageCircle, Zap, CheckCircle2, Smartphone } from "lucide-react";

function WhatsAppAnimation() {
  return (
    <div className="w-full h-full flex items-center justify-center relative select-none">
      {/* Phone frame */}
      <div className="relative w-28 h-48 rounded-[22px] border-2 border-border bg-card shadow-xl flex flex-col overflow-hidden">
        {/* Status bar */}
        <div className="h-5 bg-muted flex items-center justify-center px-2 shrink-0">
          <div className="w-8 h-1.5 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Chat area */}
        <div className="flex-1 bg-background/60 p-1.5 flex flex-col justify-end gap-1 overflow-hidden">
          {/* Incoming bubble */}
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4, ease: "backOut" }}
            className="self-start max-w-[80%] bg-secondary rounded-lg rounded-tl-none px-1.5 py-1"
          >
            <p className="text-[6px] text-foreground leading-tight">¿Está listo mi equipo?</p>
          </motion.div>

          {/* Outgoing bubble (auto-reply) */}
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.4, ease: "backOut" }}
            className="self-end max-w-[80%] bg-primary rounded-lg rounded-tr-none px-1.5 py-1"
          >
            <p className="text-[6px] text-primary-foreground leading-tight">¡Sí! Tu dispositivo está listo para recoger 🎉</p>
            <div className="flex items-center justify-end gap-0.5 mt-0.5">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
              >
                <CheckCircle2 size={5} className="text-primary-foreground/70" />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Input bar */}
        <div className="h-5 bg-muted border-t border-border flex items-center px-2 gap-1 shrink-0">
          <div className="flex-1 h-3 rounded-full bg-background border border-border" />
          <Smartphone size={8} className="text-muted-foreground" />
        </div>
      </div>

      {/* Floating notification badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5, ease: "backOut" }}
        className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
      >
        <span className="text-[8px] font-bold">1</span>
      </motion.div>

      {/* Floating "enviado" pill */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: [0, 1, 1, 0], y: [12, 0, 0, -8] }}
        transition={{ delay: 1.1, duration: 1.8, times: [0, 0.2, 0.7, 1], repeat: Infinity, repeatDelay: 2 }}
        className="absolute bottom-2 -left-10 flex items-center gap-1 bg-success/10 border border-success/30 text-success rounded-full px-2 py-0.5 shadow-sm"
      >
        <CheckCircle2 size={8} />
        <span className="text-[7px] font-semibold">Enviado</span>
      </motion.div>

      {/* Ping rings */}
      {[0, 0.4, 0.8].map((delay, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-primary/20"
          style={{ width: 70 + i * 22, height: 70 + i * 22 }}
          animate={{ opacity: [0.4, 0], scale: [1, 1.15] }}
          transition={{ duration: 2, delay, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export function SplineHeroCard() {
  return (
    <Card className="relative overflow-hidden border border-border bg-card mb-5 sm:mb-7" style={{ minHeight: 200 }}>
      <Spotlight size={300} />

      <div className="relative z-10 flex flex-col sm:flex-row h-full">
        {/* Left content */}
        <div className="flex flex-col justify-center px-5 sm:px-6 py-5 sm:py-7 sm:w-1/2 gap-2 sm:gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide w-fit">
            <Zap size={10} />
            Automático
          </span>

          <h2 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
            Avisa a tus clientes
            <br />
            <span className="text-primary">sin escribir ni llamar</span>
          </h2>

          <p className="text-xs text-muted-foreground leading-relaxed flex items-start gap-1.5">
            <MessageCircle size={12} className="shrink-0 mt-0.5 text-primary/70" />
            Cuando el equipo está listo, TecniAviso envía el WhatsApp por ti al instante. Sin llamadas, sin olvidos.
          </p>
        </div>

        {/* Right content — animated illustration */}
        <div className="sm:w-1/2 h-40 sm:h-auto min-h-[160px] relative flex items-center justify-center bg-gradient-to-br from-primary/5 to-transparent">
          <WhatsAppAnimation />
        </div>
      </div>
    </Card>
  );
}
