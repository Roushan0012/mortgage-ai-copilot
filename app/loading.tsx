import { LoadingState } from "@/components/shared/EmptyState";

export default function RootLoading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <LoadingState message="Initializing Darwix AI Copilot session..." />
    </div>
  );
}
