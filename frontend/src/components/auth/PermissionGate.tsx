import React from "react";
import { Module, Permission } from "../../types";
import { usePermissions } from "../../hooks/usePermissions";

interface PermissionGateProps {
  module: Module;
  permission: Permission;
  teamId?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({
  module,
  permission,
  teamId,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { can } = usePermissions(teamId);

  if (!can(module, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
