import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Reminder {
  id: string;
  title: string;
  date: string; // Format YYYY-MM-DD
  time: string; // Format HH:MM
  type: "Deadline" | "Meeting" | "Task" | "General";
  isCompleted: boolean;
  projectId?: string; // Optional link to a Project
  createdAt: number;
}

interface ReminderState {
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id' | 'isCompleted' | 'createdAt'>) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
  updateReminder: (id: string, updated: Partial<Reminder>) => void;
}

const getTodayStr = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const useReminderStore = create<ReminderState>()(
  persist(
    (set) => ({
      reminders: [
        {
          id: 'pr-1',
          title: "Design System alignment alignment review",
          type: "Meeting",
          date: getTodayStr(0),
          time: "10:30",
          isCompleted: false,
          projectId: "1",
          createdAt: Date.now() - 86400000 * 2,
        },
        {
          id: 'pr-2',
          title: "Submit Q3 budget projection sheets",
          type: "Deadline",
          date: getTodayStr(1),
          time: "17:00",
          isCompleted: false,
          projectId: "2",
          createdAt: Date.now() - 86400000,
        },
        {
          id: 'pr-3',
          title: "Conduct user onboarding walkthrough interview",
          type: "Task",
          date: getTodayStr(-1),
          time: "14:00",
          isCompleted: true,
          createdAt: Date.now() - 86400000 * 3,
        },
        {
          id: 'pr-4',
          title: "Setup dashboard analytics widgets integration",
          type: "General",
          date: getTodayStr(3),
          time: "09:00",
          isCompleted: false,
          createdAt: Date.now() - 100000,
        }
      ],
      addReminder: (reminderData) => set((state) => {
        const newReminder: Reminder = {
          ...reminderData,
          id: 'pr-' + Math.random().toString(36).substring(7),
          isCompleted: false,
          createdAt: Date.now()
        };
        return {
          reminders: [...state.reminders, newReminder]
        };
      }),
      toggleReminder: (id) => set((state) => ({
        reminders: state.reminders.map((r) => 
          r.id === id ? { ...r, isCompleted: !r.isCompleted } : r
        )
      })),
      deleteReminder: (id) => set((state) => ({
        reminders: state.reminders.filter((r) => r.id !== id)
      })),
      updateReminder: (id, updated) => set((state) => ({
        reminders: state.reminders.map((r) => 
          r.id === id ? { ...r, ...updated } : r
        )
      }))
    }),
    {
      name: 'kamoz-personal-reminders-storage',
    }
  )
);
