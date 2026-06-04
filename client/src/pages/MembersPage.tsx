import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  useMembers,
  useAddMember,
  useRemoveMember,
  useUpdateMemberRole,
} from "../hooks/useMembers";
import { useWorkspace } from "../hooks/useWorkspaces";
import { useAuth } from "../contexts/AuthContext";
import Card from "../components/Card";
import Badge from "../components/Badge";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import Button from "../components/Button";
import Input from "../components/Input";

const roleTone = {
  OWNER: "urgent",
  ADMIN: "high",
  MEMBER: "low",
} as const;

const roleLabel = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
};

export default function MembersPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { user } = useAuth();
  const { data: workspace } = useWorkspace(workspaceId!);
  const { data: members, isLoading, isError } = useMembers(workspaceId);
  const addMutation = useAddMember(workspaceId!);
  const removeMutation = useRemoveMember(workspaceId!);
  const roleMutation = useUpdateMemberRole(workspaceId!);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"MEMBER" | "ADMIN">("MEMBER");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const myRole = members?.find((m) => m.user.id === user?.id)?.role;
  const canInvite = myRole === "ADMIN" || myRole === "OWNER";
  const canRemove = canInvite; // same rule
  const canChangeRole = myRole === "OWNER";

  const handleInvite = () => {
    setInviteError(null);
    if (!inviteEmail.trim()) return;
    addMutation.mutate(
      { email: inviteEmail.trim(), role: inviteRole },
      {
        onSuccess: () => {
          setInviteEmail("");
          setInviteRole("MEMBER");
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { error?: string } } })?.response
              ?.data?.error ?? "Failed to add member.";
          setInviteError(msg);
        },
      },
    );
  };

  const handleRemove = (memberUserId: string, memberName: string) => {
    setActionError(null);
    const ok = window.confirm(
      `Remove ${memberName} from this workspace? They will lose access immediately.`,
    );
    if (!ok) return;
    removeMutation.mutate(memberUserId, {
      onError: (err: unknown) => {
        const msg =
          (err as { response?: { data?: { error?: string } } })?.response?.data
            ?.error ?? "Failed to remove member.";
        setActionError(msg);
      },
    });
  };

  const handleRoleChange = (
    memberUserId: string,
    newRole: "ADMIN" | "MEMBER",
  ) => {
    setActionError(null);
    roleMutation.mutate(
      { userId: memberUserId, role: newRole },
      {
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { error?: string } } })?.response
              ?.data?.error ?? "Failed to change role.";
          setActionError(msg);
        },
      },
    );
  };

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        to={`/workspaces/${workspaceId}/projects`}
        className="inline-flex items-center text-sm text-text-muted hover:text-text transition-colors"
      >
        <span className="mr-1">←</span> Back to Projects
      </Link>

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">
            {workspace ? (
              <>
                <span className="text-text-muted font-normal">
                  {workspace.name}
                </span>
                <span className="mx-2 text-text-subtle font-normal">·</span>
                Members
              </>
            ) : (
              "Members"
            )}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage who has access to this workspace.
          </p>
        </div>

        {myRole && (
          <span className="text-sm text-text-muted">
            Your role:{" "}
            <Badge tone={roleTone[myRole]}>{roleLabel[myRole]}</Badge>
          </span>
        )}
      </div>

      {/* Invite form */}
      {canInvite && (
        <Card className="!p-4">
          <p className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wide">
            Invite a member
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => {
                setInviteEmail(e.target.value);
                if (inviteError) setInviteError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              placeholder="email@example.com"
              className="flex-1"
            />
            <select
              value={inviteRole}
              onChange={(e) => {
                setInviteRole(e.target.value as "MEMBER" | "ADMIN");
                if (inviteError) setInviteError(null);
              }}
              className="text-sm px-3 py-2 border border-border rounded-md bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
            <Button
              onClick={handleInvite}
              disabled={addMutation.isPending || !inviteEmail.trim()}
            >
              {addMutation.isPending ? "Adding…" : "Add member"}
            </Button>
          </div>
          {inviteError && (
            <p className="mt-2 text-sm text-danger">{inviteError}</p>
          )}
        </Card>
      )}

      {/* Generic action error (remove / role change) */}
      {actionError && (
        <Card className="!p-3 !bg-red-50 !border-red-200">
          <p className="text-sm text-danger">{actionError}</p>
        </Card>
      )}

      {/* Members list */}
      {isLoading ? (
        <Spinner label="Loading members…" />
      ) : isError ? (
        <Card>
          <p className="text-sm text-danger">Failed to load members.</p>
        </Card>
      ) : !members || members.length === 0 ? (
        <EmptyState
          title="No members yet"
          description="Invite people to collaborate."
        />
      ) : (
        <Card className="!p-0 divide-y divide-border">
          {members.map((m) => {
            const initial = m.user.name.charAt(0).toUpperCase();
            const isOwner = m.role === "OWNER";
            const isSelf = m.user.id === user?.id;
            const showRemove = canRemove && !isOwner && !isSelf;
            const showRoleSelector = canChangeRole && !isOwner && !isSelf;
            const isWorking =
              removeMutation.isPending || roleMutation.isPending;

            return (
              <div key={m.id} className="flex items-center gap-4 px-4 py-3">
                <span className="w-9 h-9 rounded-full bg-primary text-white text-sm font-semibold flex items-center justify-center shrink-0">
                  {initial}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">
                    {m.user.name}
                    {isSelf && (
                      <span className="ml-2 text-xs text-text-subtle font-normal">
                        (you)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-text-muted truncate">
                    {m.user.email}
                  </p>
                </div>

                {showRoleSelector ? (
                  <select
                    value={m.role}
                    onChange={(e) =>
                      handleRoleChange(
                        m.user.id,
                        e.target.value as "ADMIN" | "MEMBER",
                      )
                    }
                    disabled={isWorking}
                    className="text-xs px-2 py-1 border border-border rounded-md bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                ) : (
                  <Badge tone={roleTone[m.role]}>{roleLabel[m.role]}</Badge>
                )}

                {showRemove && (
                  <button
                    onClick={() => handleRemove(m.user.id, m.user.name)}
                    disabled={isWorking}
                    className="text-xs text-text-muted hover:text-danger transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
