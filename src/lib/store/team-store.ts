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
      members: [],
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
      name: 'pronova-team-members-storage',
    }
  )
);
