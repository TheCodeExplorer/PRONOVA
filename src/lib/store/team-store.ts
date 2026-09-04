import { create } from "zustand";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  status: "Active" | "Pending";
  joinedDate: string; // Format YYYY-MM-DD
  avatar?: string;
  userId?: string;
  isCurrentUser?: boolean;
}

interface TeamState {
  members: TeamMember[];
  isLoading: boolean;
  error: string | null;
  fetchMembers: () => Promise<void>;
  inviteMember: (name: string, email: string, role: "ADMIN" | "MEMBER") => void;
  updateRole: (id: string, role: "ADMIN" | "MEMBER") => Promise<void>;
  removeMember: (id: string) => Promise<void>;
  resendInvitation: (id: string) => void;
}

export const useTeamStore = create<TeamState>((set, get) => ({
  members: [],
  isLoading: false,
  error: null,

  fetchMembers: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/team/members");
      const data = await res.json();
      if (res.ok && data.success) {
        set({ members: data.members, isLoading: false });
      } else {
        set({ error: data.error || "Failed to fetch team members", isLoading: false });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ error: msg, isLoading: false });
    }
  },

  inviteMember: (name, email, role) => {
    // Refresh authoritative members from PostgreSQL
    get().fetchMembers();
  },

  updateRole: async (id, role) => {
    // Optimistic UI update
    set((state) => ({
      members: state.members.map((m) => (m.id === id ? { ...m, role } : m)),
    }));

    try {
      const res = await fetch("/api/team/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role }),
      });
      if (!res.ok) {
        // Rollback on failure
        get().fetchMembers();
      }
    } catch {
      get().fetchMembers();
    }
  },

  removeMember: async (id) => {
    // Optimistic UI update
    set((state) => ({
      members: state.members.filter((m) => m.id !== id),
    }));

    try {
      const res = await fetch(`/api/team/members?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        // Rollback on failure
        get().fetchMembers();
      }
    } catch {
      get().fetchMembers();
    }
  },

  resendInvitation: (id) => {
    get().fetchMembers();
  },
}));
