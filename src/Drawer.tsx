// Drawer.tsx
import { X } from "lucide-react";
import { PropsWithChildren } from "react";

export function Drawer({
  open,
  title,
  onClose,
  children,
}: PropsWithChildren<{
  open: boolean;
  title: string;
  onClose: () => void;
}>) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-white shadow-xl flex flex-col">
        <div className="h-14 px-4 border-b flex items-center justify-between">
          <div className="font-semibold truncate">{title}</div>
          <button className="p-2 rounded-md hover:bg-zinc-100" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 overflow-auto">{children}</div>
      </div>
    </div>
  );
}