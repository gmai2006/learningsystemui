import React, { useEffect, useMemo, useState } from "react";
import { X, Save } from "lucide-react";
import apiClient from "../../api/ApiClient";
import { WorkOrderUpsert, VWorkOrderRow } from "./workOrderTypes";
import {formatApiDateTime} from "../../utils/util";
type Props = {
  open: boolean;
  row?: VWorkOrderRow | null;
  onClose: () => void;
  onSaved: () => void;
};

// const formatApiDateTime = (iso?: string | null): string => {
//   if (!iso) return "";
//   // expects ISO like 2026-02-26T21:47:51Z or with offset
//   // datetime-local wants YYYY-MM-DDTHH:mm
//   const s = iso.replace("Z", "");
//   return s.slice(0, 16);
// };

const fromDateTimeLocalToIso = (s: string): string | null => {
  if (!s) return null;
  // keep it simple: treat local input as “local” and send as ISO without Z
  // if your backend requires offset, change to: new Date(s).toISOString()
  return s;
};

export default function WorkOrderDrawer({ open, row, onClose, onSaved }: Props) {
  const isEdit = !!row?.workOrderId;

  const [form, setForm] = useState<WorkOrderUpsert>({
    workOrderId: row?.workOrderId || null,
    aircraftId: row?.aircraftId || "",
    woNumber: row?.woNumber || "",
    woType: row?.woType || "",
    status: row?.status || "OPEN",
    openedAt: row?.openedAt || null,
    completedAt: row?.completedAt || null,
    description: row?.description || "",
    complianceReference: row?.complianceReference || "",
    incidentId: row?.incidentId || "",
    createdBy: row?.createdBy || "",
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      workOrderId: row?.workOrderId || null,
      aircraftId: row?.aircraftId || "",
      woNumber: row?.woNumber || "",
      woType: row?.woType || "",
      status: row?.status || "OPEN",
      openedAt: formatApiDateTime(row?.openedAt) || null,
      completedAt: formatApiDateTime(row?.completedAt) || null,
      description: row?.description || "",
      complianceReference: row?.complianceReference || "",
      incidentId: row?.incidentId || "",
      createdBy: row?.createdBy || "",
    });
  }, [open, row?.workOrderId]);

  const set = (k: keyof WorkOrderUpsert, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const canSave = useMemo(() => {
    return (
      form.aircraftId.trim().length > 0 &&
      form.woNumber.trim().length > 0 &&
      form.woType.trim().length > 0
    );
  }, [form.aircraftId, form.woNumber, form.woType]);

  const save = async () => {
    if (!canSave) return;

    const payload = {
      workOrderId: form.workOrderId || undefined,
      aircraftId: form.aircraftId,
      woNumber: form.woNumber,
      woType: form.woType,
      status: form.status || "OPEN",
      openedAt: formatApiDateTime(form.openedAt || ""),
      completedAt: formatApiDateTime(form.completedAt || ""),
      description: form.description || null,
      complianceReference: form.complianceReference || null,
      incidentId: form.incidentId ? form.incidentId : null,
      createdBy: form.createdBy ? form.createdBy : null,
    };

    if (isEdit) {
      await apiClient.post("/workorders", payload);
    } else {
      await apiClient.put("/workorders", payload);
    }

    onSaved();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <div className="text-sm text-zinc-500">Work Order</div>
            <div className="text-lg font-semibold">{isEdit ? "Edit" : "Create"}</div>
          </div>
          <button className="rounded p-2 hover:bg-zinc-100" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-zinc-500">Aircraft ID</div>
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                value={form.aircraftId}
                onChange={(e) => set("aircraftId", e.target.value)}
                placeholder="uuid..."
              />
            </div>
            <div>
              <div className="text-xs text-zinc-500">WO Number</div>
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                value={form.woNumber}
                onChange={(e) => set("woNumber", e.target.value)}
                placeholder="WO-2026-00123"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-zinc-500">WO Type</div>
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                value={form.woType}
                onChange={(e) => set("woType", e.target.value)}
                placeholder="CORRECTIVE / SCHEDULED / INSPECTION..."
              />
            </div>
            <div>
              <div className="text-xs text-zinc-500">Status</div>
              <select
                className="w-full rounded border px-3 py-2 text-sm"
                value={form.status || "OPEN"}
                onChange={(e) => set("status", e.target.value)}
              >
                {["OPEN", "IN_PROGRESS", "COMPLETED", "DEFERRED", "CANCELLED"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-zinc-500">Opened At</div>
              <input
                type="datetime-local"
                className="w-full rounded border px-3 py-2 text-sm"
                value={form.openedAt || ""}
                onChange={(e) => set("openedAt", e.target.value || null)}
              />
            </div>
            <div>
              <div className="text-xs text-zinc-500">Completed At</div>
              <input
                type="datetime-local"
                className="w-full rounded border px-3 py-2 text-sm"
                value={form.completedAt || ""}
                onChange={(e) => set("completedAt", e.target.value || null)}
              />
            </div>
          </div>

          <div>
            <div className="text-xs text-zinc-500">Description</div>
            <textarea
              className="w-full rounded border px-3 py-2 text-sm"
              rows={3}
              value={form.description || ""}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Work performed / discrepancy / corrective action..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-zinc-500">Compliance Reference</div>
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                value={form.complianceReference || ""}
                onChange={(e) => set("complianceReference", e.target.value)}
                placeholder="AD / SB / MEL / Part 43..."
              />
            </div>
            <div>
              <div className="text-xs text-zinc-500">Incident ID (optional)</div>
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                value={form.incidentId || ""}
                onChange={(e) => set("incidentId", e.target.value)}
                placeholder="uuid..."
              />
            </div>
          </div>

          <div>
            <div className="text-xs text-zinc-500">Created By (optional)</div>
            <input
              className="w-full rounded border px-3 py-2 text-sm"
              value={form.createdBy || ""}
              onChange={(e) => set("createdBy", e.target.value)}
              placeholder="user uuid..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t p-4">
          <button className="rounded border px-3 py-2 text-sm hover:bg-zinc-50" onClick={onClose}>
            Cancel
          </button>
          <button
            className={`inline-flex items-center gap-2 rounded px-3 py-2 text-sm text-white ${
              canSave ? "bg-zinc-900 hover:bg-zinc-800" : "bg-zinc-400 cursor-not-allowed"
            }`}
            onClick={save}
            disabled={!canSave}
          >
            <Save className="h-4 w-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}