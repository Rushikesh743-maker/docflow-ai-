import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Image,
  Minimize2,
  PenTool,
  FolderOpen,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Camera,
  Wand2,
  ArrowRightLeft,
  Layers,
  ScanLine,
  Droplets,
  Crop,
  Clock,
  GraduationCap,
  Bot,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "General",
    items: [
      { path: "/", label: "Dashboard", icon: Wand2 },
      { path: "/smart-mode", label: "Smart Mode", icon: Wand2, badge: "AI" },
    ],
  },
  {
    label: "PDF Tools",
    items: [
      { path: "/pdf-tools", label: "Merge / Split / Rotate", icon: FileText },
      { path: "/pdf-watermark", label: "Watermark", icon: Droplets },
      { path: "/pdf-page-numbers", label: "Page Numbers", icon: ScanLine },
    ],
  },
  {
    label: "Image Tools",
    items: [
      { path: "/image-tools", label: "Image → PDF", icon: Image },
      { path: "/image-editor", label: "Image Editor", icon: Crop },
      { path: "/image-converter", label: "Format Converter", icon: ArrowRightLeft },
    ],
  },
  {
    label: "Utilities",
    items: [
      { path: "/compress", label: "Compress", icon: Minimize2 },
      { path: "/batch", label: "Batch Processing", icon: Layers },
      { path: "/scanner", label: "Camera Scanner", icon: Camera },
      { path: "/signature", label: "Signature", icon: PenTool },
      { path: "/assignment", label: "Assignment Mode", icon: GraduationCap },
    ],
  },
  {
    label: "System",
    items: [
      { path: "/history", label: "Time Machine", icon: Clock },
      { path: "/documents", label: "My Documents", icon: FolderOpen },
    ],
  },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const location = useLocation();

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 flex-shrink-0 border-r border-sidebar-border bg-sidebar transition-transform duration-300 lg:translate-x-0 overflow-y-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <span className="text-lg font-bold text-foreground tracking-tight">DocOS</span>
              <span className="text-[10px] ml-1 px-1.5 py-0.5 rounded-full gradient-accent text-accent-foreground font-bold">ULTRA</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {navGroups.map((group) => {
            const isCollapsed = collapsedGroups[group.label];

            return (
              <div key={group.label}>
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  {group.label}
                  <ChevronDown className={`w-3 h-3 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
                </button>
                {!isCollapsed && (
                  <div className="space-y-0.5 mt-0.5">
                    {group.items.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          }`}
                        >
                          <item.icon className={`w-[16px] h-[16px] ${isActive ? "text-primary" : ""}`} />
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full gradient-accent text-accent-foreground font-bold">{item.badge}</span>
                          )}
                          {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary opacity-60" />}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4">
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-xs font-medium text-foreground">🔒 Privacy First</p>
            <p className="text-xs text-muted-foreground mt-1">
              Files processed locally. Auto-deleted after session.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b border-border bg-background/80 backdrop-blur-xl lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-muted">
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">DocOS Ultra</span>
          </div>
        </header>
        <div className="p-4 md:p-8 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default AppLayout;
