"use client";

import { Search, Bell, Sun, Moon, Menu, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSidebarStore } from "@/lib/store/sidebar-store";
import { useSearchStore } from "@/lib/store/search-store";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser, SignOutButton, UserProfile } from "@clerk/nextjs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useReminderStore } from "@/lib/store/reminder-store";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function Topbar() {
  const router = useRouter();
  const { toggle } = useSidebarStore();
  const { query, setQuery } = useSearchStore();
  const { theme, setTheme } = useTheme();
  const { user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [taskRemindersEnabled, setTaskRemindersEnabled] = useState(true);

  const { reminders, toggleReminder } = useReminderStore();
  
  // Avoid hydration mismatch and load preferences
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("pronova_notification_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.taskReminders === false) {
          setTaskRemindersEnabled(false);
        }
      }
    } catch (e) {
      console.error("Failed to load topbar notification settings:", e);
    }
  }, []);

  const activeReminders = taskRemindersEnabled 
    ? reminders.filter(r => !r.isCompleted) 
    : [];

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-8 fixed top-0 right-0 left-0 lg:left-64 z-30 dark:bg-gray-950 dark:border-gray-800 transition-all">
      <div className="flex items-center gap-4 flex-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900"
          onClick={toggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="relative w-full max-w-96 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search projects and tasks..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 bg-gray-50 border-none focus-visible:ring-indigo-400 rounded-xl dark:bg-gray-900"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="relative flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900 transition-all cursor-pointer outline-none select-none">
            <Bell className="h-5 w-5" />
            {activeReminders.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-gray-950">
                {activeReminders.length}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-2xl p-2 max-h-[400px] overflow-y-auto">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm font-bold text-foreground">Reminders & Alerts</span>
              {activeReminders.length > 0 && (
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                  {activeReminders.length} Active
                </span>
              )}
            </div>
            <DropdownMenuSeparator />
            {activeReminders.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                {taskRemindersEnabled ? (
                  <>
                    <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2 opacity-80" />
                    All caught up! No active alerts.
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2 opacity-80" />
                    In-app reminders are currently muted.<br />
                    <span className="text-[11px] text-gray-400 mt-1.5 block">Enable them in Settings to receive alerts.</span>
                  </>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {activeReminders.slice(0, 5).map((r) => (
                  <div key={r.id} className="flex gap-3 py-2.5 px-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 rounded-xl transition-all">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleReminder(r.id);
                      }}
                      className="cursor-pointer mt-0.5 shrink-0"
                    >
                      <Circle className="h-4.5 w-4.5 text-gray-300 hover:text-indigo-500 transition-colors" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{r.title}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                        {r.date === new Date().toISOString().split('T')[0] ? "Today" : r.date} at {r.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <DropdownMenuSeparator />
            <Link href="/reminders">
              <div className="w-full text-center py-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors cursor-pointer">
                View all reminders
              </div>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {!mounted ? (
            <div className="h-5 w-5 animate-pulse bg-gray-200 rounded-full" />
          ) : theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full overflow-hidden border-2 border-transparent hover:border-indigo-100 transition-all outline-none">
            <Avatar size="lg">
              <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-500 text-white text-xs font-bold">
                {user?.firstName?.charAt(0) || "U"}{user?.lastName?.charAt(0) || ""}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-xl" align="end">
            <div className="flex flex-col space-y-1 p-3">
              <p className="text-sm font-medium leading-none text-foreground">{user?.fullName || "Guest User"}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.primaryEmailAddress?.emailAddress || "Guest"}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => setIsProfileOpen(true)}
            >
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => router.push("/settings")}
            >
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <SignOutButton>
              <DropdownMenuItem className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950">
                Log out
              </DropdownMenuItem>
            </SignOutButton>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-[940px] w-[90vw] p-0 border-none bg-transparent shadow-none [&>button]:text-gray-400 [&>button]:hover:text-gray-600 [&>button]:right-6 [&>button]:top-6 [&>button]:z-50 flex items-center justify-center">
          <UserProfile routing="hash" />
        </DialogContent>
      </Dialog>
    </header>
  );
}
