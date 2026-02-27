import { useCallback, useEffect, useMemo, useState } from "react";
import { PageScaffold } from "../PageScaffold";
import { DataTable } from "../DataTable";
import { Plus } from "lucide-react";
import apiClient from "../api/ApiClient";
import AircraftDrawer, { AircraftRow, AircraftStatus } from "./AircraftDrawer";

type BackendAircraft = {
  aircraftId: string;
  tailNumber?: string | null;
  make?: string | null;
  model?: string | null;
  serialNumber?: string | null;

  // ✅ replace isActive with status
  status?: AircraftStatus | null;

  createdAt?: string | null;
  updatedAt?: string | null;
};

type StatusFilter = "ALL" | AircraftStatus;
type PageSize = 5 | 10 | 20;

function normalizeStatus(s: any): AircraftStatus {
  // default to ACTIVE if missing/unknown
  const v = (s ?? "ACTIVE") as string;
  const allowed: AircraftStatus[] = [
    "PENDING",
    "IN_PROGRESS",
    "CLOSED",
    "ACTIVE",
    "INACTIVE",
    "OPEN",
  ];
  return (allowed as string[]).includes(v) ? (v as AircraftStatus) : "ACTIVE";
}

function toAircraftRow(a: BackendAircraft): AircraftRow {
  return {
    id: a.aircraftId,
    tailNumber: a.tailNumber ?? null,
    make: a.make ?? null,
    model: a.model ?? null,
    serialNumber: a.serialNumber ?? null,
    status: normalizeStatus(a.status),
    createdAt: a.createdAt ?? null,
    updatedAt: a.updatedAt ?? null,
  };
}

function extractAircraft(data: any): BackendAircraft[] {
  const content = data?.content ?? data;
  return Array.isArray(content) ? content : [];
}

function statusBadgeClass(status: AircraftStatus): string {
  // Keep it simple: "ACTIVE" green, everything else neutral
  if (status === "ACTIVE") return "bg-emerald-50 text-emerald-700";
  if (status === "INACTIVE") return "bg-zinc-100 text-zinc-700";
  return "bg-blue-50 text-blue-700";
}

function statusLabel(status: AircraftStatus): string {
  switch (status) {
    case "IN_PROGRESS":
      return "In Progress";
    default:
      // Title-case-ish
      return status 
      ? 
        status
        .toLowerCase()
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
        : status;
  }
}

export function AircraftPage({
  canCreate,
  canEdit,
}: {
  canCreate: boolean;
  canEdit: boolean;
}) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");

  const [aircraft, setAircraft] = useState<AircraftRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<AircraftRow | null>(null);

  // Pagination state
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [pageIndex, setPageIndex] = useState(0);

  const loadAircraft = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("aircraft/selectAll");
      setAircraft(extractAircraft(res.data).map(toAircraftRow));
    } catch {
      setError("Unable to load aircraft.");
      setAircraft([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAircraft();
  }, [loadAircraft]);

  useEffect(() => {
    setPageIndex(0);
  }, [q, status, pageSize]);

  const filtered = useMemo(() => {
    const qLower = q.trim().toLowerCase();

    return aircraft
      .filter((a) => (status === "ALL" ? true : a.status === status))
      .filter((a) => {
        if (!qLower) return true;
        const haystack = [a.tailNumber ?? "", a.make ?? "", a.model ?? "", a.serialNumber ?? ""]
          .join(" ")
          .toLowerCase();
        return haystack.includes(qLower);
      });
  }, [aircraft, q, status]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);

  const paged = useMemo(() => {
    const start = safePageIndex * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePageIndex, pageSize]);

  const rows = useMemo(() => {
    return paged.map((a) => ({
      id: a.id,
      cells: {
        aircraft: (
          <div className="space-y-0.5">
            <div className="font-medium">{a.tailNumber || a.id}</div>
            <div className="text-xs text-zinc-500">
              {[a.make, a.model].filter(Boolean).join(" ") || "—"}
            </div>
          </div>
        ),
        status: (
          <span
            className={[
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs",
              statusBadgeClass(a.status),
            ].join(" ")}
          >
            {statusLabel(a.status)}
          </span>
        ),
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

  function openEdit(a: AircraftRow | null) {
    if (!a) return;
    setDrawerMode("edit");
    setSelected(a);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
  }

  function upsertSaved(saved: AircraftRow) {
    setAircraft((prev) => {
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
            <div className="text-xl font-semibold">Aircraft</div>
          </div>
        }
        actions={
          canCreate ? (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-md bg-zinc-900 text-white px-3 py-2 text-sm hover:bg-zinc-800"
            >
              <Plus className="h-4 w-4" />
              New Aircraft
            </button>
          ) : null
        }
        filters={
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              className="flex-1 rounded-md border px-3 py-2 text-sm"
              placeholder="Search tail #, make/model, serial…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <select
              className="rounded-md border px-3 py-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
            >
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="CLOSED">Closed</option>
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
          <div className="px-4 py-6 text-sm text-zinc-500">Loading aircraft…</div>
        ) : error ? (
          <div className="px-4 py-6 text-sm text-red-600">{error}</div>
        ) : (
          <>
            <DataTable
              columns={[
                { key: "aircraft", header: "Aircraft" },
                { key: "status", header: "Status", className: "w-32" },
              ]}
              rows={rows}
              onRowClick={(id) => openEdit(aircraft.find((x) => x.id === id) || null)}
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

      <AircraftDrawer
        open={drawerOpen}
        mode={drawerMode}
        aircraft={selected}
        canEdit={canEdit}
        onClose={closeDrawer}
        onSaved={upsertSaved}
      />
    </>
  );
}