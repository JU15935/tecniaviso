import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Shield, UserCheck, UserX, Users, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo-tecniaviso.png";

interface TechnicianProfile {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminPage() {
  const [technicians, setTechnicians] = useState<TechnicianProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTechnicians = useCallback(async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setTechnicians(data || []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchTechnicians();
  }, [fetchTechnicians]);

  const toggleActive = async (userId: string, currentlyActive: boolean) => {
    setToggling(userId);
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: !currentlyActive, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: currentlyActive ? "Usuario desactivado" : "Usuario activado",
        description: currentlyActive
          ? "El técnico ya no podrá acceder a la aplicación."
          : "El técnico ahora puede usar la aplicación.",
      });
      fetchTechnicians();
    }
    setToggling(null);
  };

  const deleteTechnician = async (userId: string, name: string) => {
    setToggling(userId);
    const { error: rolesErr } = await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error: profileErr } = await supabase.from("profiles").delete().eq("id", userId);

    const err = rolesErr || profileErr;
    if (err) {
      toast({ title: "Error al eliminar", description: err.message, variant: "destructive" });
    } else {
      toast({ title: "Técnico eliminado", description: `${name || "Usuario"} ha sido eliminado del sistema.` });
      fetchTechnicians();
    }
    setToggling(null);
  };

  const activeCount = technicians.filter((t) => t.is_active).length;
  const inactiveCount = technicians.filter((t) => !t.is_active).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-lg h-14 flex items-center px-4 gap-3">
        <Link to="/">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <img src={logo} alt="TecniAviso" className="h-10 w-auto" />
        <div className="flex items-center gap-1.5 ml-2">
          <Shield size={16} className="text-primary" />
          <span className="text-sm font-semibold">Panel Admin</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <Users size={20} className="mx-auto text-muted-foreground mb-1" />
              <p className="text-2xl font-bold">{technicians.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <UserCheck size={20} className="mx-auto text-success mb-1" />
              <p className="text-2xl font-bold text-success">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Activos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <UserX size={20} className="mx-auto text-destructive mb-1" />
              <p className="text-2xl font-bold text-destructive">{inactiveCount}</p>
              <p className="text-xs text-muted-foreground">Inactivos</p>
            </CardContent>
          </Card>
        </div>

        {/* Technician list */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Técnicos registrados</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[60vh]">
              {loading ? (
                <div className="p-6 text-center text-muted-foreground text-sm">Cargando...</div>
              ) : technicians.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  No hay técnicos registrados aún.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {technicians.map((tech) => (
                    <div
                      key={tech.id}
                      className="flex items-center justify-between px-4 py-3 gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {tech.full_name || "Sin nombre"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{tech.email}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Registrado: {new Date(tech.created_at).toLocaleDateString("es")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant={tech.is_active ? "default" : "secondary"}
                          className={tech.is_active ? "bg-success text-success-foreground" : ""}
                        >
                          {tech.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                        <Button
                          size="sm"
                          variant={tech.is_active ? "destructive" : "default"}
                          onClick={() => toggleActive(tech.id, tech.is_active)}
                          disabled={toggling === tech.id}
                          className="text-xs"
                        >
                          {tech.is_active ? "Desactivar" : "Activar"}
                        </Button>
                        {!tech.is_active && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                                disabled={toggling === tech.id}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar técnico?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Se eliminará permanentemente a <strong>{tech.full_name || tech.email}</strong> del sistema. Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteTechnician(tech.id, tech.full_name)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
