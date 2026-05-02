import { useState } from "react";
import { X, Wrench, Save, Trash2 } from "lucide-react";
import { Repair } from "@/types/repair";

interface RepairDetailModalProps {
  repair: Repair | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, data: Partial<Pick<Repair, "clientName" | "phone" | "deviceModel" | "problem">>) => void;
  onDelete: (id: string) => void;
}

const RepairDetailModal = ({ repair, open, onClose, onSave, onDelete }: RepairDetailModalProps) => {
  const [clientName, setClientName] = useState(repair?.clientName ?? "");
  const [phone, setPhone] = useState(repair?.phone ?? "");
  const [deviceModel, setDeviceModel] = useState(repair?.deviceModel ?? "");
  const [problem, setProblem] = useState(repair?.problem ?? "");
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // Sync local state when repair changes
  if (!open || !repair) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, boolean> = {};
    if (!clientName.trim()) newErrors.clientName = true;
    if (!phone.trim()) newErrors.phone = true;
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave(repair.id, {
      clientName: clientName.trim(),
      phone: phone.trim(),
      deviceModel: deviceModel.trim(),
      problem: problem.trim(),
    });
    onClose();
  };

  const statusLabel = repair.status === "in-progress" ? "En curso" : "Listo";
  const statusClass = repair.status === "in-progress"
    ? "bg-warning/15 text-warning border border-warning/20"
    : "bg-success/15 text-success border border-success/20";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-card rounded-t-3xl sm:rounded-2xl px-5 pt-6 pb-8 sm:p-7 shadow-xl animate-slide-up z-10 sm:mx-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <Wrench size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-card-foreground leading-tight">
                Editar Reparación
              </h2>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusClass}`}>
                {statusLabel}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-secondary p-2 rounded-lg"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="form-label">
              Nombre completo *
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => {
                setClientName(e.target.value);
                setErrors((p) => ({ ...p, clientName: false }));
              }}
              placeholder="Ej: María García"
              className={`form-input ${errors.clientName ? "form-input-error" : ""}`}
            />
            {errors.clientName && (
              <p className="text-xs text-destructive mt-1.5">Este campo es obligatorio</p>
            )}
          </div>

          <div>
            <label className="form-label">
              Teléfono *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setErrors((p) => ({ ...p, phone: false }));
              }}
              placeholder="+57 300 123 4567"
              className={`form-input ${errors.phone ? "form-input-error" : ""}`}
            />
            {errors.phone && (
              <p className="text-xs text-destructive mt-1.5">Este campo es obligatorio</p>
            )}
          </div>

          <div>
            <label className="form-label">
              Modelo del equipo
            </label>
            <input
              type="text"
              value={deviceModel}
              onChange={(e) => setDeviceModel(e.target.value)}
              placeholder="Ej: iPhone 13, Samsung Galaxy S22"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">
              Descripción del problema
            </label>
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Breve descripción del problema..."
              rows={3}
              className="form-input resize-none"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => { onDelete(repair.id); onClose(); }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
            >
              <Trash2 size={15} />
              Eliminar
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              <Save size={15} />
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RepairDetailModal;
