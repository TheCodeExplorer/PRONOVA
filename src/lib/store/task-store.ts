import { create } from "zustand";

export interface PersonalTask {
  id: string;
  title: string;
  status: "Todo" | "In Progress" | "Completed";
  priority: "Low" | "Medium" | "High";
  dueDate?: string; // Format YYYY-MM-DD
  projectId?: string; // Optional link to a Project
  projectName?: string;
  createdAt: number;
}

interface TaskState {
  tasks: PersonalTask[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<PersonalTask, "id" | "createdAt">) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTask: (id: string, updated: Partial<PersonalTask>) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (res.ok && data.success) {
        set({ tasks: data.tasks, isLoading: false });
      } else {
        set({ error: data.error || "Failed to fetch tasks.", isLoading: false });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ error: msg, isLoading: false });
    }
  },

  addTask: async (taskData) => {
    set({ error: null });
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        set((state) => ({
          tasks: [data.task, ...state.tasks],
        }));
      } else {
        throw new Error(data.error || "Failed to create task.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ error: msg });
      throw err;
    }
  },

  toggleTask: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    const nextStatus: PersonalTask["status"] =
      task.status === "Todo"
        ? "In Progress"
        : task.status === "In Progress"
        ? "Completed"
        : "Todo";

    set({ error: null });
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? data.task : t)),
        }));
      } else {
        throw new Error(data.error || "Failed to toggle task.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ error: msg });
      throw err;
    }
  },

  deleteTask: async (id) => {
    set({ error: null });
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
      } else {
        throw new Error(data.error || "Failed to delete task.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ error: msg });
      throw err;
    }
  },

  updateTask: async (id, updated) => {
    set({ error: null });
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? data.task : t)),
        }));
      } else {
        throw new Error(data.error || "Failed to update task.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ error: msg });
      throw err;
    }
  },
}));
