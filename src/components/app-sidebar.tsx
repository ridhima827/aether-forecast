import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Sparkles,
  Globe2,
  LineChart,
  AlertTriangle,
  Wind,
  Leaf,
  Bot,
  Newspaper,
  FileBarChart,
  Settings,
  Info,
  Cloud,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/predictions", label: "Predictions", icon: Sparkles },
  { to: "/map", label: "Global Map", icon: Globe2 },
  { to: "/analytics", label: "Analytics", icon: LineChart },
  { to: "/alerts", label: "Disaster Alerts", icon: AlertTriangle },
  { to: "/air-quality", label: "Air Quality", icon: Wind },
  { to: "/carbon", label: "Carbon Tracking", icon: Leaf },
  { to: "/assistant", label: "AI Assistant", icon: Bot },
  { to: "/news", label: "Weather News", icon: Newspaper },
  { to: "/reports", label: "Reports", icon: FileBarChart },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/about", label: "About", icon: Info },
] as const;

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex h-full flex-col">
      <Link
        to="/"
        onClick={onNavigate}
        className="flex items-center gap-3 px-5 py-6 border-b border-border/40"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-aurora blur-xl opacity-60 rounded-full" />
          <div className="relative h-10 w-10 rounded-xl bg-aurora flex items-center justify-center">
            <Cloud className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
        </div>
        <div>
          <div className="font-display font-bold text-lg leading-none">Aether</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
            Climate AI
          </div>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-1">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || (to !== "/dashboard" && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                "hover:bg-sidebar-accent",
                active
                  ? "bg-sidebar-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-aurora glow-cyan"
                />
              )}
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  active ? "text-primary" : "group-hover:text-primary",
                )}
              />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-2xl glass p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Live · Open-Meteo
        </div>
        <div className="text-xs text-muted-foreground">
          AI engine analyzing 11 atmospheric variables across global stations.
        </div>
      </div>
    </div>
  );
}

export function AppSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 h-10 w-10 rounded-xl glass-strong flex items-center justify-center"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 z-30">
        <div className="m-4 flex-1 glass-strong rounded-3xl shadow-elevated overflow-hidden">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-background/70 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 glass-strong"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 h-9 w-9 rounded-lg hover:bg-sidebar-accent flex items-center justify-center"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
