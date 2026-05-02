import { useState } from "react";
import { Wrench, Clock, CheckCircle2, MessageCircle, Bot, Brain, Shield, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from "@/assets/logo-tecniaviso.png";


type Filter = "all" | "in-progress" | "done";

const navItems: { label: string; sublabel: string; value: Filter; icon: React.ElementType }[] = [
  { label: "Todas", sublabel: "Ver todas las reparaciones", value: "all", icon: Wrench },
  { label: "En Reparación", sublabel: "Equipos en proceso", value: "in-progress", icon: Clock },
  { label: "Listas para recoger", sublabel: "Clientes por notificar", value: "done", icon: CheckCircle2 },
];

interface SideNavProps {
  filter: Filter;
  onFilterChange: (v: Filter) => void;
  inProgressCount: number;
  doneCount: number;
  onClose?: () => void;
}

function SideNav({ filter, onFilterChange, inProgressCount, doneCount, onClose }: SideNavProps) {
  const counts: Record<Filter, number | null> = {
    all: inProgressCount + doneCount,
    "in-progress": inProgressCount,
    done: doneCount,
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-5">
        {/* Brand in sidebar */}
        <div className="flex items-center gap-2 mb-7">
          <MessageCircle size={18} className="text-primary" />
          <span className="text-sm font-semibold text-foreground">TecniAviso</span>
        </div>

        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">
          Reparaciones
        </p>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = filter === item.value;
            const count = counts[item.value];
            return (
              <button
                key={item.value}
                onClick={() => {
                  onFilterChange(item.value);
                  onClose?.();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon size={16} className="shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {count !== null && count > 0 && (
                  <span
                    className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold min-w-[18px] ${
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : item.value === "in-progress"
                        ? "bg-warning/15 text-warning"
                        : "bg-success/15 text-success"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <SideNavExtra onClose={onClose} />
      </div>
    </ScrollArea>
  );
}

function SideNavExtra({ onClose }: { onClose?: () => void }) {
  const { isAdmin, signOut } = useAuth();

  return (
    <div className="mt-8 pt-6 border-t border-border space-y-1">
      <Link
        to="/ai"
        onClick={() => onClose?.()}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
      >
        <Bot size={16} className="shrink-0" />
        <span>Asistente IA</span>
      </Link>
      <Link
        to="/knowledge"
        onClick={() => onClose?.()}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
      >
        <Brain size={16} className="shrink-0" />
        <span>Configurar IA</span>
      </Link>
      {isAdmin && (
        <Link
          to="/admin"
          onClick={() => onClose?.()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
        >
          <Shield size={16} className="shrink-0" />
          <span>Panel Admin</span>
        </Link>
      )}
      <button
        onClick={() => { signOut(); onClose?.(); }}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
      >
        <LogOut size={16} className="shrink-0" />
        <span>Cerrar sesión</span>
      </button>
    </div>
  );
}


interface AppLayoutProps {
  children: React.ReactNode;
  filter: Filter;
  onFilterChange: (v: Filter) => void;
  inProgressCount: number;
  doneCount: number;
}

export function AppLayout({
  children,
  filter,
  onFilterChange,
  inProgressCount,
  doneCount,
}: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-lg h-14 flex items-center px-3 sm:px-4 justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile burger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8 shrink-0 group"
                aria-expanded={mobileOpen}
                aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              >
                <svg
                  className="pointer-events-none"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path
                    d="M4 12L20 12"
                    className="origin-center -translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                  />
                </svg>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-card border-r border-border">
              <SideNav
                filter={filter}
                onFilterChange={onFilterChange}
                inProgressCount={inProgressCount}
                doneCount={doneCount}
                onClose={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>

          {/* Desktop sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen((v) => !v)}
            className="hidden md:flex h-8 w-8 shrink-0 group"
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? "Ocultar menú" : "Mostrar menú"}
          >
            <svg
              className="pointer-events-none"
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                d="M4 12L20 12"
                className="origin-center -translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
              />
              <path
                d="M4 12H20"
                className="origin-center transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
              />
              <path
                d="M4 12H20"
                className="origin-center translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
              />
            </svg>
          </Button>

          <img src={logo} alt="TecniAviso" className="h-10 sm:h-14 w-auto drop-shadow-sm shrink-0" />
        </div>

        {/* Header counters */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="flex items-center gap-1 sm:gap-1.5 rounded-full bg-warning/10 px-2 sm:px-2.5 py-1 text-xs font-medium text-warning">
            <span>{inProgressCount}</span>
            <span className="hidden sm:inline">en curso</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 rounded-full bg-success/10 px-2 sm:px-2.5 py-1 text-xs font-medium text-success">
            <span>{doneCount}</span>
            <span className="hidden sm:inline">listas</span>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar — desktop only */}
        <div
          className={`hidden md:flex flex-col border-r border-border bg-sidebar transition-all duration-300 overflow-hidden shrink-0 ${
            sidebarOpen ? "w-60" : "w-0"
          }`}
        >
          <SideNav
            filter={filter}
            onFilterChange={onFilterChange}
            inProgressCount={inProgressCount}
            doneCount={doneCount}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-hidden min-w-0">
          <ScrollArea className="h-[calc(100vh-3.5rem)]">
            <div className="w-full max-w-3xl mx-auto px-3 sm:px-5 pb-28 pt-4 sm:pt-6">
              {children}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
