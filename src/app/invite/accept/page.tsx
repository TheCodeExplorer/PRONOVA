"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Users,
  Shield,
  ArrowRight,
  LogOut,
  Mail,
} from "lucide-react";

interface InviteData {
  id: string;
  workspaceId: string;
  workspaceName: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  expiresAt: string;
}

function InviteAcceptContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const { isLoaded: isUserLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  const [isLoading, setIsLoading] = useState(true);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptedSuccess, setAcceptedSuccess] = useState(false);

  // 1. Verify invitation token validity on mount
  useEffect(() => {
    if (!token) {
      setErrorMessage("No invitation token was provided in the link.");
      setErrorType("MISSING_TOKEN");
      setIsLoading(false);
      return;
    }

    async function verifyToken() {
      try {
        const res = await fetch(`/api/team/invite/verify?token=${encodeURIComponent(token!)}`);
        const json = await res.json();

        if (!res.ok || !json.valid) {
          setErrorType(json.reason || "INVALID");
          setErrorMessage(json.error || "This invitation link is invalid or expired.");
          setIsLoading(false);
          return;
        }

        setInviteData(json.data);
      } catch (err) {
        setErrorType("NETWORK_ERROR");
        setErrorMessage("Unable to verify invitation. Please check your internet connection.");
      } finally {
        setIsLoading(false);
      }
    }

    verifyToken();
  }, [token]);

  // Handle invitation acceptance
  const handleAcceptInvite = async () => {
    if (!token || !inviteData) return;

    setIsAccepting(true);
    try {
      const res = await fetch("/api/team/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.error === "ACCOUNT_MISMATCH") {
          setErrorType("ACCOUNT_MISMATCH");
          setErrorMessage(data.message);
        } else {
          setErrorMessage(data.message || "Failed to accept invitation.");
        }
        setIsAccepting(false);
        return;
      }

      setAcceptedSuccess(true);
      setTimeout(() => {
        router.push("/team");
      }, 1500);
    } catch (err) {
      setErrorMessage("Failed to accept invitation due to a network error.");
      setIsAccepting(false);
    }
  };

  const handleSwitchAccount = async () => {
    await signOut();
    const currentUrl = window.location.href;
    router.push(`/sign-in?redirect_url=${encodeURIComponent(currentUrl)}`);
  };

  if (isLoading || !isUserLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          Verifying workspace invitation...
        </p>
      </div>
    );
  }

  // Error State: Invalid, Expired, Revoked, or Already Accepted
  if (errorMessage && errorType !== "ACCOUNT_MISMATCH") {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400">
          {errorType === "ALREADY_ACCEPTED" ? (
            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <XCircle className="h-8 w-8" />
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {errorType === "ALREADY_ACCEPTED"
              ? "Already Accepted"
              : errorType === "EXPIRED"
              ? "Invitation Expired"
              : "Invalid Invitation"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            {errorMessage}
          </p>
        </div>

        <div className="pt-2">
          <Button
            onClick={() => router.push("/dashboard")}
            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!inviteData) return null;

  // Unauthenticated State: User must sign in or register with the invited email
  if (!isSignedIn) {
    const currentUrl = typeof window !== "undefined" ? window.location.href : `/invite/accept?token=${token}`;
    const signInUrl = `/sign-in?redirect_url=${encodeURIComponent(currentUrl)}`;
    const signUpUrl = `/sign-up?redirect_url=${encodeURIComponent(currentUrl)}`;

    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Users className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Workspace Invitation
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            You have been invited to join <strong className="text-gray-900 dark:text-white">{inviteData.workspaceName}</strong> as a <span className="font-semibold uppercase text-indigo-600 dark:text-indigo-400">{inviteData.role}</span>.
          </p>
        </div>

        <div className="p-3.5 bg-gray-50 dark:bg-gray-850 rounded-xl border border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <span>Invited email: <strong className="text-gray-800 dark:text-gray-200">{inviteData.email}</strong></span>
        </div>

        <div className="space-y-3 pt-2">
          <Button
            onClick={() => router.push(signInUrl)}
            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 flex items-center justify-center gap-2"
          >
            Sign In to Accept <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push(signUpUrl)}
            className="w-full rounded-xl border-gray-200 dark:border-gray-800 font-semibold py-2.5"
          >
            Create New Account
          </Button>
        </div>
      </div>
    );
  }

  // Account Mismatch Check
  const userEmails = user.emailAddresses.map((e) => e.emailAddress.trim().toLowerCase());
  const invitedEmail = inviteData.email.trim().toLowerCase();
  const currentEmail = user.primaryEmailAddress?.emailAddress || userEmails[0] || "unknown";

  if (!userEmails.includes(invitedEmail) || errorType === "ACCOUNT_MISMATCH") {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-amber-200 dark:border-amber-900/50 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Email Mismatch
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            This invitation was issued to:
          </p>
          <div className="p-2.5 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-300">
            {inviteData.email}
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            However, you are currently signed in as:
          </p>
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300">
            {currentEmail}
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          To prevent unauthorized access, you must be signed in with the account matching the invited email address.
        </p>

        <div className="space-y-3 pt-2">
          <Button
            onClick={handleSwitchAccount}
            className="w-full rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 flex items-center justify-center gap-2"
          >
            <LogOut className="h-4 w-4" /> Switch Account
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="w-full rounded-xl border-gray-200 dark:border-gray-800 font-semibold py-2.5"
          >
            Continue to Current Workspace
          </Button>
        </div>
      </div>
    );
  }

  // Success State
  if (acceptedSuccess) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-emerald-100 dark:border-emerald-900/40 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome to {inviteData.workspaceName}!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            You are now an active team member. Redirecting to your team...
          </p>
        </div>

        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  // Ready to Accept State
  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 text-center space-y-6">
      <div className="mx-auto w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
        <Users className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Join {inviteData.workspaceName}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          You are ready to accept your invitation to join this workspace as a{" "}
          <span className="font-semibold uppercase text-indigo-600 dark:text-indigo-400">
            {inviteData.role}
          </span>.
        </p>
      </div>

      <div className="p-3 bg-gray-50 dark:bg-gray-850 rounded-xl border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
        <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <span>Signed in as <strong className="text-gray-900 dark:text-white">{currentEmail}</strong></span>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl text-red-600 dark:text-red-400 text-xs">
          {errorMessage}
        </div>
      )}

      <div className="space-y-3 pt-2">
        <Button
          onClick={handleAcceptInvite}
          disabled={isAccepting}
          className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
        >
          {isAccepting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Joining Workspace...
            </>
          ) : (
            <>
              Accept Invitation <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard")}
          className="w-full rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 font-medium py-2.5 text-xs"
        >
          Decline / Return to Dashboard
        </Button>
      </div>
    </div>
  );
}

export default function InviteAcceptPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          <p className="text-gray-500 text-sm">Loading invitation...</p>
        </div>
      }
    >
      <InviteAcceptContent />
    </Suspense>
  );
}
