import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";
import { Button } from "@/components/shared/Button";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[60vh]">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 mb-4">
        <FileQuestion className="h-6 w-6" />
      </div>
      <h2 className="text-base font-bold text-slate-900 mb-1">Page Not Found</h2>
      <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
        The requested loan consultation file, customer dossier, or system view could not be located.
      </p>
      <Link href="/dashboard">
        <Button size="sm" variant="outline" className="flex items-center space-x-1.5">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Dashboard</span>
        </Button>
      </Link>
    </div>
  );
}
