import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PersonalTask {
  id: string;
  title: string;
  status: "Todo" | "In Progress" | "Completed";
  priority: "Low" | "Medium" | "High";
  dueDate?: string; // Format YYYY-MM-DD
  projectId?: string; // Optional link to a Project
  createdAt: number;
}

interface TaskState {
  tasks: PersonalTask[];
  addTask: (task: Omit<PersonalTask, 'id' | 'createdAt'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updated: Partial<PersonalTask>) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [
        {
          id: 'pt-1',
          title: "Prepare presentation for Q3 product review",
          status: "In Progress",
          priority: "High",
          dueDate: "2026-06-15",
          projectId: "1",
          createdAt: Date.now() - 86400000 * 2,
        },
        {
          id: 'pt-2',
          title: "Refactor global search query triggers",
          status: "Todo",
          priority: "Medium",
          dueDate: "2026-06-20",
          projectId: "2",
          createdAt: Date.now() - 86400000,
        },
        {
          id: 'pt-3',
          title: "Conduct initial user feedback interview",
          status: "Completed",
          priority: "Low",
          dueDate: "2026-05-18",
          createdAt: Date.now() - 86400000 * 5,
        },
        {
          id: 'pt-4',
          title: "Setup automated visual regression tests",
          status: "Todo",
          priority: "High",
          dueDate: "2026-06-10",
          createdAt: Date.now() - 4000000,
        }
      ],
      addTask: (taskData) => set((state) => {
        const newTask: PersonalTask = {
          ...taskData,
          id: 'pt-' + Math.random().toString(36).substring(7),
          createdAt: Date.now()
        };
        return {
          tasks: [...state.tasks, newTask]
        };
      }),
      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map((t) => {
          if (t.id !== id) return t;
          const nextStatus: PersonalTask['status'] = 
            t.status === "Todo" ? "In Progress" :
            t.status === "In Progress" ? "Completed" : "Todo";
          return { ...t, status: nextStatus };
        })
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      })),
      updateTask: (id, updated) => set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updated } : t))
      }))
    }),
    {
      name: 'kamoz-personal-tasks-storage',
    }
  )
);
