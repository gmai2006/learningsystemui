// nav.ts
import {
  LayoutDashboard, Plane, Gauge, History,
  CalendarClock, Wrench, AlertTriangle, Clock4, Timer,
  Cpu, Siren, Repeat,
  PackageSearch, Boxes, ClipboardCheck, ArrowLeftRight,
  ClipboardPenLine, NotebookText, User,
  BookOpen, PenTool, Paperclip, ScanSearch,
  BellRing, BellOff,
  BarChart3, BadgeDollarSign, CheckCircle2, PieChart, FileDown,
  Users, Shield, KeyRound, Settings,
} from "lucide-react";

type NavPerm = string | string[] | undefined;

export const sidebarTree = [
  {
    section: "Overview",
    items: [
      // No explicit permission provided for dashboard in your examples (leave open).
      { label: "Dashboard", to: "/", icon: LayoutDashboard, perm: undefined as NavPerm },
    ],
  },
  {
    section: "Fleet",
    items: [
      // No aircraft.* permissions provided in your examples.
      { label: "Aircraft", to: "/fleet/aircraft", icon: Plane, perm: undefined as NavPerm },
      { label: "Utilization (Hours/Cycles)", to: "/fleet/utilization", icon: Gauge, perm: "utilization.read" as NavPerm },
      { label: "Aircraft Timeline", to: "/fleet/timeline", icon: History, perm: undefined as NavPerm },
    ],
  },
  {
    section: "Maintenance",
    items: [
      { label: "Inspection Schedule", to: "/maintenance/inspection-schedule", icon: CalendarClock, perm: "inspection.req.read" as NavPerm },
      { label: "Work Orders", to: "/maintenance/work-orders", icon: Wrench, perm: "workorder.read" as NavPerm },

      // Your sample perms include "inspection.discrepancy.record" but not a read perm.
      // Using the closest available; adjust if you add "inspection.discrepancy.read".
      { label: "Squawks & Discrepancies", to: "/maintenance/squawks", icon: AlertTriangle, perm: "inspection.discrepancy.record" as NavPerm },

      // No deferred.* permissions provided in your examples.
      { label: "Deferred Items", to: "/maintenance/deferred", icon: Clock4, perm: undefined as NavPerm },

      // No labor.* permissions provided in your examples.
      { label: "Labor Time Entry", to: "/maintenance/labor", icon: Timer, perm: undefined as NavPerm },
    ],
  },
  {
    section: "Components",
    items: [
      // No components.* permissions provided in your examples.
      { label: "Components Registry", to: "/components", icon: Cpu, perm: undefined as NavPerm },
      { label: "Life Limits & Overhaul", to: "/components/life-limits", icon: Siren, perm: undefined as NavPerm },
      { label: "Install/Remove History", to: "/components/history", icon: Repeat, perm: undefined as NavPerm },
    ],
  },
  {
    section: "Parts & Inventory",
    items: [
      // No inventory.* permissions provided in your examples.
      { label: "Parts Catalog", to: "/inventory/parts", icon: PackageSearch, perm: undefined as NavPerm },
      { label: "Stock Lines", to: "/inventory/stock", icon: Boxes, perm: undefined as NavPerm },
      { label: "Reservations & Issues", to: "/inventory/reservations", icon: ClipboardCheck, perm: undefined as NavPerm },
      { label: "Transactions", to: "/inventory/transactions", icon: ArrowLeftRight, perm: undefined as NavPerm },
    ],
  },
  {
    section: "Flight Logs",
    items: [
      // No flightlog.* permissions provided in your examples.
      { label: "New Flight Log", to: "/flight-logs/new", icon: ClipboardPenLine, perm: undefined as NavPerm },
      { label: "Flight Logs", to: "/flight-logs", icon: NotebookText, perm: undefined as NavPerm },
      { label: "Pilot Hours", to: "/flight-logs/pilots", icon: User, perm: undefined as NavPerm },
    ],
  },
  {
    section: "Records & Signatures",
    items: [
      // No logbook.* permissions provided in your examples.
      { label: "Logbooks", to: "/records/logbooks", icon: BookOpen, perm: undefined as NavPerm },

      // Closest: "inspection.signoff.ia" exists, but "signatures queue" might be broader.
      { label: "Signatures Queue", to: "/records/signatures", icon: PenTool, perm: "inspection.signoff.ia" as NavPerm },

      // No attachments.* permissions provided.
      { label: "Attachments", to: "/records/attachments", icon: Paperclip, perm: undefined as NavPerm },

      // Audit Trail: you have "inspection.audit.read".
      { label: "Audit Trail", to: "/records/audit", icon: ScanSearch, perm: "inspection.audit.read" as NavPerm },
    ],
  },
  {
    section: "Alerts",
    items: [
      // Your sample perms include inspection.alert.read/ack/escalate.
      { label: "Due Soon", to: "/alerts/due-soon", icon: BellRing, perm: "inspection.alert.read" as NavPerm },
      { label: "Overdue", to: "/alerts/overdue", icon: BellOff, perm: "inspection.alert.read" as NavPerm },
      { label: "Component Alerts", to: "/alerts/components", icon: Siren, perm: "inspection.alert.read" as NavPerm },
    ],
  },
  {
    section: "Reports",
    items: [
      { label: "Maintenance Summary", to: "/reports/maintenance", icon: BarChart3, perm: "inspection.report.read" as NavPerm },

      // No cost/labor report permissions provided.
      { label: "Labor & Cost", to: "/reports/labor", icon: BadgeDollarSign, perm: undefined as NavPerm },

      { label: "Inspection Compliance", to: "/reports/inspections", icon: CheckCircle2, perm: "inspection.report.read" as NavPerm },

      // No parts usage/report permissions provided.
      { label: "Parts Usage", to: "/reports/parts", icon: PieChart, perm: undefined as NavPerm },

      { label: "Export Center", to: "/reports/exports", icon: FileDown, perm: "inspection.report.export" as NavPerm },
    ],
  },
  {
    section: "Administration",
    items: [
      // No admin.* perms provided in your examples; leaving open for now.
      { label: "Users", to: "/admin/users", icon: Users, perm: undefined as NavPerm },
      { label: "Roles", to: "/admin/roles", icon: Shield, perm: undefined as NavPerm },
      { label: "Permissions", to: "/admin/permissions", icon: KeyRound, perm: undefined as NavPerm },
      { label: "System Settings", to: "/admin/settings", icon: Settings, perm: undefined as NavPerm },
    ],
  },
] as const;