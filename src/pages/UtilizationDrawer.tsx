import { useEffect, useMemo, useState } from "react";
import { Drawer } from "../Drawer";
import apiClient from "../api/ApiClient";

export type UtilizationRow = {
  id: string;
  aircraftId?: string | null;

  // ISO date (YYYY-MM-DD) is easiest for <input type="date" />
  utilizationDate?: string | null;

  hours?: number | null;
  cycles?: number | null;

  notes: string;

  createdAt?: string | null;
  updatedAt?: string | null;
};

type UtilizationDraft = {
  aircraftId: string;
  utilizationDate: string; // YYYY-MM-DD
  hours: string; // keep as string for input, parse on save
  cycles: string; // keep as string for input, parse on save
  notes: string;
};

function toDraft(u: UtilizationRow): UtilizationDraft {
  return {
    aircraftId: u.aircraftId ?? "",
    utilizationDate: (u.utilizationDate ?? "").slice(0, 10),
    hours: u.hours == null ? "" : String(u.hours),
    cycles: u.cycles == null ? "" : String(u.cycles),
    notes: u.notes ?? "",
  };
}

function emptyDraft(): UtilizationDraft {
  return {
    aircraftId: "",
    utilizationDate: "",
    hours: "",
    cycles: "",
    notes: "",
  };
}

function extractSingleUtilization(data: any): any | null {
  const content = data?.content ?? data;
  if (!content) return null;
  if (Array.isArray(content)) return content[0] ?? null;
  if (typeof content === "object") return content;
  return null;
}

function toUtilizationRowFromBackend(u: any): UtilizationRow {
  return {
    id: u.utilizationId ?? u.id,
    aircraftId: u.aircraftId ?? null,
    utilizationDate: u.utilizationDate ?? u.date ?? null,
    hours: u.hours ?? null,
    cycles: u.cycles ?? null,
    notes: u.notes ?? "",
    createdAt: u.createdAt ?? null,
    updatedAt: u.updatedAt ?? null,
  };
}

export default function UtilizationDrawer({
  open,
  mode,
  utilization,
  onClose,
  canEdit,
  onSaved,
}: {
  open: boolean;
  mode: "create" | "edit";
  utilization: UtilizationRow | null;
  onClose: () => void;
  canEdit: boolean;
  onSaved: (saved: UtilizationRow) => void;
}) {
  const title = useMemo(() => {
    if (mode === "create") return "New Utilization";
    return utilization ? `Utilization: ${utilization.utilizationDate ?? utilization.id}` : "Utilization";
  }, [mode, utilization]);

  const [draft, setDraft] = useState<UtilizationDraft>(emptyDraft());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setError(null);
    setSaving(false);

    if (mode === "create") setDraft(emptyDraft());
    else if (utilization) setDraft(toDraft(utilization));
  }, [open, mode, utilization]);

  const disabled = saving || (mode === "edit" && !canEdit);

  function validate(): string | null {
    if (!draft.aircraftId.trim()) return "Aircraft ID is required.";
    if (!draft.utilizationDate.trim()) return "Utilization date is required.";

    if (draft.hours.trim() && Number.isNaN(Number(draft.hours))) return "Hours must be a number.";
    if (draft.cycles.trim() && Number.isNaN(Number(draft.cycles))) return "Cycles must be a number.";

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

    const hoursVal =
      draft.hours.trim() === "" ? null : Math.max(0, Number(draft.hours.trim()));
    const cyclesVal =
      draft.cycles.trim() === "" ? null : Math.max(0, Number(draft.cycles.trim()));

    const payload = {
      aircraftId: draft.aircraftId.trim(),
      utilizationDate: draft.utilizationDate.trim(), // YYYY-MM-DD
      hours: hoursVal,
      cycles: cyclesVal,
      notes: draft.notes,
    };

    try {
      let res;

      if (mode === "create") {
        res = await apiClient.put("utilization", payload);
      } else {
        if (!utilization?.id) throw new Error();
        res = await apiClient.post("utilization", {
          utilizationId: utilization.id,
          ...payload,
        });
      }

      const saved = extractSingleUtilization(res.data);
      if (!saved) throw new Error();

      onSaved(toUtilizationRowFromBackend(saved));
      onClose();
    } catch {
      setError(mode === "create" ? "Unable to create utilization." : "Unable to save utilization.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer open={open} title={title} onClose={onClose}>
      <div className="space-y-4">
        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="space-y-1 sm:col-span-2">
            <div className="text-xs text-zinc-500">Aircraft ID *</div>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={draft.aircraftId}
              onChange={(e) => setDraft((p) => ({ ...p, aircraftId: e.target.value }))}
              disabled={disabled}
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs text-zinc-500">Utilization Date *</div>
            <input
              type="date"
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={draft.utilizationDate}
              onChange={(e) => setDraft((p) => ({ ...p, utilizationDate: e.target.value }))}
              disabled={disabled}
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs text-zinc-500">Hours</div>
            <input
              inputMode="decimal"
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={draft.hours}
              onChange={(e) => setDraft((p) => ({ ...p, hours: e.target.value }))}
              disabled={disabled}
              placeholder="e.g. 2.5"
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs text-zinc-500">Cycles</div>
            <input
              inputMode="numeric"
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={draft.cycles}
              onChange={(e) => setDraft((p) => ({ ...p, cycles: e.target.value }))}
              disabled={disabled}
              placeholder="e.g. 3"
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
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-md border px-3 py-2 text-sm hover:bg-zinc-50"
            disabled={saving}
          >
            Cancel
          </button>

          <button
            onClick={save}
            className="flex-1 rounded-md bg-zinc-900 text-white px-3 py-2 text-sm hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled}
          >
            {saving ? "Saving…" : mode === "create" ? "Create Utilization" : "Save Changes"}
          </button>
        </div>
      </div>
    </Drawer>
  );
}