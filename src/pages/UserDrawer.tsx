import { useEffect, useMemo, useState } from "react";
import apiClient from "../api/ApiClient"; // adjust path
import { ShieldOff, ShieldCheck, X } from "lucide-react";
import { Drawer } from "../Drawer";

function normalizeRoleLabel(role) {
  // user payload uses { roleId, name }
  // role payload uses { roleId, roleName }
  return role?.name ?? role?.roleName ?? "—";
}

function roleIdOf(role) {
  return role?.roleId;
}

export default function UserDrawer({
  selected,
  setSelected,
  canAssignRoles,
  canEdit,
  // optional: if parent wants to refresh user list after save
  onUserUpdated,
}) {
  const [allRoles, setAllRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState(null);

  const [manageOpen, setManageOpen] = useState(false);

  // selection inside "Manage roles" UI
  const [draftRoleIds, setDraftRoleIds] = useState(new Set());
  const [savingRoles, setSavingRoles] = useState(false);

  // current user role ids (from payload)
  const currentRoleIds = useMemo(() => {
    const ids = (selected?.roles || []).map(roleIdOf).filter(Boolean);
    return new Set(ids);
  }, [selected]);

  // whenever drawer opens on a user, seed draft selection from user payload
  useEffect(() => {
    if (!selected) return;
    setDraftRoleIds(new Set(Array.from(currentRoleIds)));
    setManageOpen(false);
    setRolesError(null);
  }, [selected, currentRoleIds]);

  // load all roles when user clicks "Manage roles" (or you can load on drawer open)
  async function loadAllRoles() {
    setRolesLoading(true);
    setRolesError(null);
    try {
      const res = await apiClient.get("roles/selectAll");
      const roles = res?.data?.content ?? [];
      setAllRoles(Array.isArray(roles) ? roles : []);
    } catch (e) {
      setRolesError("Failed to load roles.");
    } finally {
      setRolesLoading(false);
    }
  }

  function toggleDraftRole(roleId) {
    setDraftRoleIds((prev) => {
      const next = new Set(prev);
      if (next.has(roleId)) next.delete(roleId);
      else next.add(roleId);
      return next;
    });
  }

  function removeRoleChip(roleId) {
    if (!canAssignRoles) return;
    setDraftRoleIds((prev) => {
      const next = new Set(prev);
      next.delete(roleId);
      return next;
    });
    // also open manage panel so the change is obvious
    setManageOpen(true);
  }

  async function saveRoleChanges() {
    if (!selected) return;

    const userId = selected.userId;

    // diff
    const toAdd = [];
    const toRemove = [];

    for (const id of draftRoleIds) {
      if (!currentRoleIds.has(id)) toAdd.push(id);
    }
    for (const id of currentRoleIds) {
      if (!draftRoleIds.has(id)) toRemove.push(id);
    }

    if (toAdd.length === 0 && toRemove.length === 0) {
      setManageOpen(false);
      return;
    }

    setSavingRoles(true);
    try {
      // If you have a batch endpoint, replace this with ONE request.
      await Promise.all([
        ...toAdd.map((roleId) => apiClient.post(`/users/${userId}/roles/${roleId}`)),
        ...toRemove.map((roleId) => apiClient.delete(`/users/${userId}/roles/${roleId}`)),
      ]);

      // Update local selected object so UI reflects changes immediately
      // (You can also re-fetch the selected user from server instead.)
      const roleIdToRole = new Map(
        allRoles.map((r) => [r.roleId, { roleId: r.roleId, name: r.roleName }])
      );

      const updatedRoles = Array.from(draftRoleIds).map((rid) => {
        // keep name from lookup, fallback to existing user roles if present
        const fromAll = roleIdToRole.get(rid);
        const fromUser = (selected.roles || []).find((x) => x.roleId === rid);
        return fromAll || fromUser || { roleId: rid, name: rid };
      });

      const updatedSelected = { ...selected, roles: updatedRoles };
      // If parent stores `selected` state, you can lift this update up instead.
      // Here we just close the manage panel; parent should pass setter if needed.
      setManageOpen(false);

      if (onUserUpdated) onUserUpdated(updatedSelected);
    } finally {
      setSavingRoles(false);
    }
  }

  return (
    <Drawer
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
            <div className="font-medium break-all">{selected.externalIdpSub || "—"}</div>
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

          {/* ROLES */}
          <div className="rounded-md border p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium">Roles</div>
                <div className="text-xs text-zinc-500">Assign roles to this user</div>
              </div>

              <button
                disabled={!canAssignRoles}
                onClick={async () => {
                  setManageOpen((v) => !v);
                  if (!manageOpen && allRoles.length === 0) {
                    await loadAllRoles();
                  }
                }}
                className={[
                  "rounded-md border px-3 py-2 text-sm",
                  canAssignRoles ? "hover:bg-zinc-50" : "opacity-50 cursor-not-allowed",
                ].join(" ")}
              >
                {manageOpen ? "Close" : "Manage roles"}
              </button>
            </div>

            {/* Current roles as chips */}
            <div className="mt-3 flex flex-wrap gap-2">
              {(selected.roles || []).length === 0 ? (
                <span className="text-xs rounded-full bg-zinc-100 px-2 py-1">—</span>
              ) : (
                (selected.roles || []).map((r) => (
                  <span
                    key={r.roleId}
                    className="inline-flex items-center gap-1 text-xs rounded-full bg-zinc-100 px-2 py-1"
                    title={normalizeRoleLabel(r)}
                  >
                    {normalizeRoleLabel(r)}
                    {canAssignRoles ? (
                      <button
                        type="button"
                        onClick={() => removeRoleChip(r.roleId)}
                        className="ml-1 rounded-full hover:bg-zinc-200 p-0.5"
                        aria-label="Remove role"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    ) : null}
                  </span>
                ))
              )}
            </div>

            {/* Manage roles panel */}
            {manageOpen ? (
              <div className="mt-4 border-t pt-4 space-y-3">
                {rolesLoading ? (
                  <div className="text-sm text-zinc-500">Loading roles…</div>
                ) : rolesError ? (
                  <div className="text-sm text-red-600">{rolesError}</div>
                ) : (
                  <div className="max-h-64 overflow-auto rounded-md border">
                    <ul className="divide-y">
                      {allRoles.map((role) => {
                        const checked = draftRoleIds.has(role.roleId);
                        return (
                          <li key={role.roleId} className="p-3">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                className="mt-1"
                                checked={checked}
                                onChange={() => toggleDraftRole(role.roleId)}
                                disabled={!canAssignRoles || savingRoles}
                              />
                              <div className="min-w-0">
                                <div className="font-medium truncate">
                                  {role.roleName}
                                </div>
                                <div className="text-xs text-zinc-500 break-words">
                                  {role.description || "—"}
                                </div>
                              </div>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={!canAssignRoles || savingRoles}
                    onClick={saveRoleChanges}
                    className={[
                      "rounded-md bg-zinc-900 text-white px-3 py-2 text-sm hover:bg-zinc-800",
                      (!canAssignRoles || savingRoles)
                        ? "opacity-50 cursor-not-allowed hover:bg-zinc-900"
                        : "",
                    ].join(" ")}
                  >
                    {savingRoles ? "Saving…" : "Save roles"}
                  </button>

                  <button
                    type="button"
                    disabled={savingRoles}
                    onClick={() => {
                      // reset draft back to current
                      setDraftRoleIds(new Set(Array.from(currentRoleIds)));
                      setManageOpen(false);
                    }}
                    className={[
                      "rounded-md border px-3 py-2 text-sm",
                      savingRoles ? "opacity-50 cursor-not-allowed" : "hover:bg-zinc-50",
                    ].join(" ")}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Existing actions */}
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
              {selected.isActive ? (
                <ShieldOff className="h-4 w-4" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              {selected.isActive ? "Deactivate" : "Activate"}
            </button>
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}