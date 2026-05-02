import { useState } from "react";
import { Plus, Bot } from "lucide-react";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";
import { useToast } from "@/hooks/use-toast";
import { useRepairs } from "@/hooks/useRepairs";
import RepairCard from "@/components/RepairCard";
import NewRepairModal from "@/components/NewRepairModal";
import ConfirmDoneModal from "@/components/ConfirmDoneModal";
import RepairDetailModal from "@/components/RepairDetailModal";
import { SplineHeroCard } from "@/components/SplineHeroCard";
import AppLayout from "@/components/AppLayout";
import { useDarkMode } from "@/hooks/useDarkMode";
import { Repair } from "@/types/repair";
import { LoadingState, EmptyState, ErrorState } from "@/components/RepairListStates";

type Filter = "all" | "in-progress" | "done";

// Builds WhatsApp URL — works for any country
// The phone number must include the country code (e.g. +57, +1, +34)
function buildWhatsAppURL(phone: string, clientName: string, deviceModel: string): string {
  // Remove everything except digits and leading +
  const cleaned = phone.trim().replace(/[\s\-().]/g, "");
  // Remove leading + for wa.me (it uses plain numbers)
  const normalized = cleaned.startsWith("+") ? cleaned.slice(1) : cleaned;

  const message =
    `¡Hola ${clientName}! 👋\n\n` +
    `Te informamos que tu equipo *${deviceModel || "equipo"}* ya está *listo para recoger* 🎉\n\n` +
    `Puedes pasar a retirarlo cuando gustes.\n\n` +
    `_TecniAviso – Servicio Técnico_`;

  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

const Index = () => {
  const { repairs, loading, error, retry, addRepair, markAsDone, updateRepair, deleteRepair } = useRepairs();
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const { toast } = useToast();
  useDarkMode();

  const [confirmRepair, setConfirmRepair] = useState<Repair | null>(null);
  const [detailRepair, setDetailRepair] = useState<Repair | null>(null);

  const filtered = repairs.filter((r) =>
    filter === "all" ? true : r.status === filter
  );

  const handleRequestDone = (id: string) => {
    const repair = repairs.find((r) => r.id === id);
    if (repair) setConfirmRepair(repair);
  };

  const handleConfirmDone = () => {
    if (!confirmRepair) return;

    markAsDone(confirmRepair.id);

    const whatsappURL = buildWhatsAppURL(
      confirmRepair.phone,
      confirmRepair.clientName,
      confirmRepair.deviceModel
    );
    window.open(whatsappURL, "_blank");

    confetti({
      particleCount: 60,
      spread: 55,
      origin: { y: 0.7 },
      colors: ["#6366f1", "#22c55e", "#f59e0b"],
    });

    toast({
      title: "✅ WhatsApp listo para enviar",
      description: `Se abrió WhatsApp para ${confirmRepair.clientName}. Solo toca Enviar.`,
    });

    setConfirmRepair(null);
  };

  const inProgressCount = repairs.filter((r) => r.status === "in-progress").length;
  const doneCount = repairs.filter((r) => r.status === "done").length;

  return (
    <AppLayout
      filter={filter}
      onFilterChange={setFilter}
      inProgressCount={inProgressCount}
      doneCount={doneCount}
    >
      <SplineHeroCard />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : filtered.length === 0 ? (
        <EmptyState filter={filter} onAdd={() => setModalOpen(true)} />
      ) : (
        <div className="grid gap-3 animate-fade-in pb-24">
          {filtered.map((repair, i) => (
            <RepairCard
              key={repair.id}
              repair={repair}
              onMarkDone={handleRequestDone}
              onDelete={(id) => deleteRepair(id)}
              onCardClick={() => setDetailRepair(repair)}
              index={i}
            />
          ))}
        </div>
      )}

      <Link
        to="/ai"
        aria-label="Asistente IA"
        className="fixed bottom-5 left-4 sm:bottom-6 sm:left-6 z-40 flex items-center justify-center w-12 h-12 sm:w-auto sm:h-auto sm:px-4 sm:py-3 rounded-2xl bg-secondary text-secondary-foreground shadow-xl hover:bg-accent active:scale-95 transition-all"
      >
        <Bot size={20} strokeWidth={2.2} />
        <span className="hidden sm:inline ml-2 text-sm font-semibold">Asistente IA</span>
      </Link>

      <button
        onClick={() => setModalOpen(true)}
        aria-label="Nueva reparación"
        className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 btn-primary rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 text-sm font-semibold shadow-2xl active:scale-95 transition-transform"
        style={{ boxShadow: "0 8px 32px -4px hsl(var(--primary) / 0.55)" }}
      >
        <Plus size={18} strokeWidth={2.5} />
        <span className="hidden xs:inline sm:inline">Nueva reparación</span>
        <span className="xs:hidden sm:hidden">Nueva</span>
      </button>

      <NewRepairModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={addRepair}
      />
      <ConfirmDoneModal
        open={!!confirmRepair}
        clientName={confirmRepair?.clientName ?? ""}
        phone={confirmRepair?.phone ?? ""}
        onConfirm={handleConfirmDone}
        onCancel={() => setConfirmRepair(null)}
      />
      <RepairDetailModal
        open={!!detailRepair}
        repair={detailRepair}
        onClose={() => setDetailRepair(null)}
        onSave={updateRepair}
        onDelete={(id) => { deleteRepair(id); setDetailRepair(null); }}
      />
    </AppLayout>
  );
};

export default Index;
