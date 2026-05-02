'use client';

import { Sun, Moon } from 'lucide-react';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  delay: number;
  duration: number;
}

interface CinematicThemeSwitcherProps {
  isDark: boolean;
  onToggle: () => void;
}

export default function CinematicThemeSwitcher({ isDark, onToggle }: CinematicThemeSwitcherProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const generateParticles = () => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 3; i++) {
      newParticles.push({ id: i, delay: i * 0.1, duration: 0.6 + i * 0.1 });
    }
    setParticles(newParticles);
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      setParticles([]);
    }, 1000);
  };

  const handleToggle = () => {
    generateParticles();
    onToggle();
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* SVG Filters */}
      <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
        <defs>
          <filter id="grain-light">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" mode="overlay" result="blend" />
            <feComposite in="blend" in2="SourceGraphic" operator="in" />
          </filter>
          <filter id="grain-dark">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" mode="soft-light" result="blend" />
            <feComposite in="blend" in2="SourceGraphic" operator="in" />
          </filter>
        </defs>
      </svg>

      {/* Track */}
      <button
        ref={toggleRef}
        onClick={handleToggle}
        aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        className="relative w-[52px] h-[28px] rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors duration-500"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, hsl(224 71% 10%), hsl(239 60% 18%))'
            : 'linear-gradient(135deg, hsl(220 30% 88%), hsl(218 35% 82%))',
          boxShadow: isDark
            ? 'inset 0 2px 6px hsl(0 0% 0% / 0.5), 0 0 0 1px hsl(239 60% 30% / 0.4)'
            : 'inset 0 2px 6px hsl(220 30% 60% / 0.25), 0 0 0 1px hsl(216 28% 78% / 0.8)',
        }}
      >
        {/* Inner groove */}
        <div
          className="absolute inset-0 rounded-full opacity-40"
          style={{
            background: isDark
              ? 'linear-gradient(to bottom, hsl(0 0% 0% / 0.3), transparent)'
              : 'linear-gradient(to bottom, hsl(220 30% 50% / 0.15), transparent)',
          }}
        />

        {/* Glossy top highlight */}
        <div
          className="absolute inset-x-1 top-0.5 h-[6px] rounded-full opacity-30"
          style={{
            background: 'linear-gradient(to bottom, hsl(0 0% 100% / 0.8), transparent)',
          }}
        />

        {/* Background icons */}
        <div className="absolute inset-0 flex items-center justify-between px-[7px] pointer-events-none">
          <Moon size={10} className={`transition-opacity duration-300 ${isDark ? 'opacity-60 text-primary' : 'opacity-20 text-muted-foreground'}`} />
          <Sun size={10} className={`transition-opacity duration-300 ${isDark ? 'opacity-20 text-muted-foreground' : 'opacity-70 text-warning'}`} />
        </div>

        {/* Thumb */}
        <motion.div
          layout
          animate={{ x: isDark ? 24 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-[3px] w-[22px] h-[22px] rounded-full flex items-center justify-center"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, hsl(230 30% 28%), hsl(240 40% 22%))'
              : 'linear-gradient(135deg, hsl(0 0% 100%), hsl(220 25% 94%))',
            boxShadow: isDark
              ? '0 2px 8px hsl(0 0% 0% / 0.5), 0 0 0 1px hsl(239 60% 40% / 0.3), inset 0 1px 1px hsl(0 0% 100% / 0.08)'
              : '0 2px 8px hsl(220 30% 40% / 0.25), 0 0 0 1px hsl(216 28% 80% / 0.6), inset 0 1px 1px hsl(0 0% 100% / 0.9)',
          }}
        >
          {/* Thumb glossy shine */}
          <div
            className="absolute inset-x-1 top-0.5 h-[5px] rounded-full opacity-50"
            style={{ background: 'linear-gradient(to bottom, hsl(0 0% 100% / 0.7), transparent)' }}
          />

          {/* Particle bursts */}
          {isAnimating && particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute inset-0 rounded-full pointer-events-none"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 2.5 + p.id * 0.5, opacity: 0 }}
              transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
              style={{
                background: isDark
                  ? 'radial-gradient(circle, hsl(239 80% 60% / 0.4) 0%, transparent 70%)'
                  : 'radial-gradient(circle, hsl(32 90% 55% / 0.4) 0%, transparent 70%)',
              }}
            />
          ))}

          {/* Icon */}
          <motion.div
            key={isDark ? 'moon' : 'sun'}
            initial={{ scale: 0.5, rotate: -30, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="relative z-10"
          >
            {isDark ? (
              <Moon size={11} className="text-primary" strokeWidth={2} />
            ) : (
              <Sun size={11} className="text-warning" strokeWidth={2} />
            )}
          </motion.div>
        </motion.div>
      </button>
    </div>
  );
}
