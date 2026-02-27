// src/App.tsx
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./layout/AppShell";
import { sidebarTree } from "./nav";
import { DashboardPage } from "./pages/DashboardPage";
import './App.css';
import { useUser } from "./context/UserContext";
import { UsersPage } from "./pages/UsersPage";
import { AircraftPage } from "./pages/AircraftPage";
import AircraftUtilizationPage from "./pages/AircraftUtilizationPage";
import InspectionSchedulePage from "./pages/inspection/InspectionSchedulePage";
import WorkOrdersPage from "./pages/workorder/WorkOrdersPage";
/**
 * NOTE:
 * - This App.tsx assumes you already have:
 *   - src/nav.ts exporting sidebarTree (from prior message)
 *   - src/layout/AppShell.tsx exporting AppShell (from prior message)
 * - AppShell (as provided) expects a *flat* `nav` array, so we flatten sidebarTree here.
 * - If you want to render section headers in the sidebar, we can adjust AppShell accordingly.
 */

// TEMP: actor permission list. Replace with your auth context / API call.
const actorPerms: string[] = ["*"];

// type FlatNavItem = {
//   to: string;
//   label: string;
//   icon: React.ComponentType<{ className?: string }>;
//   canView: boolean;
// };

type User = {
  userId: string;
  displayName: string;
  email: string;
  permissions: []
};


function hasPerm(actorPerms: [], perm?: string) {
  return !perm || actorPerms.includes(perm);
}

const filterSectionByUserPermissions = (actorPerms: [])  => {
  const fileteredSections = sidebarTree.map(section => {
    const items = filterItemByUserPermissions(actorPerms, section.items);
    console.log(section.section + ' ' + items);
    return {...section, items: items}
  });

  return fileteredSections.filter(section => section.items.length > 0);
}

const filterItemByUserPermissions = (actorPerms: [], items: [])  => {
  return items.filter(item => hasPerm(actorPerms, item.perm));
}

export default function App() {
  const { appUser } = useUser();
  const actorPerms = appUser.permissions.map(perm => perm.code);
  const nav = filterSectionByUserPermissions(actorPerms);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <AppShell
              title="Dashboard"
              breadcrumbs={["Overview"]}
              sidebarTree={nav}
              userLabel="Maintenance User"
              // actorPerms={actorPerms}
              onSearch={(q) => {
                // Optional global search hook. For now: no-op.
                // Wire to a command palette / global search endpoint later.
                void q;
              }}
            />
          }
        >
          {/* Main / default */}
          <Route index element={<DashboardPage />} />

          {/* Minimal placeholder routes so sidebar links don't 404.
              Replace with real pages as you build. */}
          <Route path="fleet/aircraft" element={<AircraftPage canCreate={true} canEdit={true} />} />
          <Route path="fleet/utilization" element={<AircraftUtilizationPage  />} />
          <Route path="fleet/timeline" element={<Placeholder title="Aircraft Timeline" />} />

          <Route path="maintenance/inspection-schedule" element={<InspectionSchedulePage />} />
          <Route path="maintenance/work-orders" element={<WorkOrdersPage />} />
          <Route path="maintenance/squawks" element={<Placeholder title="Squawks & Discrepancies" />} />
          <Route path="maintenance/deferred" element={<Placeholder title="Deferred Items" />} />
          <Route path="maintenance/labor" element={<Placeholder title="Labor Time Entry" />} />

          <Route path="components" element={<Placeholder title="Components Registry" />} />
          <Route path="components/life-limits" element={<Placeholder title="Life Limits & Overhaul" />} />
          <Route path="components/history" element={<Placeholder title="Install/Remove History" />} />

          <Route path="inventory/parts" element={<Placeholder title="Parts Catalog" />} />
          <Route path="inventory/stock" element={<Placeholder title="Stock Lines" />} />
          <Route path="inventory/reservations" element={<Placeholder title="Reservations & Issues" />} />
          <Route path="inventory/transactions" element={<Placeholder title="Transactions" />} />

          <Route path="flight-logs/new" element={<Placeholder title="New Flight Log" />} />
          <Route path="flight-logs" element={<Placeholder title="Flight Logs" />} />
          <Route path="flight-logs/pilots" element={<Placeholder title="Pilot Hours" />} />

          <Route path="records/logbooks" element={<Placeholder title="Logbooks" />} />
          <Route path="records/signatures" element={<Placeholder title="Signatures Queue" />} />
          <Route path="records/attachments" element={<Placeholder title="Attachments" />} />
          <Route path="records/audit" element={<Placeholder title="Audit Trail" />} />

          <Route path="alerts/due-soon" element={<Placeholder title="Due Soon" />} />
          <Route path="alerts/overdue" element={<Placeholder title="Overdue" />} />
          <Route path="alerts/components" element={<Placeholder title="Component Alerts" />} />

          <Route path="reports/maintenance" element={<Placeholder title="Maintenance Summary" />} />
          <Route path="reports/labor" element={<Placeholder title="Labor & Cost" />} />
          <Route path="reports/inspections" element={<Placeholder title="Inspection Compliance" />} />
          <Route path="reports/parts" element={<Placeholder title="Parts Usage" />} />
          <Route path="reports/exports" element={<Placeholder title="Export Center" />} />

          <Route path="admin/users" element={<UsersPage canCreate={true} canEdit={true} canAssignRoles={true} />} />
          <Route path="admin/roles" element={<Placeholder title="Roles" />} />
          <Route path="admin/permissions" element={<Placeholder title="Permissions" />} />
          <Route path="admin/settings" element={<Placeholder title="System Settings" />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="text-sm text-zinc-500">{title}</div>
      <div className="text-xl font-semibold">{title}</div>
      <p className="mt-2 text-sm text-zinc-600">
        Wire this route to a real page component when you’re ready.
      </p>
    </div>
  );
}