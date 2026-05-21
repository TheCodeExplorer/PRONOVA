"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProjectStore, Project, Task } from "@/lib/store/project-store";
import { Trash2, Plus, CheckCircle2, Circle, Clock, ChevronRight } from "lucide-react";

interface ProjectDetailsModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectDetailsModal({ project, isOpen, onClose }: ProjectDetailsModalProps) {
  const updateProject = useProjectStore((state) => state.updateProject);
  const addTask = useProjectStore((state) => state.addTask);
  const toggleTask = useProjectStore((state) => state.toggleTask);
  const deleteTask = useProjectStore((state) => state.deleteTask);

  // Sync with store state to get live updates for tasks
  const storeProject = useProjectStore((state) => 
    state.projects.find(p => p.id === project?.id) || null
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Project['status']>("Planning");
  const [priority, setPriority] = useState<Project['priority']>("Medium");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");

  useEffect(() => {
    if (storeProject) {
      setName(storeProject.name);
      setDescription(storeProject.description);
      setStatus(storeProject.status);
      setPriority(storeProject.priority);
      setStartDate(storeProject.startDate || "");
      setEndDate(storeProject.endDate || "");
    }
  }, [storeProject, isOpen]);

  if (!storeProject) return null;

  const handleSave = () => {
    updateProject(storeProject.id, {
      name,
      description,
      status,
      priority,
      startDate,
      endDate,
    });
    onClose();
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(storeProject.id, newTaskTitle.trim());
    setNewTaskTitle("");
  };

  const tasksList = storeProject.tasks || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[850px] w-[95vw] rounded-2xl dark:bg-gray-950 p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <span>Manage Project</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-indigo-600 dark:text-indigo-400 font-medium text-lg">{storeProject.name}</span>
          </DialogTitle>
          <DialogDescription>
            Modify this project's scheduling, hardness priority, and manage checklist tasks.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
          {/* Left Column: Project Metadata */}
          <div className="space-y-4 pr-0 md:pr-4 md:border-r border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Project Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-xs font-semibold">Project Name</Label>
              <Input 
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border-gray-100 focus-visible:ring-indigo-400 dark:bg-gray-900 dark:border-gray-800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-desc" className="text-xs font-semibold">Description</Label>
              <Input 
                id="edit-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl border-gray-100 focus-visible:ring-indigo-400 dark:bg-gray-900 dark:border-gray-800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status" className="text-xs font-semibold">Project Status</Label>
              <select
                id="edit-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Project['status'])}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-100 bg-white dark:bg-gray-900 dark:border-gray-800 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
              >
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-start" className="text-xs font-semibold">Start Date</Label>
                <Input 
                  id="edit-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-xl border-gray-100 focus-visible:ring-indigo-400 dark:bg-gray-900 dark:border-gray-800 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end" className="text-xs font-semibold">End Date (Due Date)</Label>
                <Input 
                  id="edit-end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-xl border-gray-100 focus-visible:ring-indigo-400 dark:bg-gray-900 dark:border-gray-800 text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Hardness (Priority)</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["Low", "Medium", "High"] as const).map((p) => {
                  const colors = {
                    Low: "border-green-200 text-green-700 hover:bg-green-50 data-[state=active]:bg-green-100 data-[state=active]:border-green-500 dark:border-green-900/30 dark:text-green-400 dark:hover:bg-green-950/20 dark:data-[state=active]:bg-green-950/50 dark:data-[state=active]:border-green-500",
                    Medium: "border-yellow-200 text-yellow-700 hover:bg-yellow-50 data-[state=active]:bg-yellow-100 data-[state=active]:border-yellow-500 dark:border-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-950/20 dark:data-[state=active]:bg-yellow-950/50 dark:data-[state=active]:border-yellow-500",
                    High: "border-red-200 text-red-700 hover:bg-red-50 data-[state=active]:bg-red-100 data-[state=active]:border-red-500 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/20 dark:data-[state=active]:bg-red-950/50 dark:data-[state=active]:border-red-500",
                  };
                  return (
                    <button
                      key={p}
                      type="button"
                      data-state={priority === p ? "active" : "inactive"}
                      onClick={() => setPriority(p)}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all active:scale-95 cursor-pointer text-center outline-none ${colors[p]}`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Task List */}
          <div className="space-y-4 flex flex-col justify-between h-full min-h-[300px]">
            <div className="space-y-4 flex-1">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Tasks Checklist</h3>
                <span className="text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                  {tasksList.filter(t => t.status === "Done").length}/{tasksList.length} Done
                </span>
              </div>

              {/* Add Task Form */}
              <form onSubmit={handleAddTask} className="flex gap-2">
                <Input 
                  placeholder="Add a new checklist task..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="rounded-xl border-gray-100 focus-visible:ring-indigo-400 dark:bg-gray-900 dark:border-gray-800 flex-1 text-sm"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </form>

              {/* Task Checklist Items */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {tasksList.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-500 border border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
                    No tasks added yet. Add one above!
                  </div>
                ) : (
                  tasksList.map((t) => {
                    const isDone = t.status === "Done";
                    const isInProgress = t.status === "In Progress";
                    return (
                      <div 
                        key={t.id} 
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-50 dark:border-gray-900 hover:border-gray-100 dark:hover:border-gray-800 bg-gray-50/30 dark:bg-gray-900/20 group/task transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => toggleTask(storeProject.id, t.id)}
                          className="flex items-center gap-3 text-left flex-1 cursor-pointer outline-none"
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 fill-green-50 dark:fill-green-950/20" />
                          ) : isInProgress ? (
                            <Clock className="h-5 w-5 text-blue-500 shrink-0 fill-blue-50 dark:fill-blue-950/20" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-300 shrink-0 hover:text-indigo-400 transition-colors" />
                          )}
                          <span className={`text-sm font-medium ${isDone ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-700 dark:text-gray-300"}`}>
                            {t.title}
                          </span>
                          {isInProgress && (
                            <span className="text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-1.5 py-0.2 rounded-md font-medium shrink-0">
                              Active
                            </span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTask(storeProject.id, t.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 opacity-0 group-hover/task:opacity-100 focus:opacity-100 cursor-pointer rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-gray-100 dark:border-gray-800 pt-4">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose}
            className="rounded-xl cursor-pointer"
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
