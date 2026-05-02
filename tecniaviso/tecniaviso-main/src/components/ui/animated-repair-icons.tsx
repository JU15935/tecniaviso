"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface IconProps {
  size?: number;
  className?: string;
}

/* ─── WRENCH (en reparación) ─── */
export function WrenchIcon({ size = 48, className }: IconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={cn(className)}
      animate={{ rotate: [0, -18, 18, -10, 10, 0] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.8 }}
    >
      {/* mango */}
      <motion.rect
        x="8" y="22" width="26" height="5" rx="2.5"
        fill="currentColor" opacity={0.85}
      />
      {/* cabeza de llave */}
      <motion.circle cx="36" cy="24" r="7" stroke="currentColor" strokeWidth="3" fill="none" />
      <motion.circle cx="36" cy="24" r="2.5" fill="currentColor" opacity={0.6} />
      {/* tornillo pequeño al otro extremo */}
      <motion.circle
        cx="9" cy="24.5" r="3.5"
        stroke="currentColor" strokeWidth="2.5" fill="none"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.svg>
  );
}

/* ─── CHECKMARK (listo para recoger) ─── */
export function CheckIcon({ size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={cn(className)}>
      {/* círculo exterior */}
      <motion.circle
        cx="24" cy="24" r="18"
        stroke="currentColor" strokeWidth="2.5" fill="none" opacity={0.25}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* tick */}
      <motion.path
        d="M14 24l7 7 13-13"
        stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      {/* destellos */}
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <motion.line
          key={deg}
          x1="24" y1="24"
          x2={24 + 14 * Math.cos((deg * Math.PI) / 180)}
          y2={24 + 14 * Math.sin((deg * Math.PI) / 180)}
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity={0}
          animate={{ opacity: [0, 0.5, 0], y2: [24 + 14 * Math.sin((deg * Math.PI) / 180), 24 + 18 * Math.sin((deg * Math.PI) / 180)] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: 0.6 + deg * 0.003, repeatDelay: 1.5 }}
        />
      ))}
    </svg>
  );
}

/* ─── WHATSAPP BUBBLE (mensaje enviado) ─── */
export function MessageSentIcon({ size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={cn(className)}>
      {/* burbuja principal */}
      <motion.rect
        x="6" y="10" width="30" height="22" rx="7"
        fill="currentColor" opacity={0.15}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.rect
        x="6" y="10" width="30" height="22" rx="7"
        stroke="currentColor" strokeWidth="2.5" fill="none"
      />
      {/* colita */}
      <motion.path d="M14 32l-4 6 8-3" fill="currentColor" opacity={0.7} />
      {/* doble tick de WhatsApp */}
      <motion.path
        d="M14 21l4 4 9-8"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      <motion.path
        d="M19 21l4 4 9-8"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
      />
      {/* burbuja pequeña que sube */}
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx={38 + i * 3} cy={14} r={1.5 - i * 0.3}
          fill="currentColor"
          animate={{ y: [0, -6, 0], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}

/* ─── PHONE RINGING (contacto cliente) ─── */
export function PhoneRingIcon({ size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={cn(className)}>
      {/* ondas */}
      {[10, 14, 18].map((r, i) => (
        <motion.path
          key={r}
          d={`M32 14 a${r} ${r} 0 0 1 0 ${r * 0.9}`}
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"
          animate={{ opacity: [0, 0.7, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.25, ease: "easeOut" }}
        />
      ))}
      {/* cuerpo del teléfono */}
      <motion.path
        d="M10 12c1-2 4-3 6-2l3 5c1 1 0 3-1 4l-1 1c1 3 4 6 7 7l1-1c1-1 3-2 4-1l5 3c1 2 0 5-2 6-6 3-16-3-20-12-2-4-3-8-2-10z"
        fill="currentColor" opacity={0.85}
        animate={{ rotate: [0, -8, 8, -5, 5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
        style={{ transformOrigin: "20px 24px" }}
      />
    </svg>
  );
}

/* ─── ALERT / ERROR ─── */
export function AlertIcon({ size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={cn(className)}>
      <motion.path
        d="M24 8L42 38H6L24 8z"
        stroke="currentColor" strokeWidth="2.5" fill="none"
        strokeLinejoin="round"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "24px 24px" }}
      />
      <motion.line
        x1="24" y1="18" x2="24" y2="30"
        stroke="currentColor" strokeWidth="3" strokeLinecap="round"
      />
      <motion.circle
        cx="24" cy="35" r="1.8"
        fill="currentColor"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

/* ─── TOOLBOX (estado vacío general) ─── */
export function ToolboxIcon({ size = 48, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={cn(className)}>
      {/* caja */}
      <motion.rect
        x="6" y="22" width="36" height="20" rx="4"
        stroke="currentColor" strokeWidth="2.5" fill="none"
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* asa */}
      <motion.path
        d="M16 22v-6a8 8 0 0 1 16 0v6"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* línea central */}
      <motion.line
        x1="6" y1="32" x2="42" y2="32"
        stroke="currentColor" strokeWidth="2" opacity={0.5}
      />
      {/* tornillo animado dentro */}
      <motion.circle
        cx="24" cy="37" r="2.5"
        stroke="currentColor" strokeWidth="2" fill="none"
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "24px 37px" }}
      />
      <motion.line x1="24" y1="34.5" x2="24" y2="39.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <motion.line x1="21.5" y1="37" x2="26.5" y2="37" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
