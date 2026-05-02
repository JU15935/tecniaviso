"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

const demoMessages: { sender: "ai" | "user"; text: string }[] = [
  { sender: "user", text: "¿Qué puede causar que un iPhone no encienda?" },
  { sender: "ai", text: "Puede ser batería agotada, daño en el IC de carga, o fallo en la placa base. Te recomiendo verificar con fuente regulada." },
];

export default function AIChatCard({ className }: { className?: string }) {
  const [messages, setMessages] = useState<{ sender: "ai" | "user"; text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    timers.push(setTimeout(() => setMessages([demoMessages[0]]), 600));
    timers.push(setTimeout(() => setIsTyping(true), 1400));
    timers.push(
      setTimeout(() => {
        setIsTyping(false);
        setMessages([demoMessages[0], demoMessages[1]]);
      }, 2800)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className={cn("relative w-full max-w-xs mx-auto", className)}>
      {/* Animated outer border */}
      <motion.div
        className="absolute -inset-[1px] rounded-2xl opacity-60 blur-[2px]"
        style={{
          background:
            "conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--primary) / 0.2), hsl(var(--primary)), hsl(var(--primary) / 0.2), hsl(var(--primary)))",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Inner card */}
      <div className="relative rounded-2xl border border-border bg-card overflow-hidden">
        {/* Floating particles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/30"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Header */}
        <div className="relative flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/30">
          <div className="w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center">
            <Bot size={14} className="text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground">Asistente TecniAviso</span>
        </div>

        {/* Messages */}
        <div className="relative p-3 space-y-2.5 min-h-[120px]">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed",
                msg.sender === "user"
                  ? "ml-auto bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-secondary text-secondary-foreground rounded-bl-sm"
              )}
            >
              {msg.text}
            </motion.div>
          ))}

          {isTyping && (
            <div className="flex gap-1 px-3 py-2 w-fit bg-secondary rounded-xl rounded-bl-sm">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
