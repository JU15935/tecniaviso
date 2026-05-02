import { Repair } from "@/types/repair";
import { Phone, Smartphone, Send, Pencil, Trash2 } from "lucide-react";
import { MessageSentIcon } from "@/components/ui/animated-repair-icons";

interface RepairCardProps {
  repair: Repair;
  onMarkDone: (id: string) => void;
  onDelete: (id: string) => void;
  onCardClick: () => void;
  index: number;
}

const RepairCard = ({ repair, onMarkDone, onDelete, onCardClick, index }: RepairCardProps) => {
  const isInProgress = repair.status === "in-progress";

  return (
    <div
      className="group app-card p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 animate-slide-up cursor-pointer"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both" }}
      onClick={onCardClick}
    >
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-card-foreground truncate text-sm sm:text-base">
              {repair.clientName}
            </h3>
            <Pencil size={12} className="text-muted-foreground/50 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs sm:text-sm text-muted-foreground">
            <Smartphone size={13} />
            <span className="truncate">{repair.deviceModel}</span>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 sm:px-2.5 py-0.5 text-xs font-medium shrink-0 ${
            isInProgress
              ? "bg-warning/15 text-warning"
              : "bg-success/15 text-success"
          }`}
        >
          {isInProgress ? "En curso" : "✓ Listo"}
        </span>
      </div>

      <p className="text-xs sm:text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
        {repair.problem}
      </p>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Phone size={12} />
          <span>{repair.phone}</span>
        </div>

        {isInProgress ? (
          <button
            onClick={(e) => { e.stopPropagation(); onMarkDone(repair.id); }}
            className="btn-primary py-1.5 sm:py-2 px-3 text-xs rounded-lg"
            style={{ boxShadow: "0 4px 12px -2px hsl(var(--primary) / 0.35)" }}
          >
            <Send size={12} />
            Listo → Avisar
          </button>
        ) : (
          <div className="inline-flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-success/10 px-2.5 sm:px-3 py-1.5 text-xs text-success font-medium">
              <MessageSentIcon size={16} className="text-success" />
              WhatsApp enviado
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(repair.id); }}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              aria-label="Eliminar reparación"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

};

export default RepairCard;
