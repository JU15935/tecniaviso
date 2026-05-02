import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CreditCard, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo-tecniaviso.png";

interface InactivePageProps {
  onSignOut: () => void;
}

export default function InactivePage({ onSignOut }: InactivePageProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "No se pudo iniciar el proceso de pago",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckSubscription = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      if (data?.subscribed) {
        toast({
          title: "¡Suscripción activa!",
          description: "Tu cuenta ha sido activada. Recarga la página.",
        });
        window.location.reload();
      } else {
        toast({
          title: "Sin suscripción",
          description: "Aún no se detecta una suscripción activa.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "No se pudo verificar la suscripción",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-3">
          <img src={logo} alt="TecniAviso" className="h-16 mx-auto" />
          <CardTitle className="text-xl flex items-center justify-center gap-2">
            <Clock size={20} className="text-warning" />
            Activa tu suscripción
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Para acceder a TecniAviso necesitas una suscripción activa. 
            El plan mensual tiene un costo de <strong className="text-foreground">$10 USD/mes</strong>.
          </p>

          <Button onClick={handleSubscribe} className="w-full gap-2" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard size={18} />}
            Suscribirme - $10 USD/mes
          </Button>

          <Button variant="outline" onClick={handleCheckSubscription} className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ya pagué, verificar suscripción"}
          </Button>

          <Button variant="ghost" onClick={onSignOut} className="w-full text-muted-foreground">
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
