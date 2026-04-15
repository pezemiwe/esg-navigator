import { type ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-secondary-900 relative overflow-hidden flex items-center justify-center">
      <div className="relative z-10 w-full max-w-[480px] mx-auto px-4">
        {children}
      </div>
    </div>
  );
}
