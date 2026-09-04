"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTaskStore } from "@/lib/store/task-store";
import { useProjectStore } from "@/lib/store/project-store";

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewTaskModal({ isOpen, onClose }: NewTaskModalProps) {
  const addTask = useTaskStore((state) => state.addTask);
  const projects = useProjectStore((state) => state.projects);

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [projectId, setProjectId] = useState<string>("none");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setIsLoading(true);
    try {
      await addTask({
        title,
        status: "Todo",
        priority,
        dueDate: dueDate || undefined,
        projectId: projectId === "none" ? undefined : projectId,
      });

      setTitle("");
      setPriority("Medium");
      setDueDate(new Date().toISOString().split('T')[0]);
      setProjectId("none");
      onClose();
    } catch (err) {
      console.error("Failed to create task:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl dark:bg-gray-950">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">New Task</DialogTitle>
          <DialogDescription>
            Create a new task to track your personal checklist assignment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label htmlFor="task-title" className="text-sm font-semibold">Task Title</Label>
            <Input
              id="task-title"
              placeholder="e.g. Conduct brand feedback survey"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl border-gray-100 focus-visible:ring-indigo-400 dark:bg-gray-900 dark:border-gray-800"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-project" className="text-sm font-semibold">Link to Project (Optional)</Label>
            <select
              id="task-project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-100 bg-white dark:bg-gray-900 dark:border-gray-800 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
            >
              <option value="none">No Project (Personal Task)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task-dueDate" className="text-sm font-semibold">Due Date</Label>
              <Input
                id="task-dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-xl border-gray-100 focus-visible:ring-indigo-400 dark:bg-gray-900 dark:border-gray-800 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Task Hardness (Priority)</Label>
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

          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
