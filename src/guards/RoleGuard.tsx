import { type ReactNode } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/config/permissions.config";
import { ShieldOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-secondary-900">
        <div className="max-w-sm w-full text-center bg-white dark:bg-secondary-800 p-8 rounded-xl border border-neutral-200 dark:border-secondary-700 shadow-lg">
          <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary-500/10 mx-auto mb-6">
            <ShieldOff className="h-10 w-10 text-primary-500" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Access Denied
          </h2>
          <p className="text-neutral-500 mb-1">
            You don&apos;t have permission to access this page.
          </p>
          <p className="text-sm text-neutral-400 mb-6">
            Your role:{" "}
            <strong className="text-neutral-600">
              {user.role.replace("_", " ").toUpperCase()}
            </strong>
          </p>
          <Button
            variant="primary"
            leftIcon={<ArrowLeft />}
            onClick={() => navigate("/modules")}
          >
            Back to Modules
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
