import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isActive: boolean;
  isAdmin: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  session: null,
  isActive: false,
  isAdmin: false,
  loading: true,
};

export function useAuth() {
  const [state, setState] = useState<AuthState>(initialState);

  const fetchUserMeta = useCallback(async (userId: string) => {
    const [profileRes, roleRes] = await Promise.all([
      supabase.from("profiles").select("is_active").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);

    if (profileRes.error) throw profileRes.error;
    if (roleRes.error) throw roleRes.error;

    const isActive = profileRes.data?.is_active ?? false;
    const isAdmin = roleRes.data?.some((r) => r.role === "admin") ?? false;

    return { isActive, isAdmin };
  }, []);

  const applySession = useCallback((session: Session | null) => {
    if (!session?.user) {
      setState({ user: null, session: null, isActive: false, isAdmin: false, loading: false });
      return;
    }

    setState((prev) => {
      const userChanged = prev.user?.id !== session.user.id;
      return {
        user: session.user,
        session,
        isActive: userChanged ? false : prev.isActive,
        isAdmin: userChanged ? false : prev.isAdmin,
        loading: userChanged ? true : prev.loading,
      };
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    const authInitTimeout = window.setTimeout(() => {
      if (!isMounted) return;
      console.warn("Auth initialization timeout, forcing loading=false");
      setState((s) => ({ ...s, loading: false }));
    }, 8000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Avoid extra Supabase calls directly inside this callback
      applySession(session);
    });

    void supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!isMounted) return;
        applySession(session);
      })
      .catch((err) => {
        console.error("Error getting session:", err);
        if (!isMounted) return;
        setState({ user: null, session: null, isActive: false, isAdmin: false, loading: false });
      })
      .finally(() => {
        window.clearTimeout(authInitTimeout);
      });

    return () => {
      isMounted = false;
      window.clearTimeout(authInitTimeout);
      subscription.unsubscribe();
    };
  }, [applySession]);

  useEffect(() => {
    if (!state.user) return;

    let isMounted = true;
    const metaTimeout = window.setTimeout(() => {
      if (!isMounted) return;
      console.warn("User meta timeout, forcing loading=false");
      setState((s) => ({ ...s, loading: false }));
    }, 8000);

    void fetchUserMeta(state.user.id)
      .then((meta) => {
        if (!isMounted) return;
        setState((s) => ({ ...s, ...meta, loading: false }));
      })
      .catch((err) => {
        console.error("Error fetching user meta:", err);
        if (!isMounted) return;
        setState((s) => ({ ...s, isActive: false, isAdmin: false, loading: false }));
      })
      .finally(() => {
        window.clearTimeout(metaTimeout);
      });

    return () => {
      isMounted = false;
      window.clearTimeout(metaTimeout);
    };
  }, [fetchUserMeta, state.user]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { ...state, signOut };
}
