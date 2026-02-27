import { useEffect, useMemo, useState } from "react";
import { Drawer } from "../Drawer";
import apiClient from "../api/ApiClient";

export type AircraftStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "CLOSED"
  | "ACTIVE"
  | "INACTIVE"
  | "OPEN";

export type AircraftRow = {
  id: string;
  tailNumber?: string | null;
  make?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  status: AircraftStatus;
  notes: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type AircraftDraft = {
  tailNumber: string;
  make: string;
  model: string;
  serialNumber: string;
  status: AircraftStatus;
  notes: string;
};

const AIRCRAFT_STATUS_OPTIONS: { value: AircraftStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "CLOSED", label: "Closed" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

function isAircraftStatus(v: any): v is AircraftStatus {
  return (
    v === "PENDING" ||
    v === "IN_PROGRESS" ||
    v === "CLOSED" ||
    v === "ACTIVE" ||
    v === "INACTIVE" ||
    v === "OPEN"
  );
}

function toDraft(a: AircraftRow): AircraftDraft {
  return {
    tailNumber: a.tailNumber ?? "",
    make: a.make ?? "",
    model: a.model ?? "",
    serialNumber: a.serialNumber ?? "",
    status: a.status ?? "ACTIVE",
    notes: a.notes,
  };
}

function emptyDraft(): AircraftDraft {
  return {
    tailNumber: "",
    make: "",
    model: "",
    serialNumber: "",
    status: "ACTIVE",
    notes: "",
  };
}

function extractSingleAircraft(data: any): any | null {
  const content = data?.content ?? data;
  if (!content) return null;
  if (Array.isArray(content)) return content[0] ?? null;
  if (typeof content === "object") return content;
  return null;
}

function toAircraftRowFromBackend(a: any): AircraftRow {
  const rawStatus = a?.status ?? "ACTIVE";
  const normalized: AircraftStatus = isAircraftStatus(rawStatus) ? rawStatus : "ACTIVE";

  return {
    id: a.aircraftId ?? a.id,
    tailNumber: a.tailNumber ?? null,
    make: a.make ?? null,
    model: a.model ?? null,
    serialNumber: a.serialNumber ?? null,
    status: normalized,
    notes: a.notes,
    createdAt: a.createdAt ?? null,
    updatedAt: a.updatedAt ?? null,
  };
}

/** Timeline types (UI expects REST wrapper: res.data.content) */
export type AircraftTimelineEvent = {
  eventId: string;
  aircraftId: string;
  eventType: "UTILIZATION" | "WORK_ORDER" | "INSPECTION" | "COMPONENT" | "STATUS" | string;
  title: string;
  description?: string | null;
  eventDate: string; // ISO date-time
  reference?: string | null;
  severity?: "INFO" | "WARNING" | "CRITICAL" | string | null;
};

type TabKey = "details" | "timeline";

export default function AircraftDrawer({
  open,
  mode, // "create" | "edit"
  aircraft,
  onClose,
  canEdit,
  onSaved,
}: {
  open: boolean;
  mode: "create" | "edit";
  aircraft: AircraftRow | null;
  onClose: () => void;
  canEdit: boolean;
  onSaved: (saved: AircraftRow) => void;
}) {
  const title = useMemo(() => {
    if (mode === "create") return "New Aircraft";
    return aircraft ? `Aircraft: ${aircraft.tailNumber || aircraft.id}` : "Aircraft";
  }, [mode, aircraft]);

  const [draft, setDraft] = useState<AircraftDraft>(emptyDraft());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Tabs
  const [tab, setTab] = useState<TabKey>("details");

  // ✅ Timeline state
  const [timeline, setTimeline] = useState<AircraftTimelineEvent[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineError, setTimelineError] = useState<string | null>(null);
  const [timelinePage, setTimelinePage] = useState(0);
  const [timelineHasMore, setTimelineHasMore] = useState(true);

  useEffect(() => {
    if (!open) return;

    setError(null);
    setSaving(false);

    // reset tab when opening
    setTab("details");

    if (mode === "create") setDraft(emptyDraft());
    else if (aircraft) setDraft(toDraft(aircraft));

    // reset timeline when opening (or when switching aircraft)
    setTimeline([]);
    setTimelineError(null);
    setTimelineLoading(false);
    setTimelinePage(0);
    setTimelineHasMore(true);
  }, [open, mode, aircraft?.id]);

  const disabled = saving || (mode === "edit" && !canEdit);

  function validate(): string | null {
    if (!draft.tailNumber.trim()) return "Tail Number is required.";
    return null;
  }

  async function save() {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      tailNumber: draft.tailNumber.trim(),
      make: draft.make.trim() || null,
      model: draft.model.trim() || null,
      serialNumber: draft.serialNumber.trim() || null,
      status: draft.status,
      notes: draft.notes,
    };

    try {
      let res;

      if (mode === "create") {
        res = await apiClient.put("aircraft", payload);
      } else {
        if (!aircraft?.id) throw new Error();
        res = await apiClient.post("aircraft", {
          aircraftId: aircraft.id,
          ...payload,
        });
      }

      const saved = extractSingleAircraft(res.data);
      if (!saved) throw new Error();

      onSaved(toAircraftRowFromBackend(saved));
      onClose();
    } catch {
      setError(mode === "create" ? "Unable to create aircraft." : "Unable to save aircraft.");
    } finally {
      setSaving(false);
    }
  }

  // ✅ Fetch timeline (paged). Expects response: { content: AircraftTimelineEvent[] }
  async function fetchTimeline(nextPage: number, replace = false) {
    if (!aircraft?.id) return;

    setTimelineLoading(true);
    setTimelineError(null);

    try {
      // Endpoint name based on earlier backend proposal:
      // GET /aircrafttimeline/select?aircraftId=...&page=...&pageSize=...
      const pageSize = 20;
      const res = await apiClient.get(
        `aircrafttimeline/select?aircraftId=${aircraft.id}&page=${nextPage}&pageSize=${pageSize}`
      );

      const rows: AircraftTimelineEvent[] = res.data?.content ?? [];
      setTimeline((prev) => (replace ? rows : [...prev, ...rows]));
      setTimelinePage(nextPage);
      setTimelineHasMore(rows.length === pageSize);
    } catch {
      setTimelineError("Unable to load timeline.");
    } finally {
      setTimelineLoading(false);
    }
  }

  // ✅ When user clicks Timeline tab for the first time, load page 0
  useEffect(() => {
    if (!open) return;
    if (tab !== "timeline") return;
    if (mode === "create") return; // no timeline for unsaved aircraft
    if (!aircraft?.id) return;
    if (timeline.length > 0 || timelineLoading || timelineError) return;

    fetchTimeline(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, open, aircraft?.id, mode]);

  function severityBadge(sev?: string | null) {
    if (!sev) return null;
    const base = "text-xs rounded-full px-2 py-0.5 border";
    if (sev === "CRITICAL") return <span className={`${base} border-red-200 bg-red-50 text-red-700`}>CRITICAL</span>;
    if (sev === "WARNING") return <span className={`${base} border-amber-200 bg-amber-50 text-amber-800`}>WARNING</span>;
    return <span className={`${base} border-zinc-200 bg-zinc-50 text-zinc-700`}>INFO</span>;
  }

  function typePill(type: string) {
    return (
      <span className="text-[11px] rounded-full px-2 py-0.5 border border-zinc-200 bg-white text-zinc-700">
        {type}
      </span>
    );
  }

  return (
    <Drawer open={open} title={title} onClose={onClose}>
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-2 border-b pb-2">
          <button
            className={`px-3 py-1.5 text-sm rounded-md ${
              tab === "details" ? "bg-zinc-900 text-white" : "hover:bg-zinc-50 border"
            }`}
            onClick={() => setTab("details")}
            type="button"
          >
            Details
          </button>

          <button
            className={`px-3 py-1.5 text-sm rounded-md ${
              tab === "timeline" ? "bg-zinc-900 text-white" : "hover:bg-zinc-50 border"
            }`}
            onClick={() => setTab("timeline")}
            type="button"
            disabled={mode === "create" || !aircraft?.id}
            title={mode === "create" ? "Save aircraft to view timeline" : ""}
          >
            Timeline
          </button>
        </div>

        {tab === "details" ? (
          <>
            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="space-y-1 sm:col-span-2">
                <div className="text-xs text-zinc-500">Tail Number *</div>
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={draft.tailNumber}
                  onChange={(e) => setDraft((p) => ({ ...p, tailNumber: e.target.value }))}
                  disabled={disabled}
                />
              </label>

              <label className="space-y-1">
                <div className="text-xs text-zinc-500">Make</div>
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={draft.make}
                  onChange={(e) => setDraft((p) => ({ ...p, make: e.target.value }))}
                  disabled={disabled}
                />
              </label>

              <label className="space-y-1">
                <div className="text-xs text-zinc-500">Model</div>
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={draft.model}
                  onChange={(e) => setDraft((p) => ({ ...p, model: e.target.value }))}
                  disabled={disabled}
                />
              </label>

              <label className="space-y-1 sm:col-span-2">
                <div className="text-xs text-zinc-500">Serial Number</div>
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={draft.serialNumber}
                  onChange={(e) => setDraft((p) => ({ ...p, serialNumber: e.target.value }))}
                  disabled={disabled}
                />
              </label>

              <label className="space-y-1 sm:col-span-2">
                <div className="text-xs text-zinc-500">Notes</div>
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={draft.notes}
                  onChange={(e) => setDraft((p) => ({ ...p, notes: e.target.value }))}
                  disabled={disabled}
                />
              </label>

              <label className="space-y-1 sm:col-span-2">
                <div className="text-xs text-zinc-500">Status</div>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={draft.status}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, status: e.target.value as AircraftStatus }))
                  }
                  disabled={disabled}
                >
                  {AIRCRAFT_STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 rounded-md border px-3 py-2 text-sm hover:bg-zinc-50"
                disabled={saving}
                type="button"
              >
                Cancel
              </button>

              <button
                onClick={save}
                className="flex-1 rounded-md bg-zinc-900 text-white px-3 py-2 text-sm hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={disabled}
                type="button"
              >
                {saving ? "Saving…" : mode === "create" ? "Create Aircraft" : "Save Changes"}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Timeline tab */}
            {mode === "create" ? (
              <div className="text-sm text-zinc-600">
                Save the aircraft to view timeline events.
              </div>
            ) : (
              <div className="space-y-3">
                {timelineError ? (
                  <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {timelineError}
                  </div>
                ) : null}

                {timeline.length === 0 && !timelineLoading && !timelineError ? (
                  <div className="text-sm text-zinc-600">No timeline events found.</div>
                ) : null}

                <div className="space-y-2">
                  {timeline.map((e) => (
                    <div key={e.eventId} className="rounded-md border p-3 bg-white">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {typePill(e.eventType)}
                            {severityBadge(e.severity ?? null)}
                          </div>
                          <div className="font-medium text-sm">{e.title}</div>
                          {e.description ? (
                            <div className="text-sm text-zinc-600">{e.description}</div>
                          ) : null}
                          {e.reference ? (
                            <div className="text-xs text-blue-700">Ref: {e.reference}</div>
                          ) : null}
                        </div>

                        <div className="text-xs text-zinc-500 whitespace-nowrap">
                          {e.eventDate ? new Date(e.eventDate).toLocaleString() : "—"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    className="rounded-md border px-3 py-2 text-sm hover:bg-zinc-50 disabled:opacity-50"
                    onClick={() => fetchTimeline(0, true)}
                    disabled={timelineLoading}
                  >
                    Refresh
                  </button>

                  <button
                    type="button"
                    className="rounded-md bg-zinc-900 text-white px-3 py-2 text-sm hover:bg-zinc-800 disabled:opacity-50"
                    onClick={() => fetchTimeline(timelinePage + 1)}
                    disabled={!timelineHasMore || timelineLoading}
                    title={!timelineHasMore ? "No more events" : ""}
                  >
                    {timelineLoading ? "Loading…" : "Load more"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Drawer>
  );
}