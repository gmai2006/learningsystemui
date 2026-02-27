import React, { useEffect, useMemo, useState } from "react";
import apiClient from "../api/ApiClient";
import {
  Plane,
  Gauge,
  RefreshCcw,
  Search,
  Calendar,
  ChevronRight,
  X,
  AlertTriangle,
} from "lucide-react";

/**
 * Aircraft Utilization Page (Fleet → Utilization)
 * - TailwindCSS + lucide-react icons
 * - TypeScript
 * - Uses apiClient wrapper and expects REST wrapper: res.data.content
 *
 * Backend expectation (recommended):
 * GET /fleet/utilization?from=YYYY-MM-DD&to=YYYY-MM-DD&search=...
 * Response: { content: AircraftUtilizationRow[] }
 */

type IntervalPreset = "7" | "30" | "90" | "custom";

export type AircraftUtilizationRow = {
  aircraftId: string;
  tail: string;
  makeModel?: string | null;
  status?: string | null;

  // Totals (all-time) - can be computed server-side
  totalHours?: number | null;
  totalCycles?: number | null;

  // Period metrics (based on filters)
  hoursRange?: number | null;
  cyclesRange?: number | null;

  // Derived metrics
  avgHrsPerDay?: number | null;
  lastFlight?: string | null; // YYYY-MM-DD
};

type AircraftUtilizationEntry = {
  aircraftId: string;
  utilizationId: string;
  flightDate: string; // YYYY-MM-DD
  flightHours: number;
  flightCycles: number;
  hobbsStart?: number | null;
  hobbsEnd?: number | null;
  notes?: string | null;
};

function isoDate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function fmtNum(n: number | null | undefined, digits = 1) {
  if (n === null || n === undefined) return "—";
  const v = Number(n);
  if (Number.isNaN(v)) return "—";
  return v.toFixed(digits);
}

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function AircraftUtilizationPage() {
  const [preset, setPreset] = useState<IntervalPreset>("30");
  const [from, setFrom] = useState<string>(isoDate(daysAgo(30)));
  const [to, setTo] = useState<string>(isoDate(new Date()));
  const [search, setSearch] = useState("");

  const [rows, setRows] = useState<AircraftUtilizationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<AircraftUtilizationRow | null>(null);

  // Detail drawer state
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [entries, setEntries] = useState<AircraftUtilizationEntry[]>([]);

  useEffect(() => {
    // keep dates synced with preset
    if (preset === "7") {
      setFrom(isoDate(daysAgo(7)));
      setTo(isoDate(new Date()));
    } else if (preset === "30") {
      setFrom(isoDate(daysAgo(30)));
      setTo(isoDate(new Date()));
    } else if (preset === "90") {
      setFrom(isoDate(daysAgo(90)));
      setTo(isoDate(new Date()));
    }
  }, [preset]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const hay = `${r.tail} ${r.makeModel ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, search]);

  const summary = useMemo(() => {
    const hoursRange = filteredRows.reduce((acc, r) => acc + (r.hoursRange ?? 0), 0);
    const cyclesRange = filteredRows.reduce((acc, r) => acc + (r.cyclesRange ?? 0), 0);
    const activeCount = filteredRows.filter((r) => (r.hoursRange ?? 0) > 0 || (r.cyclesRange ?? 0) > 0)
      .length;

    // rough avg hours/day across the fleet for the period
    const fromD = new Date(from);
    const toD = new Date(to);
    const days = Math.max(1, Math.round((toD.getTime() - fromD.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const avgHrsPerDayFleet = hoursRange / days;

    return { hoursRange, cyclesRange, activeCount, avgHrsPerDayFleet, days };
  }, [filteredRows, from, to]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      // Adjust endpoint to your backend route
      const res = await apiClient.get("aircraftutilizationtotals/selectAll", {
        params: { from, to, search: search.trim() || undefined },
      });

      // Per your API convention: REST wrapper => res.data.content
      const content: AircraftUtilizationRow[] = res.data?.content ?? [];
      setRows(content);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to load utilization.");
    } finally {
      setLoading(false);
    }
  }

  async function loadDetails(aircraftId: string) {
    setDetailLoading(true);
    setDetailError(null);
    setEntries([]);
    try {
      // Adjust endpoint to your backend route
      const res = await apiClient.get(`/fleet/utilization/${aircraftId}/entries`, {
        params: { from, to },
      });

      const content: AircraftUtilizationEntry[] = res.data ?? [];
      setEntries(content);
    } catch (e: any) {
      setDetailError(e?.response?.data?.error || "Failed to load utilization entries.");
    } finally {
      setDetailLoading(false);
    }
  }

  type EntryMode = "create" | "edit";

  type EntryDraft = {
    aircraftId?: string;
    utilizationId?: string; // only for edit
    flightDate: string;
    flightHours: number;
    flightCycles: number;
    hobbsStart?: number | null;
    hobbsEnd?: number | null;
    notes?: string | null;
  };

  const emptyDraft = (dateDefault: string): EntryDraft => ({
    aircraftId: undefined,
    flightDate: dateDefault,
    flightHours: 0,
    flightCycles: 0,
    hobbsStart: null,
    hobbsEnd: null,
    notes: null,
  });

  const [entryMode, setEntryMode] = useState<EntryMode>("create");
  const [draft, setDraft] = useState<EntryDraft>(() => emptyDraft(to)); // default to "to" date
  const [entrySaving, setEntrySaving] = useState(false);
  const [entryError, setEntryError] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  useEffect(() => {
    if (selected?.aircraftId) loadDetails(selected.aircraftId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.aircraftId]);

  useEffect(() => {
    setDraft((d) => ({ ...d, flightDate: to }));
  }, [to]);

  useEffect(() => {
  if (selected?.aircraftId) setEditorOpen(false);
}, [selected?.aircraftId]);

  function openCreateEntry() {
    setEntryError(null);
    setEntryMode("create");
    setDraft(emptyDraft(to));
    setEditorOpen(true);
  }

  function openEditEntry(e: AircraftUtilizationEntry) {
    setEntryError(null);
    setEntryMode("edit");
    setDraft({
      aircraftId: e.aircraftId,
      utilizationId: e.utilizationId,
      flightDate: e.flightDate,
      flightHours: e.flightHours,
      flightCycles: e.flightCycles,
      hobbsStart: e.hobbsStart ?? null,
      hobbsEnd: e.hobbsEnd ?? null,
      notes: e.notes ?? null,
    });
    setEditorOpen(true);
  }

  function cancelEdit() {
    setEntryError(null);
    setEntryMode("create");
    setDraft(emptyDraft(to));
    setEditorOpen(false);
  }

  async function createEntry(aircraftId: string, body: EntryDraft) {
    return apiClient.put(`/fleet/utilization/`, {
      aircraftId: aircraftId,
      flightDate: body.flightDate,
      flightHours: body.flightHours,
      flightCycles: body.flightCycles,
      hobbsStart: body.hobbsStart,
      hobbsEnd: body.hobbsEnd,
      notes: body.notes,
    });
  }

  async function updateEntry(body: EntryDraft) {
    return apiClient.post(`/fleet/utilization`, {
      utilizationId: body.utilizationId,
      aircraftId: body.aircraftId,
      flightDate: body.flightDate,
      flightHours: body.flightHours,
      flightCycles: body.flightCycles,
      hobbsStart: body.hobbsStart,
      hobbsEnd: body.hobbsEnd,
      notes: body.notes,
    });
  }

  async function saveDraft() {
    if (!selected?.aircraftId) return;

    setEntrySaving(true);
    setEntryError(null);

    try {
      if (!draft.flightDate) {
        setEntryError("Flight date is required.");
        return;
      }
      if (draft.flightHours < 0 || draft.flightCycles < 0) {
        setEntryError("Hours/cycles cannot be negative.");
        return;
      }
      if (
        draft.hobbsStart != null &&
        draft.hobbsEnd != null &&
        draft.hobbsEnd < draft.hobbsStart
      ) {
        setEntryError("Hobbs end must be ≥ hobbs start.");
        return;
      }

      if (entryMode === "create") {
        await createEntry(selected.aircraftId, draft);
      } else {
        if (!draft.utilizationId) {
          setEntryError("Missing utilizationId for update.");
          return;
        }
        await updateEntry(draft);
      }

      // refresh entries + (optional) refresh top table totals
      await loadDetails(selected.aircraftId);
      await load();

      // reset editor back to create
      cancelEdit();
    } catch (e: any) {
      setEntryError(e?.response?.data?.error || "Failed to save entry.");
    } finally {
      setEntrySaving(false);
    }
  }

  function closeDrawer() {
    setSelected(null);
    setEntryError(null);
    setEntryMode("create");
    setDraft(emptyDraft(to));
    setEditorOpen(false);
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-zinc-700" />
            <h1 className="text-lg font-semibold text-zinc-900">Fleet Utilization</h1>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Track flight hours/cycles by aircraft and summarize utilization over a date range.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            <RefreshCcw className={classNames("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <PresetButton active={preset === "7"} onClick={() => setPreset("7")} label="Last 7d" />
            <PresetButton active={preset === "30"} onClick={() => setPreset("30")} label="Last 30d" />
            <PresetButton active={preset === "90"} onClick={() => setPreset("90")} label="Last 90d" />
            <PresetButton active={preset === "custom"} onClick={() => setPreset("custom")} label="Custom" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="grid grid-cols-2 gap-3">
              <LabeledField label="From">
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => {
                      setPreset("custom");
                      setFrom(e.target.value);
                    }}
                    className="w-full rounded-md border border-zinc-200 bg-white py-2 pl-8 pr-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none"
                  />
                </div>
              </LabeledField>

              <LabeledField label="To">
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => {
                      setPreset("custom");
                      setTo(e.target.value);
                    }}
                    className="w-full rounded-md border border-zinc-200 bg-white py-2 pl-8 pr-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none"
                  />
                </div>
              </LabeledField>
            </div>

            <LabeledField label="Search">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tail number, make, model…"
                  className="w-72 rounded-md border border-zinc-200 bg-white py-2 pl-8 pr-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none"
                />
              </div>
            </LabeledField>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          <StatCard
            title={`Hours (${summary.days}d)`}
            value={fmtNum(summary.hoursRange, 1)}
            icon={<Gauge className="h-4 w-4 text-zinc-500" />}
          />
          <StatCard title={`Cycles (${summary.days}d)`} value={fmtNum(summary.cyclesRange, 0)} />
          <StatCard title="Active aircraft" value={String(summary.activeCount)} />
          <StatCard title="Avg hrs/day (fleet)" value={fmtNum(summary.avgHrsPerDayFleet, 2)} />
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <div>
              <div className="font-medium">Could not load utilization</div>
              <div className="text-amber-800">{error}</div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <div className="text-sm font-semibold text-zinc-900">Aircraft</div>
          <div className="text-xs text-zinc-500">
            Showing <span className="font-medium text-zinc-900">{filteredRows.length}</span> aircraft
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-zinc-50">
              <tr className="text-left text-xs font-semibold text-zinc-600">
                <th className="px-4 py-3">Tail</th>
                <th className="px-4 py-3">Make / Model</th>
                <th className="px-4 py-3">Total Hours</th>
                <th className="px-4 py-3">Total Cycles</th>
                <th className="px-4 py-3">Hours (range)</th>
                <th className="px-4 py-3">Cycles (range)</th>
                <th className="px-4 py-3">Avg hrs/day</th>
                <th className="px-4 py-3">Last flight</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-200">
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-sm text-zinc-500" colSpan={9}>
                    Loading…
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-sm text-zinc-500" colSpan={9}>
                    No results.
                  </td>
                </tr>
              ) : (
                filteredRows.map((r) => (
                  <tr key={r.aircraftId} className="hover:bg-zinc-50">
                    <td className="px-4 py-3 text-sm font-medium text-zinc-900">{r.tail}</td>
                    <td className="px-4 py-3 text-sm text-zinc-700">
                      {r.makeModel || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-700">{fmtNum(r.totalHours, 1)}</td>
                    <td className="px-4 py-3 text-sm text-zinc-700">{fmtNum(r.totalCycles, 0)}</td>
                    <td className="px-4 py-3 text-sm text-zinc-700">{fmtNum(r.hoursRange, 1)}</td>
                    <td className="px-4 py-3 text-sm text-zinc-700">{fmtNum(r.cyclesRange, 0)}</td>
                    <td className="px-4 py-3 text-sm text-zinc-700">{fmtNum(r.avgHrsPerDay, 2)}</td>
                    <td className="px-4 py-3 text-sm text-zinc-700">{r.lastFlight ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelected(r)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
                      >
                        Details <ChevronRight className="h-4 w-4 text-zinc-500" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      <Drawer open={!!selected} onClose={closeDrawer} title={selected ? `Utilization: ${selected.tail}` : ""}>
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <InfoTile label="Total Hours" value={fmtNum(selected.totalHours, 1)} />
              <InfoTile label="Total Cycles" value={fmtNum(selected.totalCycles, 0)} />
              <InfoTile label={`Hours (${from} → ${to})`} value={fmtNum(selected.hoursRange, 1)} />
              <InfoTile label={`Cycles (${from} → ${to})`} value={fmtNum(selected.cyclesRange, 0)} />
              <InfoTile label="Avg hrs/day" value={fmtNum(selected.avgHrsPerDay, 2)} />
              <InfoTile label="Last flight date" value={selected.lastFlight ?? "—"} />
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white">
              <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
                <div className="text-sm font-semibold text-zinc-900">Utilization entries</div>

                <div className="flex items-center gap-2">
                  <div className="text-xs text-zinc-500">
                    {detailLoading ? "Loading…" : `${entries.length} rows`}
                  </div>

                  <button
                    onClick={() => setEditorOpen((v) => !v)}
                    className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
                  >
                    {editorOpen ? "Hide editor" : "Show editor"}
                  </button>

                  <button
                    onClick={openCreateEntry}
                    className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
                  >
                    + Add entry
                  </button>
                </div>
              </div>

              {detailError && (
                <div className="m-4 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <AlertTriangle className="mt-0.5 h-4 w-4" />
                  <div>
                    <div className="font-medium">Could not load entries</div>
                    <div className="text-amber-800">{detailError}</div>
                  </div>
                </div>
              )}

              {editorOpen && (
                <div className="p-4 border-b border-zinc-200 bg-zinc-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-zinc-900">
                      {entryMode === "create" ? "New entry" : "Edit entry"}
                    </div>

                    {entryMode === "edit" && (
                      <button
                        onClick={cancelEdit}
                        className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  {entryError && (
                    <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                      <AlertTriangle className="mt-0.5 h-4 w-4" />
                      <div>{entryError}</div>
                    </div>
                  )}

                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-6">
                    <LabeledField label="Date">
                      <input
                        type="date"
                        value={draft.flightDate}
                        onChange={(e) => setDraft((d) => ({ ...d, flightDate: e.target.value }))}
                        className="w-full rounded-md border border-zinc-200 bg-white px-2 py-2 text-sm"
                      />
                    </LabeledField>

                    <LabeledField label="Hours">
                      <input
                        type="number"
                        step="0.1"
                        value={draft.flightHours}
                        onChange={(e) => setDraft((d) => ({ ...d, flightHours: Number(e.target.value) }))}
                        className="w-full rounded-md border border-zinc-200 bg-white px-2 py-2 text-sm"
                      />
                    </LabeledField>

                    <LabeledField label="Cycles">
                      <input
                        type="number"
                        step="1"
                        value={draft.flightCycles}
                        onChange={(e) => setDraft((d) => ({ ...d, flightCycles: Number(e.target.value) }))}
                        className="w-full rounded-md border border-zinc-200 bg-white px-2 py-2 text-sm"
                      />
                    </LabeledField>

                    <LabeledField label="Hobbs start">
                      <input
                        type="number"
                        step="0.1"
                        value={draft.hobbsStart ?? ""}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            hobbsStart: e.target.value === "" ? null : Number(e.target.value),
                          }))
                        }
                        className="w-full rounded-md border border-zinc-200 bg-white px-2 py-2 text-sm"
                      />
                    </LabeledField>

                    <LabeledField label="Hobbs end">
                      <input
                        type="number"
                        step="0.1"
                        value={draft.hobbsEnd ?? ""}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            hobbsEnd: e.target.value === "" ? null : Number(e.target.value),
                          }))
                        }
                        className="w-full rounded-md border border-zinc-200 bg-white px-2 py-2 text-sm"
                      />
                    </LabeledField>

                    <LabeledField label="Notes">
                      <input
                        value={draft.notes ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
                        className="w-full rounded-md border border-zinc-200 bg-white px-2 py-2 text-sm"
                        placeholder="Optional"
                      />
                    </LabeledField>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={saveDraft}
                      disabled={entrySaving || detailLoading}
                      className={classNames(
                        "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                        entrySaving || detailLoading
                          ? "bg-zinc-200 text-zinc-600"
                          : "bg-zinc-900 text-white hover:bg-zinc-800"
                      )}
                    >
                      {entrySaving ? "Saving…" : entryMode === "create" ? "Create" : "Update"}
                    </button>

                    <button
                      onClick={openCreateEntry}
                      disabled={entrySaving}
                      className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-zinc-50">
                    <tr className="text-left text-xs font-semibold text-zinc-600">
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Hours</th>
                      <th className="px-4 py-3">Cycles</th>
                      <th className="px-4 py-3">Hobbs</th>
                      <th className="px-4 py-3">Notes</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {detailLoading ? (
                      <tr>
                        <td className="px-4 py-6 text-sm text-zinc-500" colSpan={6}>
                          Loading…
                        </td>
                      </tr>
                    ) : entries.length === 0 ? (
                      <tr>
                        <td className="px-4 py-6 text-sm text-zinc-500" colSpan={6}>
                          No entries for this range.
                        </td>
                      </tr>
                    ) : (
                      entries.map((e) => (
                        <tr key={e.utilizationId} className="hover:bg-zinc-50">
                          <td className="px-4 py-3 text-sm text-zinc-900">{e.flightDate}</td>
                          <td className="px-4 py-3 text-sm text-zinc-700">{fmtNum(e.flightHours, 1)}</td>
                          <td className="px-4 py-3 text-sm text-zinc-700">{fmtNum(e.flightCycles, 0)}</td>
                          <td className="px-4 py-3 text-sm text-zinc-700">
                            {e.hobbsStart != null && e.hobbsEnd != null
                              ? `${fmtNum(e.hobbsStart, 1)} → ${fmtNum(e.hobbsEnd, 1)}`
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-zinc-700">{e.notes ?? "—"}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => openEditEntry(e)}
                              className="inline-flex items-center rounded-md px-2 py-1 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Extension points */}
            <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-700">
              Next step: add “Upcoming Due Impact” here by calling your inspection requirements endpoint and projecting due dates
              using the selected aircraft’s utilization rate.
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

/* ------------------------- UI primitives ------------------------- */

function PresetButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={classNames(
        "rounded-md border px-3 py-2 text-sm font-medium",
        active
          ? "border-zinc-900 bg-zinc-900 text-white"
          : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50"
      )}
    >
      {label}
    </button>
  );
}

function LabeledField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium text-zinc-600">{label}</div>
      {children}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-zinc-500">{title}</div>
        {icon}
      </div>
      <div className="mt-2 text-xl font-semibold text-zinc-900">{value}</div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3">
      <div className="text-xs font-medium text-zinc-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-zinc-900">{value}</div>
    </div>
  );
}

/**
 * Simple right-side drawer (no external deps)
 */
function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-3xl overflow-y-auto bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <div className="text-sm font-semibold text-zinc-900">{title}</div>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            <X className="h-4 w-4" />
            Close
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}