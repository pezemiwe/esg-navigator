import { type ReactNode } from "react";
import { AuthGuard } from "./AuthGuard";
import { RoleGuard } from "./RoleGuard";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import type { UserRole } from "@/config/permissions.config";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: UserRole[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  return (
    <AuthGuard>
      {roles ? (
        <RoleGuard allowedRoles={roles}>
          <ErrorBoundary>{children}</ErrorBoundary>
        </RoleGuard>
      ) : (
        <ErrorBoundary>{children}</ErrorBoundary>
      )}
    </AuthGuard>
  );
}
