import { useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import { Permission, rolePermissions } from "@/config/permissions.config";

export function usePermissions() {
  const user = useAuthStore((state) => state.user);

  const permissions = useMemo(() => {
    if (!user) return [];
    return rolePermissions[user.role] || [];
  }, [user]);

  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (perms: Permission[]): boolean => {
    return perms.some((perm) => permissions.includes(perm));
  };

  const hasAllPermissions = (perms: Permission[]): boolean => {
    return perms.every((perm) => permissions.includes(perm));
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}
