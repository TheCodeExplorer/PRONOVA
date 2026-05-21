"use client";

import { useState } from "react";
import { 
  Bell, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  Briefcase,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useReminderStore, Reminder } from "@/lib/store/reminder-store";
import { useProjectStore } from "@/lib/store/project-store";
import { useSearchStore } from "@/lib/store/search-store";
import { NewReminderModal } from "@/components/reminders/new-reminder-modal";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function RemindersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("Active");
  const [projectFilter, setProjectFilter] = useState<string>("All");

  const { reminders, toggleReminder, deleteReminder } = useReminderStore();
  const projects = useProjectStore((state) => state.projects);
  const { query, setQuery } = useSearchStore();

  const typeColors = {
    Deadline: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-none font-semibold",
    Meeting: "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 border-none font-semibold",
    Task: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-none font-semibold",
    General: "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-none font-semibold",
  };

  const formatReadableDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  // Compound filtering logic
  const filteredReminders = reminders.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(query.toLowerCase());
    const matchesType = typeFilter === "All" || r.type === typeFilter;
    
    let matchesStatus = true;
    if (statusFilter === "Active") matchesStatus = !r.isCompleted;
    else if (statusFilter === "Completed") matchesStatus = r.isCompleted;

    const matchesProject = 
      projectFilter === "All" ? true :
      projectFilter === "none" ? !r.projectId :
      r.projectId === projectFilter;

    return matchesSearch && matchesType && matchesStatus && matchesProject;
  });

  const resetAllFilters = () => {
    setQuery("");
    setTypeFilter("All");
    setStatusFilter("Active");
    setProjectFilter("All");
  };

  // Compute stat card values
  const activeCount = reminders.filter(r => !r.isCompleted).length;
  const deadlineCount = reminders.filter(r => r.type === "Deadline" && !r.isCompleted).length;
  const meetingCount = reminders.filter(r => r.type === "Meeting" && !r.isCompleted).length;
  const completedCount = reminders.filter(r => r.isCompleted).length;

  // Group uncompleted reminders by timeline
  const getTimelineGroup = (r: Reminder) => {
    if (r.isCompleted) return "Completed";
    if (r.date === todayStr) return "Today";
    if (r.date === tomorrowStr) return "Tomorrow";
    if (r.date < todayStr) return "Past Due / Overdue";
    return "Upcoming";
  };

  const groupedReminders = filteredReminders.reduce((groups, reminder) => {
    const group = getTimelineGroup(reminder);
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(reminder);
    return groups;
  }, {} as Record<string, Reminder[]>);

  // Group render order
  const groupOrder = ["Today", "Tomorrow", "Upcoming", "Past Due / Overdue", "Completed"];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reminders & Alerts</h1>
          <p className="text-gray-500 text-sm dark:text-gray-400">Keep track of meetings, task updates, and product deadlines.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Set Reminder
        </Button>
      </div>

      {reminders.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl shadow-xs">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Alerts</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{activeCount}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl shadow-xs">
            <p className="text-xs font-semibold text-red-500 uppercase tracking-wider">Deadlines</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{deadlineCount}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl shadow-xs">
            <p className="text-xs font-semibold text-purple-500 uppercase tracking-wider">Meetings</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{meetingCount}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl shadow-xs">
            <p className="text-xs font-semibold text-green-500 uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{completedCount}</p>
          </div>
        </div>
      )}

      {reminders.length > 0 && (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search alerts..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 border-gray-100 focus-visible:ring-indigo-400 rounded-xl bg-gray-50/50 dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-center px-4 py-2 text-sm font-medium border rounded-xl border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-all cursor-pointer outline-none select-none flex-1 md:flex-none">
                <Filter className="h-4 w-4 mr-2 text-gray-400" />
                {statusFilter === "All" ? "Status: All" : `Status: ${statusFilter}`}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl min-w-[150px]">
                <DropdownMenuItem onClick={() => setStatusFilter("All")} className={`cursor-pointer ${statusFilter === "All" ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}>All Statuses</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Active")} className={`cursor-pointer ${statusFilter === "Active" ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}>Active Alerts</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Completed")} className={`cursor-pointer ${statusFilter === "Completed" ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}>Completed Alerts</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-center px-4 py-2 text-sm font-medium border rounded-xl border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-all cursor-pointer outline-none select-none flex-1 md:flex-none">
                <Filter className="h-4 w-4 mr-2 text-gray-400" />
                {typeFilter === "All" ? "Category" : `Type: ${typeFilter}`}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl min-w-[150px]">
                <DropdownMenuItem onClick={() => setTypeFilter("All")} className={`cursor-pointer ${typeFilter === "All" ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}>All Categories</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("Deadline")} className={`cursor-pointer ${typeFilter === "Deadline" ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}>Deadline</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("Meeting")} className={`cursor-pointer ${typeFilter === "Meeting" ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}>Meeting</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("Task")} className={`cursor-pointer ${typeFilter === "Task" ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}>Task</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("General")} className={`cursor-pointer ${typeFilter === "General" ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}>General</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-center px-4 py-2 text-sm font-medium border rounded-xl border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-all cursor-pointer outline-none select-none flex-1 md:flex-none">
                <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                {projectFilter === "All" ? "Project" : projectFilter === "none" ? "Project: General" : `Project: ${projects.find(p => p.id === projectFilter)?.name}`}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl min-w-[200px]">
                <DropdownMenuItem onClick={() => setProjectFilter("All")} className={`cursor-pointer ${projectFilter === "All" ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}>All Projects</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setProjectFilter("none")} className={`cursor-pointer ${projectFilter === "none" ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}>General Alerts (No Project)</DropdownMenuItem>
                {projects.map((p) => (
                  <DropdownMenuItem key={p.id} onClick={() => setProjectFilter(p.id)} className={`cursor-pointer ${projectFilter === p.id ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}>{p.name}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {reminders.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center space-y-4 shadow-sm">
          <div className="h-16 w-16 bg-blue-50 dark:bg-blue-950 rounded-full flex items-center justify-center text-blue-600 mx-auto">
            <Bell className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold">No upcoming reminders</h2>
          <p className="text-gray-500 max-w-sm mx-auto">
            All your alerts are cleared. Set a new dynamic reminder for task updates or team deadlines.
          </p>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all active:scale-95 cursor-pointer font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            Set Your First Reminder
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {groupOrder.map((groupName) => {
            const groupReminders = groupedReminders[groupName] || [];
            if (groupReminders.length === 0) return null;

            return (
              <div key={groupName} className="space-y-3">
                <h3 className={`text-xs font-bold uppercase tracking-wider ${
                  groupName === "Past Due / Overdue" ? "text-red-500" :
                  groupName === "Today" ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400"
                }`}>
                  {groupName} ({groupReminders.length})
                </h3>

                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800 overflow-hidden shadow-xs">
                  {groupReminders.map((r) => {
                    const isDone = r.isCompleted;
                    const linkedProject = projects.find(p => p.id === r.projectId);

                    return (
                      <div 
                        key={r.id} 
                        className="flex items-center justify-between p-4 bg-white/50 hover:bg-gray-50/50 dark:bg-gray-900/50 dark:hover:bg-gray-800/20 group/reminder transition-all"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <button
                            type="button"
                            onClick={() => toggleReminder(r.id)}
                            className="cursor-pointer outline-none text-left shrink-0"
                          >
                            {isDone ? (
                              <CheckCircle2 className="h-5.5 w-5.5 text-green-500 fill-green-50 dark:fill-green-950/20 shrink-0" />
                            ) : groupName === "Past Due / Overdue" ? (
                              <AlertCircle className="h-5.5 w-5.5 text-red-500 fill-red-50 dark:fill-red-950/20 shrink-0" />
                            ) : (
                              <Circle className="h-5.5 w-5.5 text-gray-300 hover:text-indigo-500 shrink-0 transition-colors" />
                            )}
                          </button>

                          <div className="space-y-1">
                            <span className={`text-sm font-semibold block ${isDone ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-800 dark:text-gray-200"}`}>
                              {r.title}
                            </span>
                            <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                {formatReadableDate(r.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-gray-400" />
                                {r.time}
                              </span>
                              {linkedProject && (
                                <span className="flex items-center gap-1 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md font-semibold text-[10px]">
                                  <Briefcase className="h-2.5 w-2.5" />
                                  {linkedProject.name}
                                </span>
                              )}
                              {!linkedProject && (
                                <span className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-md font-semibold text-[10px]">
                                  General Alert
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge className={`rounded-lg font-bold text-[10px] px-2 py-0.5 ${typeColors[r.type]}`}>
                            {r.type}
                          </Badge>
                          <button
                            type="button"
                            onClick={() => deleteReminder(r.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1.5 cursor-pointer opacity-0 group-hover/reminder:opacity-100 focus:opacity-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          
          {filteredReminders.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
              <p className="text-gray-500 dark:text-gray-400">
                No reminders found matching the selected filters.
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
      )}

      <NewReminderModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
