import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'tasksCount' | 'dueDate' | 'tasks'> & { startDate: string; endDate: string }) => void;
  updateProject: (id: string, updated: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addTask: (projectId: string, title: string) => void;
  toggleTask: (projectId: string, taskId: string) => void;
  deleteTask: (projectId: string, taskId: string) => void;
}

function formatToReadableDate(dateStr: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      projects: [
        {
          id: '1',
          name: "Website Redesign",
          description: "Full revamp of the company website with modern design trends and improved UX.",
          status: "In Progress",
          priority: "High",
          startDate: "2026-10-01",
          endDate: "2026-10-24",
          tasks: [
            { id: 't1', title: "Finalize landing page structure", status: "Done" },
            { id: 't2', title: "Review brand style guide", status: "In Progress" },
            { id: 't3', title: "Deploy initial preview build", status: "Todo" }
          ],
          tasksCount: 3,
          dueDate: "Oct 24, 2026",
          createdAt: Date.now(),
        },
        {
          id: '2',
          name: "Mobile App Development",
          description: "Creating a cross-platform mobile application for better customer engagement.",
          status: "Planning",
          priority: "Medium",
          startDate: "2026-12-01",
          endDate: "2026-12-12",
          tasks: [
            { id: 't4', title: "Set up project repository", status: "Done" },
            { id: 't5', title: "Configure UI library", status: "Todo" }
          ],
          tasksCount: 2,
          dueDate: "Dec 12, 2026",
          createdAt: Date.now(),
        },
      ],
      addProject: (projectData) => set((state) => {
        const tasks: Task[] = [];
        const dueDate = formatToReadableDate(projectData.endDate);
        const newProject: Project = {
          ...projectData,
          id: Math.random().toString(36).substring(7),
          tasks,
          tasksCount: 0,
          dueDate,
          createdAt: Date.now(),
        };
        return {
          projects: [...state.projects, newProject]
        };
      }),
      updateProject: (id, updated) => set((state) => ({
        projects: state.projects.map((p) => {
          if (p.id !== id) return p;
          const merged = { ...p, ...updated };
          if (updated.endDate) {
            merged.dueDate = formatToReadableDate(updated.endDate);
          }
          if (updated.tasks) {
            merged.tasksCount = updated.tasks.length;
          }
          return merged;
        })
      })),
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter(p => p.id !== id)
      })),
      addTask: (projectId, title) => set((state) => ({
        projects: state.projects.map((p) => {
          if (p.id !== projectId) return p;
          const newTask: Task = {
            id: Math.random().toString(36).substring(7),
            title,
            status: "Todo"
          };
          const updatedTasks = [...p.tasks, newTask];
          return {
            ...p,
            tasks: updatedTasks,
            tasksCount: updatedTasks.length
          };
        })
      })),
      toggleTask: (projectId, taskId) => set((state) => ({
        projects: state.projects.map((p) => {
          if (p.id !== projectId) return p;
          const updatedTasks = p.tasks.map((t) => {
            if (t.id !== taskId) return t;
            const nextStatus: Task['status'] = 
              t.status === "Todo" ? "In Progress" :
              t.status === "In Progress" ? "Done" : "Todo";
            return { ...t, status: nextStatus };
          });
          return {
            ...p,
            tasks: updatedTasks
          };
        })
      })),
      deleteTask: (projectId, taskId) => set((state) => ({
        projects: state.projects.map((p) => {
          if (p.id !== projectId) return p;
          const updatedTasks = p.tasks.filter((t) => t.id !== taskId);
          return {
            ...p,
            tasks: updatedTasks,
            tasksCount: updatedTasks.length
          };
        })
      })),
    }),
    {
      name: 'kamoz-projects-storage',
    }
  )
);
