import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AuroraShaderProps {
  className?: string;
}

const AuroraShaderBackground = ({ className }: AuroraShaderProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Base dark background
      ctx.fillStyle = "#060818";
      ctx.fillRect(0, 0, w, h);

      // Animated aurora blobs using Canvas 2D (no WebGL needed)
      const blobs = [
        { x: 0.3 + 0.15 * Math.sin(t * 0.4), y: 0.4 + 0.1 * Math.cos(t * 0.3), r: 0.45, color: "rgba(30,40,180,0.18)" },
        { x: 0.7 + 0.1 * Math.cos(t * 0.5), y: 0.5 + 0.15 * Math.sin(t * 0.35), r: 0.4, color: "rgba(80,20,160,0.15)" },
        { x: 0.5 + 0.2 * Math.sin(t * 0.25), y: 0.3 + 0.12 * Math.cos(t * 0.45), r: 0.35, color: "rgba(20,60,200,0.13)" },
        { x: 0.2 + 0.1 * Math.cos(t * 0.6), y: 0.7 + 0.1 * Math.sin(t * 0.4), r: 0.3, color: "rgba(100,30,180,0.12)" },
      ];

      blobs.forEach(({ x, y, r, color }) => {
        const grd = ctx.createRadialGradient(x * w, y * h, 0, x * w, y * h, r * Math.max(w, h));
        grd.addColorStop(0, color);
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);
      });

      t += 0.008;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn("block w-full h-full", className)}
    />
  );
};

export default AuroraShaderBackground;
