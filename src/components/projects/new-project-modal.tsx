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
import { useProjectStore } from "@/lib/store/project-store";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewProjectModal({ isOpen, onClose }: NewProjectModalProps) {
  const addProject = useProjectStore((state) => state.addProject);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !startDate || !endDate) return;

    setIsLoading(true);
    try {
      await addProject({
        name,
        description,
        status: "Planning",
        priority,
        startDate,
        endDate,
      });

      setName("");
      setDescription("");
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setPriority("Medium");
      onClose();
    } catch (err) {
      console.error("Failed to create project:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl dark:bg-gray-950">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">New Project</DialogTitle>
          <DialogDescription>
            Create a new project to start tracking your work.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">Project Name</Label>
            <Input
              id="name"
              placeholder="e.g. Website Redesign"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border-gray-100 focus-visible:ring-indigo-400 dark:bg-gray-900 dark:border-gray-800"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
            <Input
              id="description"
              placeholder="What is this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl border-gray-100 focus-visible:ring-indigo-400 dark:bg-gray-900 dark:border-gray-800"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-semibold">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-xl border-gray-100 focus-visible:ring-indigo-400 dark:bg-gray-900 dark:border-gray-800 text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-semibold">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-xl border-gray-100 focus-visible:ring-indigo-400 dark:bg-gray-900 dark:border-gray-800 text-sm"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Hardness (Priority)</Label>
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
              {isLoading ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
