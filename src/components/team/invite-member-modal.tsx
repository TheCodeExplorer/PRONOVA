"use client";

import { useState, useEffect } from "react";
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
import { useUser } from "@clerk/nextjs";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteMemberModal({ isOpen, onClose }: InviteMemberModalProps) {
  const { user } = useUser();
  const inviteMember = useTeamStore((state) => state.inviteMember);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [isLoading, setIsLoading] = useState(false);

  // Extract user's email domain for smart email suggestion
  const userEmail = user?.primaryEmailAddress?.emailAddress || "";
  const domain = userEmail.includes("@") ? userEmail.split("@")[1] : "example.com";

  // Helper to extract the local part (before @) of an email
  const getLocalPart = (emailStr: string) => {
    return emailStr.includes("@") ? emailStr.split("@")[0] : emailStr;
  };

  // Helper to generate a clean email from the user's name
  const generateEmail = (val: string) => {
    if (!val) return "";
    const clean = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces/hyphens
      .replace(/\s+/g, ".")         // Replace spaces with dots
      .replace(/-+/g, ".");         // Replace hyphens with dots
    return `${clean}@${domain}`;
  };

  const handleNameChange = (val: string) => {
    const prevSuggested = generateEmail(name);
    setName(val);
    
    const currentLocal = getLocalPart(email);
    const prevSuggestedLocal = getLocalPart(prevSuggested);
    
    // Auto-update email only if it is currently empty or its local part matches the previous suggestion's local part
    if (email === "" || currentLocal === prevSuggestedLocal) {
      setEmail(generateEmail(val));
    }
  };

  // Reset form state when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setName("");
      setEmail("");
      setRole("MEMBER");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsLoading(true);
    
    // Check if Workspace Invitation Alerts is enabled in settings
    let shouldSendEmail = true;
    try {
      const savedSettings = localStorage.getItem("pronova_notification_settings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.emailInvites === false) {
          shouldSendEmail = false;
        }
      }
    } catch (err) {
      console.error("Error reading notification settings:", err);
    }
    
    if (shouldSendEmail) {
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
          if (result.isSandboxRestriction) {
            console.warn("Resend Sandbox restriction: Invitation registered locally, but email could not be sent to non-sandbox recipients.", result.error);
          } else {
            console.log("Invitation email dispatched:", result.message || "Success");
          }
        }
      } catch (err) {
        console.error("Network error sending invitation email:", err);
      }
    } else {
      console.log("Skipping email dispatch: 'Workspace Invitation Alerts' is disabled in settings.");
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
              onChange={(e) => handleNameChange(e.target.value)}
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
