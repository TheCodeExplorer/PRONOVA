import { create } from "zustand";

export interface Task {
  id: string;
  title: string;
  status: "Todo" | "In Progress" | "Done";
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: "Planning" | "In Progress" | "Completed";
  priority: "Low" | "Medium" | "High";
  startDate: string;
  endDate: string;
  tasks: Task[];
  tasksCount: number;
  dueDate: string;
  createdAt: number;
}

interface ProjectState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  addProject: (
    project: Omit<Project, "id" | "createdAt" | "tasksCount" | "dueDate" | "tasks"> & {
      startDate: string;
      endDate: string;
    }
  ) => Promise<void>;
  updateProject: (id: string, updated: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addTask: (projectId: string, title: string) => Promise<void>;
  toggleTask: (projectId: string, taskId: string) => Promise<void>;
  deleteTask: (projectId: string, taskId: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (res.ok && data.success) {
        set({ projects: data.projects, isLoading: false });
      } else {
        set({ error: data.error || "Failed to fetch projects.", isLoading: false });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ error: msg, isLoading: false });
    }
  },

  addProject: async (projectData) => {
    set({ error: null });
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        set((state) => ({
          projects: [data.project, ...state.projects],
        }));
      } else {
        throw new Error(data.error || "Failed to create project.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ error: msg });
      throw err;
    }
  },

  updateProject: async (id, updated) => {
    set({ error: null });
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? data.project : p)),
        }));
      } else {
        throw new Error(data.error || "Failed to update project.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ error: msg });
      throw err;
    }
  },

  deleteProject: async (id) => {
    set({ error: null });
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        }));
      } else {
        throw new Error(data.error || "Failed to delete project.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ error: msg });
      throw err;
    }
  },

  addTask: async (projectId, title) => {
    set({ error: null });
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const updatedTasks = [...p.tasks, data.task];
            return {
              ...p,
              tasks: updatedTasks,
              tasksCount: updatedTasks.length,
            };
          }),
        }));
      } else {
        throw new Error(data.error || "Failed to add checklist task.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ error: msg });
      throw err;
    }
  },

  toggleTask: async (projectId, taskId) => {
    const project = get().projects.find((p) => p.id === projectId);
    if (!project) return;
    const task = project.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const nextStatus: Task["status"] =
      task.status === "Todo" ? "In Progress" : task.status === "In Progress" ? "Done" : "Todo";

    set({ error: null });
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const updatedTasks = p.tasks.map((t) =>
              t.id === taskId ? { ...t, status: nextStatus } : t
            );
            return {
              ...p,
              tasks: updatedTasks,
            };
          }),
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

  deleteTask: async (projectId, taskId) => {
    set({ error: null });
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const updatedTasks = p.tasks.filter((t) => t.id !== taskId);
            return {
              ...p,
              tasks: updatedTasks,
              tasksCount: updatedTasks.length,
            };
          }),
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
}));
