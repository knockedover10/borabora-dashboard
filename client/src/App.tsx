import { Switch, Route, Router, Link, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/Dashboard";
import LuxuryHotel from "@/pages/LuxuryHotel";
import DesignerVillage from "@/pages/DesignerVillage";
import YachtClub from "@/pages/YachtClub";
import NotFound from "@/pages/not-found";
import {
  LayoutDashboard,
  Building2,
  Store,
  Anchor,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/luxury-hotel", label: "Luxury Hotel", icon: Building2 },
  { href: "/designer-village", label: "Designer Village", icon: Store },
  { href: "/yacht-club", label: "Yacht Club", icon: Anchor },
];

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-label="Bora Bora Hub logo">
        <circle cx="16" cy="16" r="15" fill="hsl(187,72%,24%)" />
        {/* Wave lines */}
        <path d="M5 18 Q8.5 14 12 18 Q15.5 22 19 18 Q22.5 14 27 18" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <path d="M5 21.5 Q8.5 17.5 12 21.5 Q15.5 25.5 19 21.5 Q22.5 17.5 27 21.5" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5"/>
        {/* Mountain peak */}
        <path d="M11 18 L16 7 L21 18" fill="white" opacity="0.9"/>
      </svg>
      <div>
        <div className="text-sm font-bold text-sidebar-foreground leading-tight">Bora Bora Hub</div>
        <div className="text-xs text-sidebar-foreground/50 leading-tight">Vaitape Luxury Integrated Hub</div>
      </div>
    </div>
  );
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [location] = useHashLocation();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-60 bg-sidebar flex flex-col z-30 transition-transform duration-200",
          "lg:relative lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ background: "hsl(var(--sidebar-background))" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-sidebar-border">
          <Logo />
          <button className="lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/40 px-3 mb-3">
            Sections
          </p>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = location === href || (href !== "/" && location.startsWith(href));
            return (
              <Link key={href} href={href}>
                <a
                  onClick={onClose}
                  data-testid={`nav-${label.toLowerCase().replace(/ /g, "-")}`}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                    active
                      ? "bg-sidebar-accent text-sidebar-primary font-semibold"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <Icon size={16} />
                  {label}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/40">Municipality of Bora Bora</p>
          <p className="text-xs text-sidebar-foreground/30">Confidential — Internal Use</p>
        </div>
      </aside>
    </>
  );
}

function Header({ onMenuClick, dark, onToggleDark }: { onMenuClick: () => void; dark: boolean; onToggleDark: () => void }) {
  const [location] = useHashLocation();
  const page = navItems.find(n => n.href === location || (n.href !== "/" && location.startsWith(n.href)))?.label ?? "Dashboard";

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b bg-card/80 backdrop-blur-sm border-border">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-md hover:bg-muted text-muted-foreground"
          data-testid="menu-toggle"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base font-semibold text-foreground">{page}</h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden sm:block text-xs text-muted-foreground">
          Updated: {new Date().toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" })}
        </span>
        <button
          onClick={onToggleDark}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
          data-testid="theme-toggle"
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          dark={dark}
          onToggleDark={() => setDark(d => !d)}
        />
        <main className="flex-1 overflow-y-auto overscroll-contain p-5 lg:p-7">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/luxury-hotel" component={LuxuryHotel} />
            <Route path="/designer-village" component={DesignerVillage} />
            <Route path="/yacht-club" component={YachtClub} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router hook={useHashLocation}>
        <AppShell />
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}
