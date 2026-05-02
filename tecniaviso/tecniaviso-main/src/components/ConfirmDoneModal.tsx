import { MessageCircle, Zap, X } from "lucide-react";

interface ConfirmDoneModalProps {
  open: boolean;
  clientName: string;
  phone: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDoneModal = ({ open, clientName, phone, onConfirm, onCancel }: ConfirmDoneModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-sm bg-card rounded-t-3xl sm:rounded-2xl px-5 pt-6 pb-8 sm:p-7 shadow-xl animate-slide-up z-10 sm:mx-4">
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div
            className="flex items-center justify-center w-16 h-16 rounded-2xl"
            style={{ background: "linear-gradient(135deg, hsl(var(--success) / 0.15), hsl(var(--success) / 0.08))" }}
          >
            <MessageCircle size={30} className="text-success" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h2 className="text-base font-semibold text-card-foreground mb-2">
            ¿Confirmar aviso a {clientName}?
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Se enviará un mensaje de WhatsApp a{" "}
            <span className="font-medium text-foreground">{phone}</span> notificando que su equipo está listo para recoger.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="btn-primary w-full"
            style={{
              background: "linear-gradient(135deg, hsl(var(--success)), hsl(142 71% 38%))",
              boxShadow: "0 6px 24px -4px hsl(var(--success) / 0.4)",
            }}
          >
            <Zap size={15} />
            Sí, enviar WhatsApp
          </button>
          <button
            onClick={onCancel}
            className="btn-secondary w-full"
          >
            <X size={15} />
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDoneModal;
