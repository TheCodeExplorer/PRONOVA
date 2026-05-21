import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  status: "Active" | "Pending";
  joinedDate: string; // Format YYYY-MM-DD
  avatar?: string;
}

interface TeamState {
  members: TeamMember[];
  inviteMember: (name: string, email: string, role: "ADMIN" | "MEMBER") => void;
  updateRole: (id: string, role: "ADMIN" | "MEMBER") => void;
  removeMember: (id: string) => void;
  resendInvitation: (id: string) => void;
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set) => ({
      members: [
        {
          id: 'tm-1',
          name: "John Doe",
          email: "john@example.com",
          role: "ADMIN",
          status: "Active",
          joinedDate: "2026-01-10",
          avatar: "JD"
        },
        {
          id: 'tm-2',
          name: "Sarah Smith",
          email: "sarah@example.com",
          role: "MEMBER",
          status: "Active",
          joinedDate: "2026-02-15",
          avatar: "SS"
        },
        {
          id: 'tm-3',
          name: "Michael Chen",
          email: "michael@example.com",
          role: "MEMBER",
          status: "Active",
          joinedDate: "2026-03-20",
          avatar: "MC"
        },
        {
          id: 'tm-4',
          name: "Jessica Taylor",
          email: "jessica@example.com",
          role: "MEMBER",
          status: "Pending",
          joinedDate: "2026-05-19",
          avatar: "JT"
        }
      ],
      inviteMember: (name, email, role) => set((state) => {
        // Calculate avatar initials
        const avatar = name
          .split(" ")
          .map((n) => n.charAt(0))
          .join("")
          .toUpperCase()
          .slice(0, 2);

        const newMember: TeamMember = {
          id: 'tm-' + Math.random().toString(36).substring(7),
          name,
          email,
          role,
          status: "Pending",
          joinedDate: new Date().toISOString().split('T')[0],
          avatar: avatar || "U"
        };
        return {
          members: [...state.members, newMember]
        };
      }),
      updateRole: (id, role) => set((state) => ({
        members: state.members.map((m) => 
          m.id === id ? { ...m, role } : m
        )
      })),
      removeMember: (id) => set((state) => ({
        members: state.members.filter((m) => m.id !== id)
      })),
      resendInvitation: (id) => set((state) => ({
        // Simulate minor update like renewing joinedDate as sent date
        members: state.members.map((m) => 
          m.id === id ? { ...m, joinedDate: new Date().toISOString().split('T')[0] } : m
        )
      }))
    }),
    {
      name: 'kamoz-team-members-storage',
    }
  )
);
