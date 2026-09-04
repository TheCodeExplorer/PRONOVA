"use client";

import { useState, useEffect } from "react";
import { Plus, Mail, Shield, ShieldCheck, Users, Search, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatCard } from "@/components/dashboard/stat-card";
import { useTeamStore } from "@/lib/store/team-store";
import { useSearchStore } from "@/lib/store/search-store";
import { InviteMemberModal } from "@/components/team/invite-member-modal";
import { ManageMemberModal } from "@/components/team/manage-member-modal";

export default function TeamPage() {
  const members = useTeamStore((state) => state.members);
  const fetchMembers = useTeamStore((state) => state.fetchMembers);
  const isLoading = useTeamStore((state) => state.isLoading);
  const { query, setQuery } = useSearchStore();

  const [mounted, setMounted] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Fetch authoritative members from PostgreSQL on mount
  useEffect(() => {
    setMounted(true);
    fetchMembers();
  }, [fetchMembers]);

  if (!mounted || (isLoading && members.length === 0)) {
    // Elegant loading/skeleton structure that fits perfectly
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          </div>
          <div className="h-10 w-36 bg-indigo-200 dark:bg-indigo-950 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-28 bg-gray-100 dark:bg-gray-900 rounded-xl"></div>
          <div className="h-28 bg-gray-100 dark:bg-gray-900 rounded-xl"></div>
          <div className="h-28 bg-gray-100 dark:bg-gray-900 rounded-xl"></div>
        </div>
        <div className="h-64 bg-gray-100 dark:bg-gray-900 rounded-xl"></div>
      </div>
    );
  }

  // Filter members based on search query, role, and status
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(query.toLowerCase()) ||
      member.email.toLowerCase().includes(query.toLowerCase());
    const matchesRole = roleFilter === "All" || member.role === roleFilter;
    const matchesStatus = statusFilter === "All" || member.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalMembers = members.length;
  const activeAdmins = members.filter((m) => m.role === "ADMIN" && m.status === "Active").length;
  const pendingInvites = members.filter((m) => m.status === "Pending").length;

  const handleManageClick = (id: string) => {
    setSelectedMemberId(id);
    setIsManageOpen(true);
  };

  const resetAllFilters = () => {
    setQuery("");
    setRoleFilter("All");
    setStatusFilter("All");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Manage team members, roles, and pending invitations.
          </p>
        </div>
        <Button
          onClick={() => setIsInviteOpen(true)}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all active:scale-95 flex items-center justify-center font-semibold"
        >
          <Plus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Members" value={totalMembers} icon={Users} />
        <StatCard label="Active Admins" value={activeAdmins} icon={ShieldCheck} />
        <StatCard label="Pending Invites" value={pendingInvites} icon={Mail} />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="Search by name or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10 py-2 rounded-xl border-gray-200 focus-visible:ring-indigo-400 dark:bg-gray-950 dark:border-gray-850 w-full outline-none transition-all text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {/* Role Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center border rounded-xl border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-905 hover:bg-gray-50 dark:hover:bg-gray-950 px-4 py-2 text-sm font-medium cursor-pointer outline-none select-none transition-all flex-1 md:flex-initial">
              Role: {roleFilter}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl p-1.5 dark:bg-gray-950 dark:border-gray-800">
              <DropdownMenuItem onClick={() => setRoleFilter("All")} className="rounded-lg cursor-pointer text-sm">
                All Roles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleFilter("ADMIN")} className="rounded-lg cursor-pointer text-sm">
                ADMIN
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleFilter("MEMBER")} className="rounded-lg cursor-pointer text-sm">
                MEMBER
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center border rounded-xl border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-905 hover:bg-gray-50 dark:hover:bg-gray-950 px-4 py-2 text-sm font-medium cursor-pointer outline-none select-none transition-all flex-1 md:flex-initial">
              Status: {statusFilter}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl p-1.5 dark:bg-gray-950 dark:border-gray-800">
              <DropdownMenuItem onClick={() => setStatusFilter("All")} className="rounded-lg cursor-pointer text-sm">
                All Statuses
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Active")} className="rounded-lg cursor-pointer text-sm">
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Pending")} className="rounded-lg cursor-pointer text-sm">
                Pending
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {(roleFilter !== "All" || statusFilter !== "All" || query !== "") && (
            <Button
              variant="ghost"
              onClick={resetAllFilters}
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold px-3 rounded-xl flex items-center gap-1 text-sm cursor-pointer"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No members found</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mt-1">
              Try adjusting your search query or filters, or invite a new member to the team.
            </p>
            {(roleFilter !== "All" || statusFilter !== "All" || query !== "") && (
              <Button
                variant="outline"
                onClick={resetAllFilters}
                className="mt-4 rounded-xl border-gray-200 dark:border-gray-800"
              >
                Reset Filters
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-gray-950/20">
              <TableRow className="border-gray-100 dark:border-gray-800 hover:bg-transparent">
                <TableHead className="font-semibold text-gray-600 dark:text-gray-400">Member</TableHead>
                <TableHead className="font-semibold text-gray-600 dark:text-gray-400">Email</TableHead>
                <TableHead className="font-semibold text-gray-600 dark:text-gray-400">Role</TableHead>
                <TableHead className="font-semibold text-gray-600 dark:text-gray-400">Status</TableHead>
                <TableHead className="font-semibold text-gray-600 dark:text-gray-400">Joined Date</TableHead>
                <TableHead className="text-right font-semibold text-gray-600 dark:text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow
                  key={member.id}
                  className="border-gray-50 dark:border-gray-850 hover:bg-gray-50/30 dark:hover:bg-gray-850/20 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-gray-100 dark:border-gray-800 shadow-sm">
                        <AvatarFallback className="bg-gradient-to-tr from-indigo-500 to-purple-600 text-white text-xs font-bold">
                          {member.avatar || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white block leading-tight">
                          {member.name}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500 dark:text-gray-400 font-medium">
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate max-w-[180px]">{member.email}</span>
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`rounded-lg font-semibold px-2.5 py-0.5 border-none inline-flex items-center gap-1.5 shadow-none text-xs ${
                        member.role === "ADMIN"
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300"
                      }`}
                    >
                      {member.role === "ADMIN" ? (
                        <ShieldCheck className="h-3 w-3" />
                      ) : (
                        <Shield className="h-3 w-3" />
                      )}
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        member.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                      }`}
                    >
                      {member.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                    {member.joinedDate}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleManageClick(member.id)}
                      className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/30 rounded-xl font-semibold transition-all cursor-pointer"
                    >
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Modals */}
      <InviteMemberModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
      <ManageMemberModal
        isOpen={isManageOpen}
        onClose={() => {
          setIsManageOpen(false);
          setSelectedMemberId(null);
        }}
        memberId={selectedMemberId}
      />
    </div>
  );
}
