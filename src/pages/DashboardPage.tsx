// src/pages/DashboardPage.tsx
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock4,
  Cpu,
  Plane,
  Siren,
  Wrench,
} from "lucide-react";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
};

export function DashboardPage() {
  // Replace these with API calls later.
  const stats: StatCardProps[] = [
    { label: "Aircraft", value: "24", hint: "Active fleet", icon: Plane },
    { label: "Due in 14 days", value: "7", hint: "Inspections / calendar", icon: CalendarClock },
    { label: "Due in 25 FH", value: "5", hint: "Inspections / hours", icon: Clock4 },
    { label: "Due in 50 cycles", value: "3", hint: "Inspections / cycles", icon: CheckCircle2 },
  ];

  const queues = [
    { label: "Open Work Orders", value: "12", icon: Wrench },
    { label: "Open Squawks", value: "9", icon: AlertTriangle },
    { label: "Component Alerts", value: "4", icon: Siren },
    { label: "Components Tracked", value: "318", icon: Cpu },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="text-sm text-zinc-500">Overview</div>
        <div className="text-2xl font-semibold">Dashboard</div>
      </div>

      {/* Stat cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </section>

      {/* Queues */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Operational Queues">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {queues.map((q) => (
              <MiniCard key={q.label} label={q.label} value={q.value} icon={q.icon} />
            ))}
          </div>
        </Panel>

        <Panel title="Due Soon (Top 5)">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-zinc-600">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Aircraft</th>
                  <th className="text-left font-medium px-4 py-3">Item</th>
                  <th className="text-left font-medium px-4 py-3">Due</th>
                  <th className="text-left font-medium px-4 py-3">Basis</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { ac: "N123AB", item: "100-hr Inspection", due: "2026-03-03", basis: "Hours" },
                  { ac: "N981CD", item: "ELT Battery", due: "2026-03-05", basis: "Calendar" },
                  { ac: "N552EF", item: "Landing Gear Insp", due: "25 FH", basis: "Hours" },
                  { ac: "N772GH", item: "Prop Overhaul", due: "18 cycles", basis: "Cycles" },
                  { ac: "N101JK", item: "Annual Inspection", due: "2026-03-10", basis: "Calendar" },
                ].map((r, i) => (
                  <tr key={i} className="border-t hover:bg-zinc-50">
                    <td className="px-4 py-3 font-medium">{r.ac}</td>
                    <td className="px-4 py-3">{r.item}</td>
                    <td className="px-4 py-3">{r.due}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">
                        {r.basis}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t px-4 py-3 text-xs text-zinc-500">
            Replace with real “inspection schedule / component alerts” feed.
          </div>
        </Panel>
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="Quick Actions">
          <div className="space-y-2">
            <ActionButton label="Create Work Order" />
            <ActionButton label="Log Flight" />
            <ActionButton label="Add Squawk" />
            <ActionButton label="Review Signatures Queue" />
          </div>
        </Panel>

        <Panel title="Recent Activity">
          <ul className="divide-y text-sm">
            {[
              "WO-1042 completed for N123AB (signed).",
              "Squawk added: N981CD – Oil pressure fluctuation.",
              "Flight log synced from mobile for N552EF.",
              "Component alert acknowledged: ELT battery due.",
            ].map((x, i) => (
              <li key={i} className="py-3 px-1 text-zinc-700">
                {x}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Health">
          <div className="space-y-3 text-sm text-zinc-700">
            <div className="flex items-center justify-between">
              <span>Sync backlog</span>
              <span className="font-medium">0 pending</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Unsigned records</span>
              <span className="font-medium">2</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Overdue items</span>
              <span className="font-medium">1</span>
            </div>
            <p className="text-xs text-zinc-500">
              Swap these metrics to match your backend endpoints.
            </p>
          </div>
        </Panel>
      </section>
    </div>
  );
}

function StatCard({ label, value, hint, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-zinc-500">{label}</div>
          <div className="mt-1 text-2xl font-semibold">{value}</div>
          {hint ? <div className="mt-1 text-xs text-zinc-500">{hint}</div> : null}
        </div>
        <div className="rounded-md border bg-zinc-50 p-2">
          <Icon className="h-5 w-5 text-zinc-700" />
        </div>
      </div>
    </div>
  );
}

function MiniCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-zinc-500">{label}</div>
          <div className="mt-1 text-xl font-semibold">{value}</div>
        </div>
        <Icon className="h-5 w-5 text-zinc-600" />
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-white">
      <div className="border-b px-4 py-3">
        <div className="font-semibold">{title}</div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function ActionButton({ label }: { label: string }) {
  return (
    <button className="w-full rounded-md border px-3 py-2 text-sm text-left hover:bg-zinc-50">
      {label}
    </button>
  );
}