import { useState } from "react";
import { X, Wrench, Phone } from "lucide-react";

interface NewRepairModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    clientName: string;
    phone: string;
    deviceModel: string;
    problem: string;
  }) => void;
}

// Validates that phone has a country code (starts with + or has 10+ digits)
function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-().]/g, "");
  return cleaned.startsWith("+") && cleaned.length >= 8;
}

const NewRepairModal = ({ open, onClose, onSave }: NewRepairModalProps) => {
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("+");
  const [deviceModel, setDeviceModel] = useState("");
  const [problem, setProblem] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!clientName.trim()) newErrors.clientName = "Este campo es obligatorio";
    if (!phone.trim() || phone === "+") {
      newErrors.phone = "Este campo es obligatorio";
    } else if (!isValidPhone(phone)) {
      newErrors.phone = "Incluye el código de país (ej: +57 300 123 4567)";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      clientName: clientName.trim(),
      phone: phone.trim(),
      deviceModel: deviceModel.trim(),
      problem: problem.trim(),
    });
    setClientName("");
    setPhone("+");
    setDeviceModel("");
    setProblem("");
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-card rounded-t-3xl sm:rounded-2xl px-5 pt-6 pb-8 sm:p-7 shadow-xl animate-slide-up z-10 sm:mx-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <Wrench size={18} className="text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-card-foreground">Nueva Reparación</h2>
          </div>
          <button onClick={onClose} className="btn-secondary p-2 rounded-lg">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre */}
          <div>
            <label className="form-label">Nombre completo *</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => { setClientName(e.target.value); setErrors((p) => ({ ...p, clientName: "" })); }}
              placeholder="Ej: María García"
              className={`form-input ${errors.clientName ? "form-input-error" : ""}`}
            />
            {errors.clientName && <p className="text-xs text-destructive mt-1.5">{errors.clientName}</p>}
          </div>

          {/* Teléfono con código de país */}
          <div>
            <label className="form-label flex items-center gap-1.5">
              <Phone size={13} />
              Teléfono WhatsApp *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                let val = e.target.value;
                if (!val.startsWith("+")) val = "+" + val.replace(/^\+*/, "");
                setPhone(val);
                setErrors((p) => ({ ...p, phone: "" }));
              }}
              placeholder="+57 300 123 4567"
              className={`form-input ${errors.phone ? "form-input-error" : ""}`}
            />
            {errors.phone
              ? <p className="text-xs text-destructive mt-1.5">{errors.phone}</p>
              : <p className="text-xs text-muted-foreground mt-1.5">
                  Incluye el código de país: Colombia +57 · México +52 · España +34 · EE.UU +1
                </p>
            }
          </div>

          {/* Modelo */}
          <div>
            <label className="form-label">Modelo del equipo</label>
            <input
              type="text"
              value={deviceModel}
              onChange={(e) => setDeviceModel(e.target.value)}
              placeholder="Ej: iPhone 13, Samsung Galaxy S22"
              className="form-input"
            />
          </div>

          {/* Problema */}
          <div>
            <label className="form-label">Descripción del problema</label>
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Breve descripción del problema..."
              rows={3}
              className="form-input resize-none"
            />
          </div>

          <button type="submit" className="btn-primary w-full mt-2">
            Guardar Reparación
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewRepairModal;
