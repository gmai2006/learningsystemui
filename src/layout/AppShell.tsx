// src/layout/AppShell.tsx
import { PropsWithChildren, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  LogOut,
  Search,
  Shield,
  UserCircle2,
} from "lucide-react";

/**
 * Renders sidebarTree directly (with section headers + optional collapsible groups).
 *
 * Expected sidebarTree shape:
 * export const sidebarTree = [
 *   { section: "Fleet", items: [{ label: "Aircraft", to: "/fleet/aircraft", icon: Plane, perm?: "..." }, ...] },
 *   ...
 * ] as const;
 */

export type SidebarItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Optional permission code (front-end gating). If omitted, assumed viewable. */
  perm?: string;
};

export type SidebarSection = {
  section: string;
  items: SidebarItem[];
};

export type AppShellProps = {
  title: string;
  breadcrumbs?: string[];
  sidebarTree: SidebarSection[];
  onSearch?: (q: string) => void;
  userLabel?: string;

  /** Optional permission list for gating nav items (and later: actions). */
  actorPerms?: string[];
  /** Optional override for permission check. If supplied, actorPerms is ignored. */
  canView?: (perm?: string) => boolean;

  /** Collapsible groups */
  collapsibleSections?: boolean;
};

export function AppShell({
  title,
  breadcrumbs,
  sidebarTree,
  onSearch,
  userLabel,
  actorPerms,
  canView,
  collapsibleSections = true,
}: AppShellProps) {
  const location = useLocation();

  const defaultCanView = (perm?: string) => {
    if (!perm) return true;
    if (!actorPerms || actorPerms.length === 0) return false;
    if (actorPerms.includes("*")) return true;
    return actorPerms.includes(perm);
  };

  // const canSee = canView ?? defaultCanView;

  // Initialize open sections:
  // - open the section that contains the current route
  // - otherwise open the first section
  const initialOpen = useMemo(() => {
    const open: Record<string, boolean> = {};
    let matched = false;

    for (const sec of sidebarTree) {
      const visibleItems = sidebarTree;//sec.items.filter((i) => canSee(i.perm));
      if (visibleItems.length === 0) continue;

      const hasMatch = visibleItems.some((i) =>
        location.pathname === i.to || location.pathname.startsWith(i.to + "/")
      );

      open[sec.section] = collapsibleSections ? hasMatch : true;
      matched = matched || hasMatch;
    }

    if (!matched) {
      // open first visible section
      const first = sidebarTree.find((s) => s.items.some((i) => true));
      if (first) open[first.section] = true;
    }

    return open;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(initialOpen);

  const toggleSection = (name: string) => {
    if (!collapsibleSections) return;
    setOpenSections((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-72 flex-col border-r bg-white">
          <div className="h-14 px-4 flex items-center gap-2 border-b">
            <Shield className="h-5 w-5" />
            <span className="font-semibold">Aviation Maintenance</span>
          </div>

          <nav className="p-2 space-y-2 overflow-auto">
            {sidebarTree.map((sec) => {
              const visibleItems = sec.items;//.filter((i) => canSee(i.perm));
              if (visibleItems.length === 0) return null;

              const isOpen = collapsibleSections ? !!openSections[sec.section] : true;

              return (
                <div key={sec.section} className="space-y-1">
                  {/* Section header */}
                  <button
                    type="button"
                    onClick={() => toggleSection(sec.section)}
                    className={[
                      "w-full flex items-center justify-between rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wide",
                      "text-zinc-500 hover:bg-zinc-50",
                      collapsibleSections ? "" : "cursor-default",
                    ].join(" ")}
                    aria-expanded={isOpen}
                  >
                    <span>{sec.section}</span>
                    {collapsibleSections ? (
                      isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )
                    ) : null}
                  </button>

                  {/* Section items */}
                  {isOpen ? (
                    <div className="space-y-1">
                      {visibleItems.map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className={({ isActive }) => {
                            // Treat child routes as active if they share prefix
                            const active =
                              isActive ||
                              location.pathname === item.to ||
                              location.pathname.startsWith(item.to + "/");

                            return [
                              "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                              active ? "bg-zinc-100 font-medium" : "hover:bg-zinc-50 text-zinc-700",
                            ].join(" ");
                          }}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="truncate">{item.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>

          <div className="mt-auto border-t p-3">
            <div className="flex items-center gap-2 text-sm text-zinc-700">
              <UserCircle2 className="h-4 w-4" />
              <span className="truncate">{userLabel ?? "Signed in"}</span>
            </div>

            <button
              type="button"
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-zinc-50"
              onClick={() => {
                // wire to real sign-out later
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1">
          {/* Topbar */}
          <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
            <div className="h-14 px-4 md:px-6 flex items-center justify-between gap-3">
              <div className="min-w-0">
                {breadcrumbs?.length ? (
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    {breadcrumbs.map((b, i) => (
                      <span key={`${b}-${i}`} className="flex items-center gap-1">
                        {i > 0 && <ChevronRight className="h-3 w-3" />}
                        <span className="truncate">{b}</span>
                      </span>
                    ))}
                  </div>
                ) : null}
                <h1 className="text-lg font-semibold truncate">{title}</h1>
              </div>

              {onSearch ? (
                <div className="hidden sm:flex items-center gap-2 w-80">
                  <div className="relative w-full">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-400" />
                    <input
                      className="w-full rounded-md border bg-white pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                      placeholder="Search…"
                      onChange={(e) => onSearch(e.target.value)}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </header>

          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}