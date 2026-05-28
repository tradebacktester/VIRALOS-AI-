import { Link, useLocation } from "wouter";
import { UserButton } from "@clerk/react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Video,
  FolderOpen,
  BarChart3,
  TrendingUp,
  Settings,
  Zap,
  Bot,
  Brain,
} from "lucide-react";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/create", label: "Create Video", icon: Video },
  { path: "/agents", label: "AI Agents", icon: Bot, badge: "AI" },
  { path: "/projects", label: "Projects", icon: FolderOpen },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/trends", label: "Trend Radar", icon: TrendingUp },
  { path: "/strategy", label: "Strategy", icon: Brain },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col border-r border-sidebar-border bg-sidebar">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-blue">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground tracking-wide">VIRALOS</p>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase">AI OS</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto" data-testid="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const active = location === item.path || location.startsWith(item.path + "/");
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path}>
                <motion.div
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm font-medium ${
                    active
                      ? "bg-primary/15 text-primary border border-primary/20"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? "text-primary" : ""}`} />
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-semibold tracking-wide">
                      {item.badge}
                    </span>
                  )}
                  {item.path === "/create" && !item.badge && (
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-semibold tracking-wide">NEW</span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-sidebar-border flex items-center gap-3">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate">My Workspace</p>
            <p className="text-[10px] text-muted-foreground">Pro Plan</p>
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
