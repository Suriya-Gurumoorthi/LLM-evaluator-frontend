import { Outlet, Link, useLocation } from "react-router";
import { useEffect } from "react";
import { Sparkles } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "@/app/components/ui/sidebar";

const BACKEND_BASE =
  new URL(
    import.meta.env.VITE_API_URL ?? "https://llm-evaluator-backend.onrender.com/api/v1"
  ).origin;
const HEALTH_URL = `${BACKEND_BASE}/health`;

const navItems = [
  { path: "/prompt-management", label: "Prompt Management", icon: Sparkles },
];

function NavLinks() {
  const location = useLocation();
  const { setOpenMobile, isMobile } = useSidebar();

  return (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <SidebarMenuItem key={item.path}>
            <SidebarMenuButton asChild isActive={isActive}>
              <Link
                to={item.path}
                onClick={() => isMobile && setOpenMobile(false)}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </>
  );
}

export function RootLayout() {
  // Wake up backend on free tier (Render, etc.) by pinging health endpoint on mount
  useEffect(() => {
    fetch(HEALTH_URL).catch(() => {
      // Fire-and-forget; we just want to wake the server
    });
  }, []);

  return (
    <SidebarProvider defaultOpen={false}>
      <Sidebar side="left" collapsible="offcanvas" className="border-r border-gray-200">
        <SidebarHeader className="border-b border-gray-200 p-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">LLM Evaluator</h1>
            <p className="text-xs text-gray-500 mt-0.5">Performance Dashboard</p>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavLinks />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="min-w-0">
        {/* Top bar with menu toggle - visible on all screen sizes */}
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-4 md:px-6">
          <SidebarTrigger
            className="-ml-1"
            aria-label="Toggle sidebar"
          />
          <span className="text-sm font-medium text-gray-600 md:sr-only">
            Menu
          </span>
        </header>

        {/* Main content - scrollable, mobile-friendly */}
        <main className="flex-1 overflow-auto min-h-0">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
