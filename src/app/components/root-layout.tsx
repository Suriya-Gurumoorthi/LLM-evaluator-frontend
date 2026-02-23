import { Outlet, Link, useLocation } from "react-router";
import { useEffect } from "react";
import { Sparkles } from "lucide-react";
// Icons for commented nav items: BarChart3, FileText, GitCompare, LayoutDashboard, Activity

const BACKEND_BASE =
  new URL(
    import.meta.env.VITE_API_URL ?? "https://llm-evaluator-backend.onrender.com/api/v1"
  ).origin;
const HEALTH_URL = `${BACKEND_BASE}/health`;

export function RootLayout() {
  const location = useLocation();

  // Wake up backend on free tier (Render, etc.) by pinging health endpoint on mount
  useEffect(() => {
    fetch(HEALTH_URL).catch(() => {
      // Fire-and-forget; we just want to wake the server
    });
  }, []);
  
  const navItems = [
    // Temporarily commented out - keeping only Prompt Management
    // { path: "/", label: "Overview", icon: LayoutDashboard },
    // { path: "/tracing", label: "Tracing", icon: Activity },
    // { path: "/comparison", label: "Comparison", icon: GitCompare },
    // { path: "/evaluation-details", label: "Evaluations", icon: FileText },
    // { path: "/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/prompt-management", label: "Prompt Management", icon: Sparkles },
  ];
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-xl font-semibold text-gray-900">LLM Evaluator</h1>
          <p className="text-sm text-gray-500 mt-1">Performance Dashboard</p>
        </div>
        
        <nav className="px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}