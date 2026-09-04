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
import { Label } from "@/components/ui/label";
import { useTeamStore } from "@/lib/store/team-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ShieldCheck, Shield, Trash2, Mail, Send, Calendar, Check, AlertCircle } from "lucide-react";

interface ManageMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string | null;
}

export function ManageMemberModal({ isOpen, onClose, memberId }: ManageMemberModalProps) {
  const members = useTeamStore((state) => state.members);
  const updateRole = useTeamStore((state) => state.updateRole);
  const removeMember = useTeamStore((state) => state.removeMember);
  const resendInvitation = useTeamStore((state) => state.resendInvitation);

  const member = members.find((m) => m.id === memberId) || null;

  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resentSuccess, setResentSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  // Sync role state when member changes
  useEffect(() => {
    if (member) {
      setRole(member.role);
      setResentSuccess(false);
      setResendError(null);
    }
  }, [member, isOpen]);

  if (!member) return null;

  const handleUpdateRole = async (newRole: "ADMIN" | "MEMBER") => {
    setRole(newRole);
    setIsUpdating(true);
    // Simulate brief action delay
    await new Promise((resolve) => setTimeout(resolve, 200));
    updateRole(member.id, newRole);
    setIsUpdating(false);
  };

  const handleRemove = async () => {
    if (confirm(`Are you sure you want to remove ${member.name} from the team?`)) {
      setIsRemoving(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      removeMember(member.id);
      setIsRemoving(false);
      onClose();
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setResendError(null);
    
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
        // Dispatches a real resend request via Resend API route
        const response = await fetch("/api/team/invite", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: member.name,
            email: member.email,
            role: member.role,
          }),
        });
        
        const result = await response.json();
        
        if (!response.ok || !result.success) {
          console.error("Failed to resend invitation email:", result.error);
          setResendError(result.error || "Failed to resend invitation email via Resend.");
          setIsResending(false);
          return;
        }

        console.log("Resend invitation email dispatched successfully:", result.message || "Success");
      } catch (err: any) {
        console.error("Network error resending invitation email:", err);
        setResendError(err.message || "Network error occurred while resending invitation.");
        setIsResending(false);
        return;
      }
    } else {
      console.log("Skipping email resend: 'Workspace Invitation Alerts' is disabled in settings.");
    }

    resendInvitation(member.id);
    setIsResending(false);
    setResentSuccess(true);
    setTimeout(() => setResentSuccess(false), 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl dark:bg-gray-950 overflow-hidden border-none shadow-xl">
        <DialogHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            Manage Member
          </DialogTitle>
          <DialogDescription>
            Configure member roles or update their team access.
          </DialogDescription>
        </DialogHeader>

        {/* Member Profile Card */}
        <div className="flex items-center gap-4 py-5 px-1">
          <Avatar className="h-16 w-16 border-2 border-indigo-100 dark:border-indigo-950 shadow-md">
            <AvatarFallback className="bg-gradient-to-tr from-indigo-500 to-purple-600 text-white text-xl font-bold">
              {member.avatar}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1 flex-1">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{member.name}</h3>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <Mail className="h-3.5 w-3.5" />
              <span className="truncate max-w-[200px]">{member.email}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 pt-0.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>Joined {member.joinedDate}</span>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              member.status === "Active" 
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" 
                : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
            }`}>
              {member.status}
            </span>
          </div>
        </div>

        <div className="space-y-5 py-4 border-t border-gray-100 dark:border-gray-800">
          {/* Role selection */}
          <div className="space-y-2.5">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Role Authority
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleUpdateRole("ADMIN")}
                className={`py-3 px-4 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer outline-none ${
                  role === "ADMIN"
                    ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/30 dark:text-indigo-400 font-bold"
                    : "border-gray-200 text-gray-600 dark:border-gray-800 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
                }`}
              >
                <ShieldCheck className={`h-5 w-5 ${role === "ADMIN" ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400"}`} />
                <span className="text-xs uppercase tracking-wider font-semibold">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleUpdateRole("MEMBER")}
                className={`py-3 px-4 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer outline-none ${
                  role === "MEMBER"
                    ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/30 dark:text-indigo-400 font-bold"
                    : "border-gray-200 text-gray-600 dark:border-gray-800 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
                }`}
              >
                <Shield className={`h-5 w-5 ${role === "MEMBER" ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400"}`} />
                <span className="text-xs uppercase tracking-wider font-semibold">Member</span>
              </button>
            </div>
          </div>

          {/* Pending specific action */}
          {member.status === "Pending" && (
            <div className="p-3 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/55 dark:border-amber-900/30 rounded-xl flex items-center justify-between">
              <div className="text-xs text-amber-800 dark:text-amber-400/90 font-medium max-w-[200px]">
                This member hasn&apos;t joined yet. You can resend the invitation link.
              </div>
              <Button
                size="sm"
                onClick={handleResend}
                disabled={isResending || resentSuccess}
                className={`rounded-lg transition-all text-xs font-semibold ${
                  resentSuccess 
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                    : "bg-amber-600 hover:bg-amber-700 text-white"
                }`}
              >
                {isResending ? (
                  "Sending..."
                ) : resentSuccess ? (
                  <span className="flex items-center gap-1">
                    <Check className="h-3 w-3" /> Resent!
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Send className="h-3 w-3" /> Resend
                  </span>
                )}
              </Button>
            </div>
          )}

          {resendError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-red-700 dark:text-red-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
              <div className="flex-1 leading-relaxed">
                <span className="font-bold block mb-0.5">Resend Error:</span>
                {resendError}
              </div>
            </div>
          )}
        </div>

        {/* Delete action */}
        <div className="pt-2 pb-4 flex justify-between items-center border-t border-gray-100 dark:border-gray-800">
          <Button
            variant="ghost"
            onClick={handleRemove}
            disabled={isRemoving}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 rounded-xl font-semibold flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Remove from Team
          </Button>

          <Button 
            onClick={onClose}
            variant="ghost"
            className="rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
