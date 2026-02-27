export type InspectionScheduleStatus = "OPEN" | "DUE" | "OVERDUE" | "COMPLETED" | "DEFERRED";

export type VInspectionScheduleRow = {
  scheduleId: string;
  aircraftId: string;
  tail?: string | null;

  requirementId: string;
  requirementName?: string | null;

  lastCompletedDate?: string | null; // YYYY-MM-DD
  lastCompletedHours?: number | null;
  lastCompletedCycles?: number | null;

  nextDueDate?: string | null; // YYYY-MM-DD
  nextDueHours?: number | null;
  nextDueCycles?: number | null;

  status?: string | null;
  notes?: string | null;

  createdAt?: string | null;
  updatedAt?: string | null;
};

export type InspectionScheduleUpsert = {
  scheduleId?: string | null;
  aircraftId: string;
  requirementId: string;

  lastCompletedDate?: string | null;
  lastCompletedHours?: number | null;
  lastCompletedCycles?: number | null;

  nextDueDate?: string | null;
  nextDueHours?: number | null;
  nextDueCycles?: number | null;

  status?: string | null;
  notes?: string | null;
};