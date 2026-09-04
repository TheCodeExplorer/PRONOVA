"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Plus, 
  Circle, 
  Clock, 
  Trash2, 
  Calendar, 
  Search, 
  Filter, 
  Briefcase,
  ListTodo
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTaskStore, PersonalTask } from "@/lib/store/task-store";
import { useProjectStore } from "@/lib/store/project-store";
import { useSearchStore } from "@/lib/store/search-store";
import { NewTaskModal } from "@/components/tasks/new-task-modal";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function TasksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [projectFilter, setProjectFilter] = useState<string>("All");

  const { tasks, toggleTask, deleteTask, fetchTasks } = useTaskStore();
  const projects = useProjectStore((state) => state.projects);
  const fetchProjects = useProjectStore((state) => state.fetchProjects);
  const { query, setQuery } = useSearchStore();

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, [fetchTasks, fetchProjects]);

  const priorityColors = {
    Low: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-none font-semibold",
    Medium: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400 border-none font-semibold",
    High: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-none font-semibold",
  };

  const formatReadableDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "All" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "All" || t.priority === priorityFilter;
    const matchesProject = 
      projectFilter === "All" ? true :
      projectFilter === "none" ? !t.projectId :
      t.projectId === projectFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
  });

  const resetAllFilters = () => {
    setQuery("");
    setStatusFilter("All");
    setPriorityFilter("All");
    setProjectFilter("All");
  };

  // Compute stat card values
  const totalCount = filteredTasks.length;
  const completedCount = filteredTasks.filter(t => t.status === "Completed").length;
  const inProgressCount = filteredTasks.filter(t => t.status === "In Progress").length;
  const todoCount = filteredTasks.filter(t => t.status === "Todo").length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
          <p className="text-gray-500 text-sm dark:text-gray-400">Keep track of your personal assignments.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {tasks.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl shadow-xs">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalCount}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl shadow-xs">
            <p className="text-xs font-semibold text-green-500 uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{completedCount}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl shadow-xs">
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider">In Progress</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{inProgressCount}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl shadow-xs">
            <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Todo</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{todoCount}</p>
          </div>
        </div>
      )}

      {tasks.length > 0 && (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search tasks..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 border-gray-100 focus-visible:ring-indigo-400 rounded-xl bg-gray-50/50 dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-center px-4 py-2 text-sm font-medium border rounded-xl border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-all cursor-pointer outline-none select-none flex-1 md:flex-none">
                <Filter className="h-4 w-4 mr-2 text-gray-400" />
                {statusFilter === "All" ? "Status" : `Status: ${statusFilter}`}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl min-w-[150px]">
                <DropdownMenuItem onClick={() => setStatusFilter("All")} className={`cursor-pointer ${statusFilter === "All" ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}>All Statuses</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Todo")} className={`cursor-pointer ${statusFilter === "Todo" ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}>Todo</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("In Progress")} className={`cursor-pointer ${statusFilter === "In Progress" ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}>In Progress</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Completed")} className={`cursor-pointer ${statusFilter === "Completed" ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}>Completed</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-center px-4 py-2 text-sm font-medium border rounded-xl border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-all cursor-pointer outline-none select-none flex-1 md:flex-none">
                <Filter className="h-4 w-4 mr-2 text-gray-400" />
                {priorityFilter === "All" ? "Priority" : `Priority: ${priorityFilter}`}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl min-w-[150px]">
                <DropdownMenuItem onClick={() => setPriorityFilter("All")} className={`cursor-pointer ${priorityFilter === "All" ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}>All Priorities</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriorityFilter("Low")} className={`cursor-pointer ${priorityFilter === "Low" ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}>Low</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriorityFilter("Medium")} className={`cursor-pointer ${priorityFilter === "Medium" ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}>Medium</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriorityFilter("High")} className={`cursor-pointer ${priorityFilter === "High" ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}>High</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-center px-4 py-2 text-sm font-medium border rounded-xl border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-all cursor-pointer outline-none select-none flex-1 md:flex-none">
                <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                {projectFilter === "All" ? "Project" : projectFilter === "none" ? "Project: Personal" : `Project: ${projects.find(p => p.id === projectFilter)?.name}`}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl min-w-[200px]">
                <DropdownMenuItem onClick={() => setProjectFilter("All")} className={`cursor-pointer ${projectFilter === "All" ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}>All Projects</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setProjectFilter("none")} className={`cursor-pointer ${projectFilter === "none" ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}>Personal (No Project)</DropdownMenuItem>
                {projects.map((p) => (
                  <DropdownMenuItem key={p.id} onClick={() => setProjectFilter(p.id)} className={`cursor-pointer ${projectFilter === p.id ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}>{p.name}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center space-y-4 shadow-sm">
          <div className="h-16 w-16 bg-indigo-50 dark:bg-indigo-950 rounded-full flex items-center justify-center text-indigo-600 mx-auto">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold">You're all caught up!</h2>
          <p className="text-gray-500 max-w-sm mx-auto">
            All your tasks are completed. Add a new checklist task to get started.
          </p>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all active:scale-95 cursor-pointer font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Task
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800 overflow-hidden shadow-xs">
            {filteredTasks.map((t) => {
              const isDone = t.status === "Completed";
              const isInProgress = t.status === "In Progress";
              const linkedProject = projects.find(p => p.id === t.projectId);

              return (
                <div 
                  key={t.id} 
                  className="flex items-center justify-between p-4 bg-white/50 hover:bg-gray-50/50 dark:bg-gray-900/50 dark:hover:bg-gray-800/20 group/task transition-all"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleTask(t.id)}
                      className="cursor-pointer outline-none text-left shrink-0"
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-5.5 w-5.5 text-green-500 fill-green-50 dark:fill-green-950/20 shrink-0" />
                      ) : isInProgress ? (
                        <Clock className="h-5.5 w-5.5 text-blue-500 fill-blue-50 dark:fill-blue-950/20 shrink-0" />
                      ) : (
                        <Circle className="h-5.5 w-5.5 text-gray-300 hover:text-indigo-500 shrink-0 transition-colors" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <span className={`text-sm font-semibold block ${isDone ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-800 dark:text-gray-200"}`}>
                        {t.title}
                      </span>
                      <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
                        {t.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            {formatReadableDate(t.dueDate)}
                          </span>
                        )}
                        {linkedProject && (
                          <span className="flex items-center gap-1 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md font-semibold text-[10px]">
                            <Briefcase className="h-2.5 w-2.5" />
                            {linkedProject.name}
                          </span>
                        )}
                        {!linkedProject && (
                          <span className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-md font-semibold text-[10px]">
                            Personal Task
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={`rounded-lg font-bold text-[10px] px-2 py-0.5 ${priorityColors[t.priority]}`}>
                      {t.priority}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => deleteTask(t.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1.5 cursor-pointer opacity-0 group-hover/task:opacity-100 focus:opacity-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredTasks.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-gray-900">
                <p className="text-gray-500 dark:text-gray-400">
                  No tasks found matching the selected filters.
                </p>
                <Button 
                  variant="ghost" 
                  className="mt-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 cursor-pointer rounded-xl font-medium" 
                  onClick={resetAllFilters}
                >
                  Reset Filters & Search
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <NewTaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
