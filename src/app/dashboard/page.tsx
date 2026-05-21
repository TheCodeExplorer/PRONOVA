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
import { useState } from "react";
import { NewProjectModal } from "@/components/projects/new-project-modal";
import { useProjectStore } from "@/lib/store/project-store";
import { useTaskStore } from "@/lib/store/task-store";
import { useRouter } from "next/navigation";
import { TaskItem } from "@/components/dashboard/task-item";

import { useSearchStore } from "@/lib/store/search-store";

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const projects = useProjectStore((state) => state.projects);
  const { tasks, toggleTask } = useTaskStore();
  const { query, setQuery } = useSearchStore();
  const router = useRouter();

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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, User</h1>
          <p className="text-muted-foreground text-sm">Here’s what’s happening with your projects today.</p>
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
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard 
              label="Completed" 
              value={projects.filter(p => p.status === 'Completed').length} 
              icon={CheckCircle2} 
              trend={{ value: 5, isPositive: true }}
            />
            <StatCard 
              label="My Tasks" 
              value={activeTasks.length} 
              icon={Clock} 
            />
            <StatCard 
              label="Overdue" 
              value={overdueTasks.length} 
              icon={AlertCircle} 
              trend={overdueTasks.length > 0 ? { value: overdueTasks.length, isPositive: false } : undefined}
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
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors dark:hover:bg-gray-800/50">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mt-1 dark:bg-indigo-950/50">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">You completed the task "Design System Update"</p>
                          <p className="text-xs text-muted-foreground mt-0.5">2 hours ago</p>
                        </div>
                      </div>
                    ))}
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


