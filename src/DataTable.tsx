// DataTable.tsx
import { ReactNode } from "react";

export function DataTable({
  columns,
  rows,
  onRowClick,
}: {
  columns: { key: string; header: string; className?: string }[];
  rows: { id: string; cells: Record<string, ReactNode> }[];
  onRowClick?: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 text-zinc-600">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={["text-left font-medium px-4 py-3", c.className].join(" ")}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              className="border-t hover:bg-zinc-50 cursor-pointer"
              onClick={() => onRowClick?.(r.id)}
            >
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3">
                  {r.cells[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}