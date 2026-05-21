"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon, 
  User, 
  Moon, 
  Sun, 
  Laptop, 
  Bell, 
  Shield, 
  Building, 
  Save, 
  Check, 
  ExternalLink, 
  Lock,
  Loader2,
  MoonStar
} from "lucide-react";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"appearance" | "workspace" | "notifications" | "account">("appearance");

  // Form states
  const [workspaceName, setWorkspaceName] = useState("Kamoz Personal");
  const [workspaceSlug, setWorkspaceSlug] = useState("kamoz-personal");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Notification states
  const [notifications, setNotifications] = useState({
    emailInvites: true,
    taskReminders: true,
    priorityAlerts: false,
    weeklyDigest: true,
  });

  // Load initial settings from localStorage on client side
  useEffect(() => {
    setMounted(true);
    const savedName = localStorage.getItem("kamoz_workspace_name");
    const savedSlug = localStorage.getItem("kamoz_workspace_slug");
    const savedNotifications = localStorage.getItem("kamoz_notification_settings");

    if (savedName) setWorkspaceName(savedName);
    if (savedSlug) setWorkspaceSlug(savedSlug);
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSaveWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("saving");
    
    // Simulate API saving
    setTimeout(() => {
      localStorage.setItem("kamoz_workspace_name", workspaceName);
      localStorage.setItem("kamoz_workspace_slug", workspaceSlug);
      setSaveStatus("saved");
      
      setTimeout(() => {
        setSaveStatus("idle");
      }, 3000);
    }, 1000);
  };

  const handleToggleNotification = (key: keyof typeof notifications) => {
    const updated = {
      ...notifications,
      [key]: !notifications[key]
    };
    setNotifications(updated);
    localStorage.setItem("kamoz_notification_settings", JSON.stringify(updated));
  };

  if (!isLoaded || !mounted) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const tabs = [
    { id: "appearance", label: "Appearance", icon: MoonStar },
    { id: "workspace", label: "Workspace Settings", icon: Building },
    { id: "notifications", label: "Notification Preferences", icon: Bell },
    { id: "account", label: "Account & Safety", icon: Shield },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          Settings
        </h1>
        <p className="text-gray-500 text-sm dark:text-gray-400">
          Configure your workspace preferences, personal settings, and notification choices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 flex flex-col space-y-1 bg-white dark:bg-gray-900/40 p-2 rounded-2xl border dark:border-gray-800 h-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-98 text-left ${
                  isActive 
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 font-semibold" 
                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-850"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Content Panel */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* TAB: APPEARANCE */}
          {activeTab === "appearance" && (
            <Card className="rounded-2xl border-none shadow-sm dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="text-lg">Appearance & Theme</CardTitle>
                <CardDescription>
                  Personalize the visual presentation of Kamoz. Choose a look that suits your preference.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Theme option Light */}
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border text-center transition-all ${
                      theme === "light" 
                        ? "border-indigo-600 bg-indigo-50/20 dark:border-indigo-500 ring-2 ring-indigo-600/10" 
                        : "border-gray-150 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-850"
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 dark:bg-orange-950/30 dark:text-orange-400">
                      <Sun className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Light Mode</p>
                      <p className="text-[11px] text-gray-500">Perfect for daytime tasks</p>
                    </div>
                  </button>

                  {/* Theme option Dark */}
                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border text-center transition-all ${
                      theme === "dark" 
                        ? "border-indigo-600 bg-indigo-50/20 dark:border-indigo-500 ring-2 ring-indigo-600/10" 
                        : "border-gray-150 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-850"
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-400">
                      <Moon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Dark Mode</p>
                      <p className="text-[11px] text-gray-500">Easier on the eyes at night</p>
                    </div>
                  </button>

                  {/* Theme option System */}
                  <button
                    onClick={() => setTheme("system")}
                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border text-center transition-all ${
                      theme === "system" 
                        ? "border-indigo-600 bg-indigo-50/20 dark:border-indigo-500 ring-2 ring-indigo-600/10" 
                        : "border-gray-150 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-850"
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                      <Laptop className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">System Default</p>
                      <p className="text-[11px] text-gray-500">Syncs with system theme</p>
                    </div>
                  </button>
                </div>

                <div className="pt-4 border-t dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Compact Sidebar Layout</p>
                      <p className="text-xs text-gray-500">Optimize workspace screen real estate.</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none dark:bg-gray-800">
                      <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB: WORKSPACE */}
          {activeTab === "workspace" && (
            <Card className="rounded-2xl border-none shadow-sm dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="text-lg">Workspace Configuration</CardTitle>
                <CardDescription>
                  Modify the identity and slug of your main project environment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveWorkspace} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="ws-name" className="text-sm font-semibold">Workspace Name</Label>
                    <Input
                      id="ws-name"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="rounded-xl border-gray-150 focus-visible:ring-indigo-400 dark:bg-gray-950 dark:border-gray-800"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ws-slug" className="text-sm font-semibold">Workspace Url Slug</Label>
                    <div className="flex rounded-xl overflow-hidden shadow-sm border border-gray-150 dark:border-gray-800 focus-within:ring-2 focus-within:ring-indigo-400">
                      <span className="bg-gray-55/60 dark:bg-gray-850 px-3 py-2 text-xs font-semibold text-gray-400 select-none flex items-center border-r dark:border-gray-800">
                        kamoz.app/workspaces/
                      </span>
                      <input
                        id="ws-slug"
                        value={workspaceSlug}
                        onChange={(e) => setWorkspaceSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                        className="bg-transparent px-3 py-2 text-sm focus:outline-none flex-1 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t dark:border-gray-800 flex justify-end">
                    <Button 
                      type="submit" 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 font-semibold"
                      disabled={saveStatus === "saving"}
                    >
                      {saveStatus === "saving" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving changes...
                        </>
                      ) : saveStatus === "saved" ? (
                        <>
                          <Check className="h-4 w-4" />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Workspace settings
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* TAB: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <Card className="rounded-2xl border-none shadow-sm dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="text-lg">Notification Preferences</CardTitle>
                <CardDescription>
                  Decide when you want to receive emails, alerts, and system notifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  
                  {/* Option 1 */}
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Workspace Invitation Alerts</p>
                      <p className="text-xs text-gray-500">Receive emails when members are invited to your workspace.</p>
                    </div>
                    <button 
                      onClick={() => handleToggleNotification("emailInvites")}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        notifications.emailInvites ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-850"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notifications.emailInvites ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>

                  {/* Option 2 */}
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Task Deadline Reminders</p>
                      <p className="text-xs text-gray-500">Trigger warnings for upcoming or overdue checklists.</p>
                    </div>
                    <button 
                      onClick={() => handleToggleNotification("taskReminders")}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        notifications.taskReminders ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-850"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notifications.taskReminders ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>

                  {/* Option 3 */}
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Critical Priority Notifications</p>
                      <p className="text-xs text-gray-500">Notify instantly when tasks are marked high-priority.</p>
                    </div>
                    <button 
                      onClick={() => handleToggleNotification("priorityAlerts")}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        notifications.priorityAlerts ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-850"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notifications.priorityAlerts ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>

                  {/* Option 4 */}
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Weekly Progress Digest</p>
                      <p className="text-xs text-gray-500">Get a summary report of finished project tasks every Monday.</p>
                    </div>
                    <button 
                      onClick={() => handleToggleNotification("weeklyDigest")}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        notifications.weeklyDigest ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-850"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notifications.weeklyDigest ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB: ACCOUNT */}
          {activeTab === "account" && (
            <div className="space-y-6">
              {/* Account profile card */}
              <Card className="rounded-2xl border-none shadow-sm dark:bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-lg">User Security Credentials</CardTitle>
                  <CardDescription>
                    Review your account status and credentials secured by Clerk Identity.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {user ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-950/40">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 shadow-sm border border-gray-100 dark:border-gray-800">
                          <AvatarImage src={user.imageUrl} />
                          <AvatarFallback className="bg-indigo-600 text-white font-bold">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{user.fullName}</p>
                          <p className="text-xs text-gray-500">{user.primaryEmailAddress?.emailAddress}</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800 border-none dark:bg-emerald-950/50 dark:text-emerald-400 w-fit">
                        Secure Session Active
                      </Badge>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Please sign in to inspect your secure credentials.</p>
                  )}

                  <div className="space-y-4 pt-4 border-t dark:border-gray-800">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">Multi-Factor Authentication</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-400">MANAGED VIA CLERK</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">Active Sessions</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-400">1 CURRENT DEVICE</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Clerk settings callout */}
              <Card className="rounded-2xl border-none shadow-sm bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100/50 dark:border-indigo-900/50 border border-dashed text-center p-8">
                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                  Need to change your password or security setups?
                </p>
                <p className="text-xs text-gray-500 mt-1 mb-4">
                  Account changes are managed securely through your centralized Clerk user portal.
                </p>
                <button 
                  onClick={() => window.open('https://accounts.clerk.com/user', '_blank')}
                  className="text-sm font-bold text-indigo-700 dark:text-indigo-300 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                >
                  Configure Identity Settings
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
