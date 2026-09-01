"use client";

import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useUi } from "@/store/ui";
import { cn } from "@/lib/utils";

export default function Toasters() {
  const toasts = useUi((s) => s.toasts);
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[100] flex flex-col items-center gap-2 px-4 md:bottom-8">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "animate-toast-in pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-full py-2.5 pl-3.5 pr-5 text-sm font-bold text-white shadow-2xl",
            t.tone === "error" ? "bg-red-600" : t.tone === "info" ? "bg-stone-800" : "bg-pine-800"
          )}
        >
          {t.tone === "error" ? (
            <AlertCircle className="h-4.5 w-4.5 shrink-0 text-white" />
          ) : t.tone === "info" ? (
            <Info className="h-4.5 w-4.5 shrink-0 text-amber-300" />
          ) : (
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-amber-400" />
          )}
          {t.message}
        </div>
      ))}
    </div>
  );
}
