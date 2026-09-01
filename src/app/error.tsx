"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Mountain, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#f6f4ef] px-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-xl">
        <Mountain className="h-7 w-7 text-pine-950" />
      </span>
      <h1 className="mt-5 font-display text-2xl font-black text-pine-950">
        Something slipped off the mountain
      </h1>
      <p className="mt-2 max-w-sm text-sm text-stone-500">
        A hiccup occurred while loading this page. It&apos;s usually temporary — try again.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-full bg-pine-800 px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white transition hover:bg-pine-700"
        >
          <RotateCcw className="h-4 w-4" /> Try Again
        </button>
        <Link
          href="/"
          className="rounded-full border border-stone-200 bg-white px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider text-stone-600 transition hover:border-pine-400 hover:text-pine-700"
        >
          Back to Store
        </Link>
      </div>
    </div>
  );
}
