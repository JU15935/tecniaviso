import AuroraShaderBackground from "@/components/ui/animated-shader-background";
import { Zap, MessageCircle } from "lucide-react";

const HeroBanner = () => {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden mb-7" style={{ height: "180px" }}>
      {/* Shader canvas fills the container */}
      <div className="absolute inset-0">
        <AuroraShaderBackground />
      </div>

      {/* Overlay gradient for readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, hsl(239 84% 10% / 0.45), hsl(260 84% 15% / 0.3))",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center h-full px-6 py-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-success/25 text-success border border-success/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
            <Zap size={10} />
            Automático
          </span>
        </div>
        <h1 className="text-xl font-bold text-white leading-tight mb-1">
          Avisa a tus clientes
          <br />
          <span style={{ color: "hsl(239 100% 85%)" }}>sin escribir ni llamar</span>
        </h1>
        <p className="text-xs text-white/60 flex items-center gap-1 mt-1">
          <MessageCircle size={11} />
          WhatsApp automático cuando el equipo está listo
        </p>
      </div>
    </div>
  );
};

export default HeroBanner;
