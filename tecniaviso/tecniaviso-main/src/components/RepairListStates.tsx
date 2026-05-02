import { RefreshCw, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { WrenchIcon, CheckIcon, ToolboxIcon, AlertIcon } from "@/components/ui/animated-repair-icons";

// ─── Skeleton placeholder ────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="app-card p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-muted shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-2/5 rounded-full bg-muted" />
          <div className="h-3 w-3/5 rounded-full bg-muted" />
          <div className="h-3 w-1/4 rounded-full bg-muted mt-1" />
        </div>
        <div className="h-7 w-20 rounded-lg bg-muted shrink-0" />
      </div>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="grid gap-4 animate-fade-in">
      {[0, 1, 2].map((i) => (
        <SkeletonCard key={i} />
      ))}
      <p className="text-center text-xs text-muted-foreground pt-1">
        Cargando reparaciones…
      </p>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
interface EmptyStateProps {
  filter: "all" | "in-progress" | "done";
  onAdd: () => void;
}

const emptyConfig: Record<
  "all" | "in-progress" | "done",
  { title: string; sub: string; Icon: React.ComponentType<{ size?: number; className?: string }> }
> = {
  all: {
    title: "Aún no hay reparaciones",
    sub: "Registra la primera para empezar a avisar a tus clientes automáticamente.",
    Icon: ToolboxIcon,
  },
  "in-progress": {
    title: "Ningún equipo en reparación",
    sub: "Los equipos que aún no están listos aparecerán aquí.",
    Icon: WrenchIcon,
  },
  done: {
    title: "Ningún equipo listo para recoger",
    sub: "Cuando marques un equipo como listo, aparecerá aquí.",
    Icon: CheckIcon,
  },
};

export function EmptyState({ filter, onAdd }: EmptyStateProps) {
  const { title, sub, Icon } = emptyConfig[filter];
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 text-center gap-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
          filter === "in-progress"
            ? "bg-warning/10 text-warning"
            : filter === "done"
            ? "bg-success/10 text-success"
            : "bg-primary/10 text-primary"
        }`}
      >
        <Icon size={36} />
      </div>
      <div className="space-y-1 max-w-xs">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{sub}</p>
      </div>
      {filter === "all" && (
        <button
          onClick={onAdd}
          className="btn-primary mt-1 px-5 py-2.5 text-sm"
        >
          <Plus size={16} strokeWidth={2.5} />
          Nueva reparación
        </button>
      )}
    </motion.div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────
interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 text-center gap-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
        <AlertIcon size={36} />
      </div>
      <div className="space-y-1 max-w-xs">
        <p className="text-sm font-semibold text-foreground">Algo salió mal</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {message ?? "No pudimos cargar las reparaciones. Comprueba tu conexión e inténtalo de nuevo."}
        </p>
      </div>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
      >
        <RefreshCw size={14} />
        Reintentar
      </button>
    </motion.div>
  );
}
