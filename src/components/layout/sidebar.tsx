"use client";

import Link from "next/link";
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckCircle2, 
  Users, 
  Settings,
  ChevronDown,
  Plus,
  Bell,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/lib/store/sidebar-store";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Projects", icon: Briefcase, href: "/projects" },
  { label: "My Tasks", icon: CheckCircle2, href: "/tasks", badge: 4 },
  { label: "Reminders", icon: Bell, href: "/reminders" },
  { label: "Team", icon: Users, href: "/team" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar() {
  const { isOpen, close } = useSidebarStore();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={close}
        />
      )}

      <aside className={cn(
        "fixed left-0 top-0 h-screen w-64 border-r bg-white flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 dark:bg-gray-950 dark:border-gray-800",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 border-bottom h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-lg dark:text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-sm">
              P
            </div>
            <span>PRONOVA</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden" onClick={close}>
              <X className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 hidden lg:flex">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => close()}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                "text-gray-600 hover:bg-gray-100 hover:text-indigo-600 group dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-indigo-400"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
              {item.badge && (
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:bg-gray-800 dark:text-gray-400">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t dark:border-gray-800">
          <div className="flex items-center justify-between mb-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Projects
            <Button variant="ghost" size="icon" className="h-4 w-4">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-1">
            {["Website Redesign", "Mobile App", "Marketing"].map((project) => (
              <Link
                key={project}
                href={`/projects/${project.toLowerCase().replace(" ", "-")}`}
                onClick={() => close()}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100 hover:text-indigo-600 transition-colors dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-indigo-400"
              >
                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                {project}
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}

