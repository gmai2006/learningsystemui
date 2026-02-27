import { useCallback, useEffect, useMemo, useState } from "react";
import { PageScaffold } from "../PageScaffold";
import { DataTable } from "../DataTable";
import { Plus } from "lucide-react";
import apiClient from "../api/ApiClient";
import UtilizationDrawer, { UtilizationRow } from "./UtilizationDrawer";

type BackendUtilization = {
  utilizationId: string;
  aircraftId?: string | null;
  utilizationDate?: string | null; // or date in some APIs
  date?: string | null;

  hours?: number | null;
  cycles?: number | null;
  notes?: string | null;

  createdAt?: string | null;
  updatedAt?: string | null;
};

type PageSize = 5 | 10 | 20;

function toUtilizationRow(u: BackendUtilization): UtilizationRow {
  return {
    id: u.utilizationId,
    aircraftId: u.aircraftId ?? null,
    utilizationDate: (u.utilizationDate ?? u.date ?? null) as any,
    hours: u.hours ?? null,
    cycles: u.cycles ?? null,
    notes: u.notes ?? "",
    createdAt: u.createdAt ?? null,
    updatedAt: u.updatedAt ?? null,
  };
}

function extractUtilization(data: any): BackendUtilization[] {
  const content = data?.content ?? data;
  return Array.isArray(content) ? content : [];
}

function fmtDate(s?: string | null): string {
  if (!s) return "—";
  return s.slice(0, 10);
}

export function UtilizationPage({
  canCreate,
  canEdit,
}: {
  canCreate: boolean;
  canEdit: boolean;
}) {
  const [q, setQ] = useState("");

  const [utilization, setUtilization] = useState<UtilizationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<UtilizationRow | null>(null);

  // Pagination state
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [pageIndex, setPageIndex] = useState(0);

  const loadUtilization = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("utilization/selectAll");
      setUtilization(extractUtilization(res.data).map(toUtilizationRow));
    } catch {
      setError("Unable to load utilization.");
      setUtilization([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUtilization();
  }, [loadUtilization]);

  useEffect(() => {
    setPageIndex(0);
  }, [q, pageSize]);

  const filtered = useMemo(() => {
    const qLower = q.trim().toLowerCase();
    return utilization.filter((u) => {
      if (!qLower) return true;
      const haystack = [
        u.aircraftId ?? "",
        u.utilizationDate ?? "",
        u.hours == null ? "" : String(u.hours),
        u.cycles == null ? "" : String(u.cycles),
        u.notes ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(qLower);
    });
  }, [utilization, q]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);

  const paged = useMemo(() => {
    const start = safePageIndex * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePageIndex, pageSize]);

  const rows = useMemo(() => {
    return paged.map((u) => ({
      id: u.id,
      cells: {
        utilization: (
          <div className="space-y-0.5">
            <div className="font-medium">{fmtDate(u.utilizationDate)}</div>
            <div className="text-xs text-zinc-500">
              Aircraft: {u.aircraftId || "—"}
            </div>
          </div>
        ),
        hours: <span className="text-sm">{u.hours ?? "—"}</span>,
        cycles: <span className="text-sm">{u.cycles ?? "—"}</span>,
      },
    }));
  }, [paged]);

  const showingFrom = total === 0 ? 0 : safePageIndex * pageSize + 1;
  const showingTo = Math.min(total, safePageIndex * pageSize + paged.length);

  const canPrev = safePageIndex > 0;
  const canNext = safePageIndex < pageCount - 1;

  function openCreate() {
    if (!canCreate) return;
    setDrawerMode("create");
    setSelected(null);
    setDrawerOpen(true);
  }

  function openEdit(u: UtilizationRow | null) {
    if (!u) return;
    setDrawerMode("edit");
    setSelected(u);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
  }

  function upsertSaved(saved: UtilizationRow) {
    setUtilization((prev) => {
      const idx = prev.findIndex((x) => x.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  }

  return (
    <>
      <PageScaffold
        header={
          <div>
            <div className="text-sm text-zinc-500">Administration</div>
            <div className="text-xl font-semibold">Utilization</div>
          </div>
        }
        actions={
          canCreate ? (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-md bg-zinc-900 text-white px-3 py-2 text-sm hover:bg-zinc-800"
            >
              <Plus className="h-4 w-4" />
              New Utilization
            </button>
          ) : null
        }
        filters={
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              className="flex-1 rounded-md border px-3 py-2 text-sm"
              placeholder="Search aircraft, date, hours/cycles, notes…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

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
          <div className="px-4 py-6 text-sm text-zinc-500">Loading utilization…</div>
        ) : error ? (
          <div className="px-4 py-6 text-sm text-red-600">{error}</div>
        ) : (
          <>
            <DataTable
              columns={[
                { key: "utilization", header: "Utilization" },
                { key: "hours", header: "Hours", className: "w-24" },
                { key: "cycles", header: "Cycles", className: "w-24" },
              ]}
              rows={rows}
              onRowClick={(id) => openEdit(utilization.find((x) => x.id === id) || null)}
            />

            <div className="border-t px-4 py-3 text-xs text-zinc-500 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <span>
                Showing {showingFrom}-{showingTo} of {total}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">
                  Page {total === 0 ? 0 : safePageIndex + 1} / {total === 0 ? 0 : pageCount}
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

      <UtilizationDrawer
        open={drawerOpen}
        mode={drawerMode}
        utilization={selected}
        canEdit={canEdit}
        onClose={closeDrawer}
        onSaved={upsertSaved}
      />
    </>
  );
}