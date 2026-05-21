"use client";

import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  ArrowRight,
  FolderPlus,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { NewProjectModal } from "@/components/projects/new-project-modal";
import { useProjectStore } from "@/lib/store/project-store";
import { useTaskStore } from "@/lib/store/task-store";
import { useRouter } from "next/navigation";
import { TaskItem } from "@/components/dashboard/task-item";
import { useUser } from "@clerk/nextjs";

import { useSearchStore } from "@/lib/store/search-store";

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return "Just now";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const projects = useProjectStore((state) => state.projects);
  const { tasks, toggleTask } = useTaskStore();
  const { query, setQuery } = useSearchStore();
  const router = useRouter();

  const [workspaceName, setWorkspaceName] = useState("PRONOVA Personal");
  const { user } = useUser();

  useEffect(() => {
    const savedName = localStorage.getItem("pronova_workspace_name");
    if (savedName) {
      setWorkspaceName(savedName);
    }
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.description.toLowerCase().includes(query.toLowerCase())
  );

  const activeTasks = tasks.filter(t => t.status !== "Completed");
  const filteredTasks = activeTasks.filter(t => t.title.toLowerCase().includes(query.toLowerCase()));

  const overdueTasks = tasks.filter(t => t.dueDate && t.dueDate < todayStr && t.status !== "Completed");
  const filteredOverdue = overdueTasks.filter(t => t.title.toLowerCase().includes(query.toLowerCase()));

  const hasAnyResults = filteredProjects.length > 0 || filteredTasks.length > 0 || filteredOverdue.length > 0;

  // Construct recent activities dynamically
  const recentActivities: Array<{
    id: string;
    text: string;
    timestamp: number;
    icon: typeof CheckCircle2;
    iconClass: string;
  }> = [];

  // 1. Personal completed tasks
  const completedPersonalTasks = tasks.filter(t => t.status === "Completed");
  completedPersonalTasks.forEach(t => {
    recentActivities.push({
      id: `act-task-${t.id}`,
      text: `You completed the personal task "${t.title}"`,
      timestamp: t.createdAt || (Date.now() - 86400000),
      icon: CheckCircle2,
      iconClass: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
    });
  });

  // 2. Project creation & project-level tasks
  projects.forEach(p => {
    // Project creation activity
    recentActivities.push({
      id: `act-proj-create-${p.id}`,
      text: `You created the project "${p.name}"`,
      timestamp: p.createdAt || (Date.now() - 86400000 * 2),
      icon: Briefcase,
      iconClass: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
    });

    // Project completed/active tasks
    p.tasks.forEach(pt => {
      if (pt.status === "Done") {
        recentActivities.push({
          id: `act-proj-task-done-${p.id}-${pt.id}`,
          text: `You completed the project task "${pt.title}" in "${p.name}"`,
          timestamp: p.createdAt + 3600000 || (Date.now() - 3600000),
          icon: CheckCircle2,
          iconClass: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
        });
      } else if (pt.status === "In Progress") {
        recentActivities.push({
          id: `act-proj-task-ip-${p.id}-${pt.id}`,
          text: `You started the project task "${pt.title}" in "${p.name}"`,
          timestamp: p.createdAt + 1800000 || (Date.now() - 7200000),
          icon: Clock,
          iconClass: "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
        });
      }
    });
  });

  // Sort activities by timestamp descending
  recentActivities.sort((a, b) => b.timestamp - a.timestamp);

  // Fallback default activities if the list is too short or empty
  if (recentActivities.length === 0) {
    recentActivities.push({
      id: "fallback-1",
      text: `Welcome to your workspace "${workspaceName}"! Start by creating your first task or project.`,
      timestamp: Date.now() - 1800000,
      icon: Clock,
      iconClass: "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
    });
  }

  const displayedActivities = recentActivities.slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.firstName || "User"}
          </h1>
          <p className="text-muted-foreground text-sm">
            Here’s what’s happening with your workspace "{workspaceName}" today.
          </p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 border-none shadow-md transition-all active:scale-95 text-white cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {!hasAnyResults && query ? (
        <Card className="p-12 text-center rounded-2xl dark:bg-gray-900 border-none shadow-sm">
          <div className="h-16 w-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-4">
            <Search className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold">No results found</h3>
          <p className="text-gray-500 mt-1">We couldn't find anything matching "{query}"</p>
          <Button variant="ghost" className="mt-4" onClick={() => setQuery('')}>
            Clear Search
          </Button>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              label="Total Projects" 
              value={projects.length} 
              icon={Briefcase} 
            />
            <StatCard 
              label="Completed Projects" 
              value={projects.filter(p => p.status === 'Completed').length} 
              icon={CheckCircle2} 
            />
            <StatCard 
              label="My Tasks" 
              value={activeTasks.length} 
              icon={Clock} 
            />
            <StatCard 
              label="Overdue Tasks" 
              value={overdueTasks.length} 
              icon={AlertCircle} 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="rounded-xl border-none shadow-sm dark:bg-gray-900">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-foreground">Project Overview</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
                    onClick={() => router.push('/projects')}
                  >
                    View all <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {filteredProjects.length === 0 ? (
                    <EmptyState 
                      icon={FolderPlus}
                      title={query ? "No matching projects" : "No projects yet"}
                      description={query ? `Nothing found for "${query}"` : "Start by creating your first project to track your progress."}
                      actionLabel={query ? "Clear Search" : "Create your First Project"}
                      onAction={() => query ? setQuery('') : setIsModalOpen(true)}
                    />
                  ) : (
                    <div className="space-y-4">
                      {filteredProjects.slice(0, 3).map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-50 hover:border-indigo-100 hover:bg-gray-50/50 transition-all dark:border-gray-800 dark:hover:bg-gray-800/50">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 dark:bg-indigo-950/50">
                              <Briefcase className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{project.name}</p>
                              <p className="text-xs text-muted-foreground">{project.status}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="rounded-lg cursor-pointer" onClick={() => router.push(`/projects`)}>
                            Manage
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-xl border-none shadow-sm dark:bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {displayedActivities.map((activity) => {
                      const IconComponent = activity.icon;
                      return (
                        <div key={activity.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 dark:hover:bg-gray-800/50 hover:translate-x-1">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center mt-1 shrink-0 ${activity.iconClass}`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{activity.text}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeTime(activity.timestamp)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="rounded-xl border-none shadow-sm dark:bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">My Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredTasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No tasks found</p>
                    ) : (
                      filteredTasks.map((t) => (
                        <TaskItem 
                          key={t.id} 
                          task={t.title} 
                          isCompleted={t.status === "Completed"}
                          onToggle={() => toggleTask(t.id)}
                        />
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border-none shadow-sm bg-red-50/50 dark:bg-red-950/20">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-red-900 dark:text-red-400">Overdue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredOverdue.length === 0 ? (
                      <p className="text-sm text-red-500/50 text-center py-4">No overdue tasks found</p>
                    ) : (
                      filteredOverdue.map((t) => (
                        <TaskItem 
                          key={t.id} 
                          task={t.title} 
                          isOverdue 
                          isCompleted={t.status === "Completed"}
                          onToggle={() => toggleTask(t.id)}
                        />
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      <NewProjectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}



