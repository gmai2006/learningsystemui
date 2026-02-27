// UsersPage.tsx
import { useEffect, useMemo, useState } from "react";
import { PageScaffold } from "../PageScaffold";
import { DataTable } from "../DataTable";
import { Drawer } from "../Drawer";
import { Plus, ShieldCheck, ShieldOff } from "lucide-react";

import apiClient from "../api/ApiClient";
import init from "../init";
import UserDrawer from "./UserDrawer";

type BackendUser = {
  userId: string;
  username: string;
  displayName?: string | null;
  email: string;
  isActive: boolean;
  externalIdpSub?: string | null;
  roles: Role[],
  createdAt?: string | null;
  updatedAt?: string | null;
};

type Role = {
  roleId: string;
  name: string;
}

type UserRow = {
  id: string;
  username: string;
  displayName?: string | null;
  email: string;
  active: boolean;
  externalIdpSub?: string | null;
  roles: Role[];
  createdAt?: string | null;
  updatedAt?: string | null;
};

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";
type PageSize = 5 | 10 | 20;

function toUserRow(u: BackendUser): UserRow {
  return {
    id: u.userId,
    username: u.username,
    displayName: u.displayName ?? null,
    email: u.email,
    active: !!u.isActive,
    externalIdpSub: u.externalIdpSub ?? null,
    roles: u.roles,
    createdAt: u.createdAt ?? null,
    updatedAt: u.updatedAt ?? null
  };
}

function extractUsers(data: any): BackendUser[] {
  // supports:
  //   - { content: BackendUser[] }  (your usual wrapper)
  //   - BackendUser[]              (raw array)
  const content = data?.content ?? data;
  return Array.isArray(content) ? content : [];
}

export function UsersPage({
  canCreate,
  canEdit,
  canAssignRoles,
}: {
  canCreate: boolean;
  canEdit: boolean;
  canAssignRoles: boolean;
}) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [selected, setSelected] = useState<UserRow | null>(null);

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [pageIndex, setPageIndex] = useState<number>(0); // 0-based

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Required URI:
        const uri = "users/selectAll";
        const res = await apiClient.get(uri);

        const backendUsers = extractUsers(res.data); // keep convention: res.data.content
        const mapped = backendUsers.map(toUserRow);

        if (!cancelled) setUsers(mapped);
      } catch {
        if (!cancelled) {
          setError("Unable to load users.");
          setUsers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Reset pagination when filters/search/pageSize changes
  useEffect(() => {
    setPageIndex(0);
  }, [q, status, pageSize]);

  const filteredUsers = useMemo(() => {
    const qLower = q.trim().toLowerCase();

    return users
      .filter((u) => {
        if (status === "ACTIVE") return u.active;
        if (status === "INACTIVE") return !u.active;
        return true;
      })
      .filter((u) => {
        if (!qLower) return true;

        const haystack = [
          u.displayName ?? "",
          u.username,
          u.email,
          u.externalIdpSub ?? "",
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(qLower);
      });
  }, [users, q, status]);

  const total = filteredUsers.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);

  const pagedUsers = useMemo(() => {
    const start = safePageIndex * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, safePageIndex, pageSize]);

  const rows = useMemo(() => {
    return pagedUsers.map((u) => ({
      id: u.id,
      cells: {
        user: (
          <div className="space-y-0.5">
            <div className="font-medium">
              {u.displayName ? u.displayName : u.username}
            </div>
            <div className="text-xs text-zinc-500">
              <span>{u.email}</span>
              <span className="mx-1">•</span>
              <span className="text-zinc-600">@{u.username}</span>
            </div>
          </div>
        ),
        roles: <span className="text-zinc-700">{u.roles.length}</span>,
        status: (
          <span
            className={[
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs",
              u.active
                ? "bg-emerald-50 text-emerald-700"
                : "bg-zinc-100 text-zinc-700",
            ].join(" ")}
          >
            {u.active ? "Active" : "Inactive"}
          </span>
        ),
      },
    }));
  }, [pagedUsers]);

  const showingFrom = total === 0 ? 0 : safePageIndex * pageSize + 1;
  const showingTo = Math.min(total, safePageIndex * pageSize + pagedUsers.length);

  const canPrev = safePageIndex > 0;
  const canNext = safePageIndex < pageCount - 1;

  return (
    <>
      <PageScaffold
        header={
          <div>
            <div className="text-sm text-zinc-500">Administration</div>
            <div className="text-xl font-semibold">Users</div>
          </div>
        }
        actions={
          canCreate ? (
            <button className="inline-flex items-center gap-2 rounded-md bg-zinc-900 text-white px-3 py-2 text-sm hover:bg-zinc-800">
              <Plus className="h-4 w-4" />
              New user
            </button>
          ) : null
        }
        filters={
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              className="flex-1 rounded-md border px-3 py-2 text-sm"
              placeholder="Search display name, username, email…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <select
              className="rounded-md border px-3 py-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            <select
              className="rounded-md border px-3 py-2 text-sm"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value) as PageSize)}
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
            </select>
          </div>
        }
      >
        {loading ? (
          <div className="px-4 py-6 text-sm text-zinc-500">Loading users…</div>
        ) : error ? (
          <div className="px-4 py-6 text-sm text-red-600">{error}</div>
        ) : (
          <>
            <DataTable
              columns={[
                { key: "user", header: "User" },
                { key: "roles", header: "Roles", className: "w-24" },
                { key: "status", header: "Status", className: "w-28" },
              ]}
              rows={rows}
              onRowClick={(id) => {
                const u = users.find((x) => x.id === id) || null;
                setSelected(u);
              }}
            />

            <div className="border-t px-4 py-3 text-xs text-zinc-500 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <span>
                Showing {showingFrom}-{showingTo} of {total}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">
                  Page {total === 0 ? 0 : safePageIndex + 1} /{" "}
                  {total === 0 ? 0 : pageCount}
                </span>

                <button
                  disabled={!canPrev}
                  onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                  className={[
                    "rounded-md border px-2 py-1",
                    canPrev ? "hover:bg-zinc-50" : "opacity-50 cursor-not-allowed",
                  ].join(" ")}
                >
                  Prev
                </button>

                <button
                  disabled={!canNext}
                  onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
                  className={[
                    "rounded-md border px-2 py-1",
                    canNext ? "hover:bg-zinc-50" : "opacity-50 cursor-not-allowed",
                  ].join(" ")}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </PageScaffold>

      <UserDrawer selected={selected} setSelected={setSelected} canAssignRoles={true} canEdit={true} onUserUpdated={null} />
      {/* <Drawer
        open={!!selected}
        title={
          selected
            ? `User: ${selected.displayName ? selected.displayName : selected.username}`
            : "User"
        }
        onClose={() => setSelected(null)}
      >
        {selected ? (
          <div className="space-y-4">
            <div className="rounded-md border p-3">
              <div className="text-xs text-zinc-500">Display name</div>
              <div className="font-medium">{selected.displayName || "—"}</div>
            </div>

            <div className="rounded-md border p-3">
              <div className="text-xs text-zinc-500">Username</div>
              <div className="font-medium">@{selected.username}</div>
            </div>

            <div className="rounded-md border p-3">
              <div className="text-xs text-zinc-500">Email</div>
              <div className="font-medium">{selected.email}</div>
            </div>

            <div className="rounded-md border p-3">
              <div className="text-xs text-zinc-500">External IDP Subject</div>
              <div className="font-medium break-all">
                {selected.externalIdpSub || "—"}
              </div>
            </div>

            <div className="rounded-md border p-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-zinc-500">Created</div>
                  <div className="font-medium">{selected.createdAt || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Updated</div>
                  <div className="font-medium">{selected.updatedAt || "—"}</div>
                </div>
              </div>
            </div>

            <div className="rounded-md border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Roles</div>
                  <div className="text-xs text-zinc-500">Assign roles to this user</div>
                </div>
                <button
                  disabled={!canAssignRoles}
                  className={[
                    "rounded-md border px-3 py-2 text-sm",
                    canAssignRoles ? "hover:bg-zinc-50" : "opacity-50 cursor-not-allowed",
                  ].join(" ")}
                >
                  Manage roles
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs rounded-full bg-zinc-100 px-2 py-1">—</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                disabled={!canEdit}
                className={[
                  "flex-1 rounded-md bg-zinc-900 text-white px-3 py-2 text-sm hover:bg-zinc-800",
                  !canEdit ? "opacity-50 cursor-not-allowed hover:bg-zinc-900" : "",
                ].join(" ")}
              >
                Save changes
              </button>

              <button
                disabled={!canEdit}
                className={[
                  "inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm",
                  !canEdit ? "opacity-50 cursor-not-allowed" : "hover:bg-zinc-50",
                ].join(" ")}
              >
                {selected.active ? (
                  <ShieldOff className="h-4 w-4" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                {selected.active ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ) : null}
      </Drawer> */}
    </>
  );
}