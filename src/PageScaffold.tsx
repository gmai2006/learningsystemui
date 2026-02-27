// PageScaffold.tsx
import { PropsWithChildren } from "react";

export function PageScaffold({
  header,
  actions,
  filters,
  children,
}: PropsWithChildren<{
  header: React.ReactNode;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
}>) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">{header}</div>
        {actions ? <div className="flex gap-2">{actions}</div> : null}
      </div>

      {filters ? (
        <div className="rounded-lg border bg-white p-3">{filters}</div>
      ) : null}

      <div className="rounded-lg border bg-white">{children}</div>
    </div>
  );
}