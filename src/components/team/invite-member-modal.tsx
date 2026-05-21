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
import { useTeamStore } from "@/lib/store/team-store";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteMemberModal({ isOpen, onClose }: InviteMemberModalProps) {
  const inviteMember = useTeamStore((state) => state.inviteMember);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsLoading(true);
    
    try {
      // Dispatch real invitation email via Resend API route
      const response = await fetch("/api/team/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, role }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error("Failed to send invitation email:", result.error);
      } else {
        console.log("Invitation email dispatched:", result.message || "Success");
      }
    } catch (err) {
      console.error("Network error sending invitation email:", err);
    }

    // Add member locally in Zustand store
    inviteMember(name, email, role);

    setIsLoading(false);
    setName("");
    setEmail("");
    setRole("MEMBER");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl dark:bg-gray-950">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Invite Member</DialogTitle>
          <DialogDescription>
            Send a team invitation to collaborate on projects and tasks.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label htmlFor="invite-name" className="text-sm font-semibold">Full Name</Label>
            <Input
              id="invite-name"
              placeholder="e.g. Sarah Miller"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border-gray-100 focus-visible:ring-indigo-400 dark:bg-gray-900 dark:border-gray-800"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-email" className="text-sm font-semibold">Email Address</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="e.g. sarah@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border-gray-100 focus-visible:ring-indigo-400 dark:bg-gray-900 dark:border-gray-800"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Role Authority</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["ADMIN", "MEMBER"] as const).map((r) => {
                const colors = {
                  ADMIN: "border-indigo-200 text-indigo-700 hover:bg-indigo-50 data-[state=active]:bg-indigo-100 data-[state=active]:border-indigo-500 dark:border-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-950/20 dark:data-[state=active]:bg-indigo-950/50 dark:data-[state=active]:border-indigo-500",
                  MEMBER: "border-gray-200 text-gray-700 hover:bg-gray-50 data-[state=active]:bg-gray-100 data-[state=active]:border-gray-500 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-850 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:border-gray-600",
                };
                return (
                  <button
                    key={r}
                    type="button"
                    data-state={role === r ? "active" : "inactive"}
                    onClick={() => setRole(r)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all active:scale-95 cursor-pointer text-center outline-none ${colors[r]}`}
                  >
                    {r}
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
              {isLoading ? "Inviting..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
