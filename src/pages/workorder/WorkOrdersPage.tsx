import React, { useEffect, useMemo, useState } from "react";
import apiClient from "../../api/ApiClient";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Calendar,
} from "lucide-react";
import WorkOrderDrawer from "./WorkOrderDrawer";
import { VWorkOrderRow } from "./workOrderTypes";

import {formatApiDateTime} from "../../utils/util";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function WorkOrdersPage() {
  const [rows, setRows] = useState<VWorkOrderRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [from, setFrom] = useState<string>(""); // ISO (datetime-local -> ISO on apply)
  const [to, setTo] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [woType, setWoType] = useState<string>("");
  const [aircraftId, setAircraftId] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<VWorkOrderRow | null>(null);

  const fetchRows = async () => {
    setLoading(true);
    try {
      const params: any = { page, pageSize };
      if (from) params.from = from;
      if (to) params.to = to;
      if (status) params.status = status;
      if (woType) params.woType = woType;
      if (aircraftId) params.aircraftId = aircraftId;
      if (search) params.search = search;

      const res = await apiClient.get("/workorders/selectAll", { params });
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

  const openEdit = (r: VWorkOrderRow) => {
    setSelected(r);
    setDrawerOpen(true);
  };

  const statusBadge = (s?: string | null) => {
    const v = (s || "OPEN").toUpperCase();
    const cls =
      v === "COMPLETED"
        ? "bg-emerald-100 text-emerald-800"
        : v === "CANCELLED"
        ? "bg-zinc-100 text-zinc-800"
        : v === "DEFERRED"
        ? "bg-amber-100 text-amber-800"
        : v === "IN_PROGRESS"
        ? "bg-blue-100 text-blue-800"
        : "bg-red-50 text-red-800";
    return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{v}</span>;
  };

  const canPrev = page > 0;
  const canNext = rows.length === pageSize;

  const title = useMemo(() => "Work Orders", []);

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-zinc-500">Maintenance →</div>
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
            <div className="text-xs text-zinc-500">From (opened)</div>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="datetime-local"
                className="w-full rounded border py-2 pl-8 pr-2 text-sm"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="text-xs text-zinc-500">To (opened)</div>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="datetime-local"
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
              {["OPEN", "IN_PROGRESS", "COMPLETED", "DEFERRED", "CANCELLED"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1">
            <div className="text-xs text-zinc-500">WO Type</div>
            <input
              className="w-full rounded border px-3 py-2 text-sm"
              value={woType}
              onChange={(e) => setWoType(e.target.value)}
              placeholder="CORRECTIVE / SCHEDULED..."
            />
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

          <div className="md:col-span-1">
            <div className="text-xs text-zinc-500">Search</div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                className="w-full rounded border py-2 pl-8 pr-2 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="tail / WO# / text..."
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
              setWoType("");
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
                <th className="px-3 py-2 text-left">WO #</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Opened</th>
                <th className="px-3 py-2 text-left">Completed</th>
                <th className="px-3 py-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.workOrderId}
                  className="border-t hover:bg-zinc-50 cursor-pointer"
                  onClick={() => openEdit(r)}
                >
                  <td className="px-3 py-2 font-medium">{r.tail || "—"}</td>
                  <td className="px-3 py-2">{r.woNumber}</td>
                  <td className="px-3 py-2">{r.woType}</td>
                  <td className="px-3 py-2">{statusBadge(r.status)}</td>
                  <td className="px-3 py-2">{formatApiDateTime(r.openedAt)}</td>
                  <td className="px-3 py-2">{formatApiDateTime(r.completedAt)}</td>
                  <td className="px-3 py-2">{r.description || "—"}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="px-3 py-10 text-center text-zinc-500" colSpan={7}>
                    {loading ? "Loading..." : "No work orders found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <WorkOrderDrawer
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