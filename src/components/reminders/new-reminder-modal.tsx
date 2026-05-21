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
import { useReminderStore } from "@/lib/store/reminder-store";
import { useProjectStore } from "@/lib/store/project-store";

interface NewReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ReminderType = "Deadline" | "Meeting" | "Task" | "General";

export function NewReminderModal({ isOpen, onClose }: NewReminderModalProps) {
  const addReminder = useReminderStore((state) => state.addReminder);
  const projects = useProjectStore((state) => state.projects);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<ReminderType>("General");
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  });
  const [projectId, setProjectId] = useState<string>("none");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time) return;

    setIsLoading(true);
    // Simulate minor delay
    await new Promise(resolve => setTimeout(resolve, 200));

    addReminder({
      title,
      type,
      date,
      time,
      projectId: projectId === "none" ? undefined : projectId,
    });

    setIsLoading(false);
    setTitle("");
    setType("General");
    setDate(new Date().toISOString().split('T')[0]);
    setTime(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    });
    setProjectId("none");
    onClose();
  };

  const typeColors = {
    Deadline: "border-red-200 text-red-700 hover:bg-red-50 data-[state=active]:bg-red-100 data-[state=active]:border-red-500 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/20 dark:data-[state=active]:bg-red-950/50 dark:data-[state=active]:border-red-500",
    Meeting: "border-purple-200 text-purple-700 hover:bg-purple-50 data-[state=active]:bg-purple-100 data-[state=active]:border-purple-500 dark:border-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-950/20 dark:data-[state=active]:bg-purple-950/50 dark:data-[state=active]:border-purple-500",
    Task: "border-blue-200 text-blue-700 hover:bg-blue-50 data-[state=active]:bg-blue-100 data-[state=active]:border-blue-500 dark:border-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-950/20 dark:data-[state=active]:bg-blue-950/50 dark:data-[state=active]:border-blue-500",
    General: "border-gray-200 text-gray-700 hover:bg-gray-50 data-[state=active]:bg-gray-100 data-[state=active]:border-gray-500 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-850 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:border-gray-600",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl dark:bg-gray-950">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Set Reminder</DialogTitle>
          <DialogDescription>
            Configure a dynamic alert or reminder for deadlines, meetings, and updates.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label htmlFor="reminder-title" className="text-sm font-semibold">Reminder Alert Title</Label>
            <Input
              id="reminder-title"
              placeholder="e.g. Sync review meeting on brand guide"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl border-gray-100 focus-visible:ring-indigo-400 dark:bg-gray-900 dark:border-gray-800"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder-project" className="text-sm font-semibold">Associated Project (Optional)</Label>
            <select
              id="reminder-project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-100 bg-white dark:bg-gray-900 dark:border-gray-800 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
            >
              <option value="none">No Project (General Alert)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reminder-date" className="text-sm font-semibold">Date</Label>
              <Input
                id="reminder-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-xl border-gray-100 focus-visible:ring-indigo-400 dark:bg-gray-900 dark:border-gray-800 text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminder-time" className="text-sm font-semibold">Time</Label>
              <Input
                id="reminder-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="rounded-xl border-gray-100 focus-visible:ring-indigo-400 dark:bg-gray-900 dark:border-gray-800 text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Reminder Category</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["Deadline", "Meeting", "Task", "General"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  data-state={type === t ? "active" : "inactive"}
                  onClick={() => setType(t)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all active:scale-95 cursor-pointer text-center outline-none ${typeColors[t]}`}
                >
                  {t}
                </button>
              ))}
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
              {isLoading ? "Setting Alert..." : "Set Reminder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
