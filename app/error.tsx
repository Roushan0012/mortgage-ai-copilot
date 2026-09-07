"use client";

import React, { useEffect } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";
import { Button } from "@/components/shared/Button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error captured:", error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[60vh]">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
        <AlertOctagon className="h-6 w-6" />
      </div>
      <h2 className="text-base font-bold text-slate-900 mb-1">Session Encountered an Unexpected State</h2>
      <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">
        {error.message || "An unexpected runtime error occurred while processing meeting state. All audit logs remain secure."}
      </p>
      <div className="flex items-center space-x-3">
        <Button onClick={() => reset()} size="sm" className="flex items-center space-x-1.5">
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Recover Session</span>
        </Button>
      </div>
    </div>
  );
}
