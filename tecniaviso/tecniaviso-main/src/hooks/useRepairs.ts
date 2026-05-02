import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Repair } from "@/types/repair";

export function useRepairs() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRepairs([]);
        setLoading(false);
        return;
      }
      const { data, error: fetchError } = await supabase
        .from("repairs")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setRepairs(
        (data ?? []).map((r) => ({
          id: r.id,
          clientName: r.client_name,
          phone: r.phone,
          deviceModel: r.device_model,
          problem: r.problem,
          status: r.status as Repair["status"],
          createdAt: r.created_at,
        }))
      );
    } catch {
      setError("No se pudieron cargar las reparaciones.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addRepair = async (repair: Omit<Repair, "id" | "status" | "createdAt">) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error: insertError } = await supabase
      .from("repairs")
      .insert({
        user_id: user.id,
        client_name: repair.clientName,
        phone: repair.phone,
        device_model: repair.deviceModel,
        problem: repair.problem,
      })
      .select()
      .single();

    if (insertError || !data) {
      console.error("Error adding repair:", insertError);
      return;
    }

    setRepairs((prev) => [
      {
        id: data.id,
        clientName: data.client_name,
        phone: data.phone,
        deviceModel: data.device_model,
        problem: data.problem,
        status: data.status as Repair["status"],
        createdAt: data.created_at,
      },
      ...prev,
    ]);
  };

  const markAsDone = async (id: string) => {
    const { error: updateError } = await supabase
      .from("repairs")
      .update({ status: "done" })
      .eq("id", id);

    if (updateError) {
      console.error("Error marking as done:", updateError);
      return;
    }

    setRepairs((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "done" as const } : r))
    );
  };

  const updateRepair = async (
    id: string,
    data: Partial<Pick<Repair, "clientName" | "phone" | "deviceModel" | "problem">>
  ) => {
    const updateData: Record<string, string> = {};
    if (data.clientName !== undefined) updateData.client_name = data.clientName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.deviceModel !== undefined) updateData.device_model = data.deviceModel;
    if (data.problem !== undefined) updateData.problem = data.problem;

    const { error: updateError } = await supabase
      .from("repairs")
      .update(updateData)
      .eq("id", id);

    if (updateError) {
      console.error("Error updating repair:", updateError);
      return;
    }

    setRepairs((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...data } : r))
    );
  };

  const deleteRepair = async (id: string) => {
    const { error: deleteError } = await supabase
      .from("repairs")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting repair:", deleteError);
      return;
    }

    setRepairs((prev) => prev.filter((r) => r.id !== id));
  };

  return { repairs, loading, error, retry: load, addRepair, markAsDone, updateRepair, deleteRepair };
}
