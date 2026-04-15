import { Spinner } from "@/components/ui";

interface LoadingFallbackProps {
  fullScreen?: boolean;
}

export function LoadingFallback({ fullScreen = true }: LoadingFallbackProps) {
  return (
    <div
      className={`flex items-center justify-center ${fullScreen ? "min-h-screen bg-white dark:bg-secondary-900" : "py-12"}`}
    >
      <Spinner size="lg" />
    </div>
  );
}
