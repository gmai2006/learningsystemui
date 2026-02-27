export type WorkOrderStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DEFERRED";

export type VWorkOrderRow = {
  workOrderId: string;
  aircraftId: string;
  tail?: string | null;

  woNumber: string;
  woType: string;
  status: string;

  openedAt?: string | null;     // ISO string
  completedAt?: string | null;  // ISO string

  description?: string | null;
  complianceReference?: string | null;

  incidentId?: string | null;
  createdBy?: string | null;
  createdByUsername?: string | null;
  createdByDisplayName?: string | null;
};

export type WorkOrderUpsert = {
  workOrderId?: string | null;
  aircraftId: string;

  woNumber: string;
  woType: string;
  status?: string | null;

  openedAt?: string | null;     // ISO
  completedAt?: string | null;  // ISO

  description?: string | null;
  complianceReference?: string | null;

  incidentId?: string | null;
  createdBy?: string | null;
};