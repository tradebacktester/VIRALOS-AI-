import { useState } from "react";
import { Link, useLocation } from "wouter";
import { UserButton } from "@clerk/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Video, FolderOpen, BarChart3, TrendingUp,
  Settings, Zap, Bot, Brain, Cpu, Database, Upload, FlaskConical,
  CalendarDays, Lightbulb, DollarSign, ChevronDown, ChevronRight,
} from "lucide-react";

const NAV_GROUPS = [
  {
    label: "Command",
    items: [
      { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { path: "/command", label: "JARVIS", icon: Cpu, badge: "AI" },
    ],
  },
  {
    label: "Create",
    items: [
      { path: "/create", label: "Create Video", icon: Video, badge: "NEW" },
      { path: "/agents", label: "Agent Studio", icon: Bot },
      { path: "/strategy", label: "Strategy", icon: Brain },
      { path: "/calendar", label: "Content Calendar", icon: CalendarDays },
    ],
  },
  {
    label: "Grow",
    items: [
      { path: "/publisher", label: "Auto Publisher", icon: Upload },
      { path: "/ab-testing", label: "A/B Testing", icon: FlaskConical },
      { path: "/trends", label: "Trend Radar", icon: TrendingUp },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { path: "/insights", label: "Self-Learning", icon: Lightbulb },
      { path: "/memory", label: "Memory Vault", icon: Database },
      { path: "/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Revenue",
    items: [
      { path: "/monetization", label: "Monetization", icon: DollarSign },
      { path: "/projects", label: "Projects", icon: FolderOpen },
      { path: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleGroup = (label: string) =>
    setCollapsed((p) => ({ ...p, [label]: !p[label] }));

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col border-r border-sidebar-border bg-sidebar">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-blue relative">
              <Zap className="w-4 h-4 text-white" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground tracking-wide">VIRALOS</p>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Autonomous AI Co.</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 overflow-y-auto" data-testid="sidebar-nav">
          {NAV_GROUPS.map((group) => {
            const isCollapsed = collapsed[group.label];
            return (
              <div key={group.label} className="mb-1">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
                >
                  {group.label}
                  {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-0.5 pb-1">
                        {group.items.map((item) => {
                          const active = location === item.path || location.startsWith(item.path + "/");
                          const Icon = item.icon;
                          return (
                            <Link key={item.path} href={item.path}>
                              <motion.div
                                whileHover={{ x: 2 }}
                                whileTap={{ scale: 0.98 }}
                                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm font-medium ${
                                  active
                                    ? "bg-primary/15 text-primary border border-primary/20"
                                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                                }`}
                              >
                                <Icon className={`w-4 h-4 shrink-0 ${active ? "text-primary" : ""}`} />
                                <span className="flex-1 truncate">{item.label}</span>
                                {item.badge && (
                                  <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded font-semibold tracking-wide ${
                                    item.badge === "AI" ? "bg-primary/20 text-primary"
                                    : item.badge === "NEW" ? "bg-emerald-400/15 text-emerald-400"
                                    : "bg-muted/50 text-muted-foreground"
                                  }`}>
                                    {item.badge}
                                  </span>
                                )}
                              </motion.div>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-2">
            <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-foreground truncate">My Workspace</p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">● All systems online</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1 mt-2">
            {[["Agents", "8"], ["Loop", "ON"], ["Posts", "Auto"]].map(([label, val]) => (
              <div key={label} className="text-center p-1.5 rounded-lg bg-muted/30">
                <p className="text-[10px] font-bold text-foreground">{val}</p>
                <p className="text-[9px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-auto">
        <motion.div
          key={location}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="h-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
