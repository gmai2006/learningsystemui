import React, { useEffect, useMemo, useState } from "react";
import { X, Save } from "lucide-react";
import apiClient from "../../api/ApiClient";
import { InspectionScheduleUpsert, VInspectionScheduleRow } from "./inspectionTypes";

type Props = {
    open: boolean;
    row?: VInspectionScheduleRow | null;
    onClose: () => void;
    onSaved: () => void;
};

// add helpers near top of file
const toDateInputValue = (v: any): string => {
    if (!v) return "";
    if (typeof v === "string") return v.slice(0, 10);

    // Jackson LocalDate default can be [YYYY, M, D]
    if (Array.isArray(v) && v.length >= 3) {
        const [y, m, d] = v;
        const mm = String(m).padStart(2, "0");
        const dd = String(d).padStart(2, "0");
        return `${y}-${mm}-${dd}`;
    }

    return "";
};

// Choose ONE of these based on what your backend accepts.
// Option A (safe with your current output): send arrays back
const fromDateInputToApi = (s: string): number[] | null => {
    if (!s) return null;
    const [y, m, d] = s.split("-").map((n) => Number(n));
    if (!y || !m || !d) return null;
    return [y, m, d];
};

// Option B: send ISO strings back (only if backend accepts it)
// const fromDateInputToApi = (s: string): string | null => (s ? s : null);

export default function InspectionScheduleDrawer({ open, row, onClose, onSaved }: Props) {
    const isEdit = !!row?.scheduleId;

    const [form, setForm] = useState<InspectionScheduleUpsert>({
        aircraftId: row?.aircraftId || "",
        requirementId: row?.requirementId || "",
        lastCompletedDate: row?.lastCompletedDate || null,
        lastCompletedHours: row?.lastCompletedHours ?? null,
        lastCompletedCycles: row?.lastCompletedCycles ?? null,
        nextDueDate: row?.nextDueDate || null,
        nextDueHours: row?.nextDueHours ?? null,
        nextDueCycles: row?.nextDueCycles ?? null,
        status: row?.status || "OPEN",
        notes: row?.notes || "",
        scheduleId: row?.scheduleId || null,
    });

    useEffect(() => {
        if (!open) return;
        setForm({
            aircraftId: row?.aircraftId || "",
            requirementId: row?.requirementId || "",
            lastCompletedDate: toDateInputValue((row as any)?.lastCompletedDate) || null,
            lastCompletedHours: row?.lastCompletedHours ?? null,
            lastCompletedCycles: row?.lastCompletedCycles ?? null,
            nextDueDate: toDateInputValue((row as any)?.nextDueDate) || null,
            nextDueHours: row?.nextDueHours ?? null,
            nextDueCycles: row?.nextDueCycles ?? null,
            status: row?.status || "OPEN",
            notes: row?.notes || "",
            scheduleId: row?.scheduleId || null,
        });
    }, [open, row?.scheduleId]);

    const canSave = useMemo(() => {
        return form.aircraftId.trim().length > 0 && form.requirementId.trim().length > 0;
    }, [form.aircraftId, form.requirementId]);

    const set = (k: keyof InspectionScheduleUpsert, v: any) => setForm((p) => ({ ...p, [k]: v }));

    const save = async () => {
        if (!canSave) return;

        const payload = {
            scheduleId: form.scheduleId || undefined,
            aircraftId: form.aircraftId,
            requirementId: form.requirementId,

            lastCompletedDate: fromDateInputToApi(form.lastCompletedDate || ""),
            lastCompletedHours: form.lastCompletedHours ?? null,
            lastCompletedCycles: form.lastCompletedCycles ?? null,

            nextDueDate: fromDateInputToApi(form.nextDueDate || ""),
            nextDueHours: form.nextDueHours ?? null,
            nextDueCycles: form.nextDueCycles ?? null,

            status: form.status || "OPEN",
            notes: form.notes || null,
        };
        if (isEdit) {
            await apiClient.post("/inspectionschedule", payload);
        } else {
            await apiClient.put("/inspectionschedule", payload);
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
                        <div className="text-sm text-zinc-500">Inspection Schedule</div>
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
                            <div className="text-xs text-zinc-500">Requirement ID</div>
                            <input
                                className="w-full rounded border px-3 py-2 text-sm"
                                value={form.requirementId}
                                onChange={(e) => set("requirementId", e.target.value)}
                                placeholder="uuid..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <div className="text-xs text-zinc-500">Last Completed Date</div>
                            <input
                                type="date"
                                className="w-full rounded border px-3 py-2 text-sm"
                                value={form.lastCompletedDate || ""}   // already ISO
                                onChange={(e) => set("lastCompletedDate", e.target.value || null)}
                            />
                        </div>
                        <div>
                            <div className="text-xs text-zinc-500">Last Hours</div>
                            <input
                                type="number"
                                step="0.1"
                                className="w-full rounded border px-3 py-2 text-sm"
                                value={form.lastCompletedHours ?? ""}
                                onChange={(e) => set("lastCompletedHours", e.target.value === "" ? null : Number(e.target.value))}
                            />
                        </div>
                        <div>
                            <div className="text-xs text-zinc-500">Last Cycles</div>
                            <input
                                type="number"
                                className="w-full rounded border px-3 py-2 text-sm"
                                value={form.lastCompletedCycles ?? ""}
                                onChange={(e) => set("lastCompletedCycles", e.target.value === "" ? null : Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <div className="text-xs text-zinc-500">Next Due Date</div>
                            <input
                                type="date"
                                className="w-full rounded border px-3 py-2 text-sm"
                                value={form.nextDueDate || ""}         // already ISO
                                onChange={(e) => set("nextDueDate", e.target.value || null)}
                            />
                        </div>
                        <div>
                            <div className="text-xs text-zinc-500">Next Due Hours</div>
                            <input
                                type="number"
                                step="0.1"
                                className="w-full rounded border px-3 py-2 text-sm"
                                value={form.nextDueHours ?? ""}
                                onChange={(e) => set("nextDueHours", e.target.value === "" ? null : Number(e.target.value))}
                            />
                        </div>
                        <div>
                            <div className="text-xs text-zinc-500">Next Due Cycles</div>
                            <input
                                type="number"
                                className="w-full rounded border px-3 py-2 text-sm"
                                value={form.nextDueCycles ?? ""}
                                onChange={(e) => set("nextDueCycles", e.target.value === "" ? null : Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <div className="text-xs text-zinc-500">Status</div>
                            <select
                                className="w-full rounded border px-3 py-2 text-sm"
                                value={form.status || "OPEN"}
                                onChange={(e) => set("status", e.target.value)}
                            >
                                {["OPEN", "DUE", "OVERDUE", "COMPLETED", "DEFERRED"].map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <div className="text-xs text-zinc-500">Notes</div>
                            <input
                                className="w-full rounded border px-3 py-2 text-sm"
                                value={form.notes || ""}
                                onChange={(e) => set("notes", e.target.value)}
                                placeholder="optional"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t p-4">
                    <button className="rounded border px-3 py-2 text-sm hover:bg-zinc-50" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className={`inline-flex items-center gap-2 rounded px-3 py-2 text-sm text-white ${canSave ? "bg-zinc-900 hover:bg-zinc-800" : "bg-zinc-400 cursor-not-allowed"
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