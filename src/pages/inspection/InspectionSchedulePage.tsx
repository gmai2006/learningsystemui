import React, { useEffect, useMemo, useState } from "react";
import apiClient from "../../api/ApiClient";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import InspectionScheduleDrawer from "./InspectionScheduleDrawer";
import { VInspectionScheduleRow } from "./inspectionTypes";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function InspectionSchedulePage() {
  const [rows, setRows] = useState<VInspectionScheduleRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [aircraftId, setAircraftId] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<VInspectionScheduleRow | null>(null);

  const fetchRows = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        pageSize,
      };
      if (from) params.from = from;
      if (to) params.to = to;
      if (status) params.status = status;
      if (aircraftId) params.aircraftId = aircraftId;
      if (search) params.search = search;

      const res = await apiClient.get("/inspectionschedule/selectAll", { params });
      setRows(res.data.content || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const openCreate = () => {
    setSelected(null);
    setDrawerOpen(true);
  };

  const openEdit = (r: VInspectionScheduleRow) => {
    setSelected(r);
    setDrawerOpen(true);
  };

  const dueBadge = (s?: string | null) => {
    const v = (s || "OPEN").toUpperCase();
    const cls =
      v === "OVERDUE"
        ? "bg-red-100 text-red-800"
        : v === "DUE"
        ? "bg-amber-100 text-amber-800"
        : v === "COMPLETED"
        ? "bg-emerald-100 text-emerald-800"
        : v === "DEFERRED"
        ? "bg-zinc-100 text-zinc-800"
        : "bg-blue-100 text-blue-800";
    return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{v}</span>;
  };

  const canPrev = page > 0;
  const canNext = rows.length === pageSize; // simple heuristic w/out totalCount

  const title = useMemo(() => "Inspection Schedule", []);

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-zinc-500">Fleet →</div>
          <div className="text-2xl font-semibold">{title}</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-2 rounded border px-3 py-2 text-sm hover:bg-zinc-50"
            onClick={fetchRows}
            disabled={loading}
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            className="inline-flex items-center gap-2 rounded bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800"
            onClick={openCreate}
          >
            <Plus className="h-4 w-4" />
            New
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border bg-white p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
          <div className="md:col-span-1">
            <div className="text-xs text-zinc-500">From</div>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="date"
                className="w-full rounded border py-2 pl-8 pr-2 text-sm"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="text-xs text-zinc-500">To</div>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="date"
                className="w-full rounded border py-2 pl-8 pr-2 text-sm"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="text-xs text-zinc-500">Status</div>
            <select
              className="w-full rounded border px-3 py-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All</option>
              {["OPEN", "DUE", "OVERDUE", "COMPLETED", "DEFERRED"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1">
            <div className="text-xs text-zinc-500">Aircraft ID</div>
            <input
              className="w-full rounded border px-3 py-2 text-sm"
              value={aircraftId}
              onChange={(e) => setAircraftId(e.target.value)}
              placeholder="uuid..."
            />
          </div>

          <div className="md:col-span-2">
            <div className="text-xs text-zinc-500">Search (tail / requirement)</div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                className="w-full rounded border py-2 pl-8 pr-2 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="N123.. / 100hr / Annual ..."
              />
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            className="rounded border px-3 py-2 text-sm hover:bg-zinc-50"
            onClick={() => {
              setFrom("");
              setTo("");
              setStatus("");
              setAircraftId("");
              setSearch("");
              setPage(0);
            }}
          >
            Clear
          </button>
          <button
            className="rounded bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800"
            onClick={() => {
              setPage(0);
              fetchRows();
            }}
          >
            Apply
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <div className="flex items-center justify-between border-b p-3">
          <div className="text-sm text-zinc-600">
            Showing <span className="font-medium">{rows.length}</span> row(s)
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs text-zinc-500">Page size</div>
            <select
              className="rounded border px-2 py-1 text-sm"
              value={pageSize}
              onChange={(e) => {
                setPage(0);
                setPageSize(Number(e.target.value));
              }}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>

            <button
              className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-sm hover:bg-zinc-50 ${
                !canPrev ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => canPrev && setPage((p) => Math.max(0, p - 1))}
              disabled={!canPrev}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <button
              className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-sm hover:bg-zinc-50 ${
                !canNext ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => canNext && setPage((p) => p + 1)}
              disabled={!canNext}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-auto">
          <table className="min-w-[1100px] w-full text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-3 py-2 text-left">Tail</th>
                <th className="px-3 py-2 text-left">Requirement</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Next Due</th>
                <th className="px-3 py-2 text-right">Due Hrs</th>
                <th className="px-3 py-2 text-right">Due Cyc</th>
                <th className="px-3 py-2 text-left">Last Completed</th>
                <th className="px-3 py-2 text-right">Last Hrs</th>
                <th className="px-3 py-2 text-right">Last Cyc</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.scheduleId}
                  className="border-t hover:bg-zinc-50 cursor-pointer"
                  onClick={() => openEdit(r)}
                >
                  <td className="px-3 py-2 font-medium">{r.tail || "—"}</td>
                  <td className="px-3 py-2">{r.requirementName || r.requirementId}</td>
                  <td className="px-3 py-2">{dueBadge(r.status)}</td>
                  <td className="px-3 py-2">{r.nextDueDate || "—"}</td>
                  <td className="px-3 py-2 text-right">{r.nextDueHours ?? "—"}</td>
                  <td className="px-3 py-2 text-right">{r.nextDueCycles ?? "—"}</td>
                  <td className="px-3 py-2">{r.lastCompletedDate || "—"}</td>
                  <td className="px-3 py-2 text-right">{r.lastCompletedHours ?? "—"}</td>
                  <td className="px-3 py-2 text-right">{r.lastCompletedCycles ?? "—"}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="px-3 py-10 text-center text-zinc-500" colSpan={9}>
                    {loading ? "Loading..." : "No inspection schedule items found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InspectionScheduleDrawer
        open={drawerOpen}
        row={selected}
        onClose={() => setDrawerOpen(false)}
        onSaved={() => {
          setPage(0);
          fetchRows();
        }}
      />
    </div>
  );
}