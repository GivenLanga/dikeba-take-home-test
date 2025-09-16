import { useState, useEffect } from "react";
import { Module, Permission, UserPermissions } from "../types";
import { useAuth } from "../contexts/AuthContext";

export function usePermissions(teamId?: string) {
  const { user, permissions, hasPermission } = useAuth();
  const [teamPermissions, setTeamPermissions] =
    useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (teamId && teamId !== user?.teamId) {
      fetchTeamPermissions(teamId);
    } else {
      setTeamPermissions(permissions);
    }
  }, [teamId, user, permissions]);

  const fetchTeamPermissions = async (teamId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await api.request(`/auth/permissions?teamId=${teamId}`);
      setTeamPermissions(response.permissions);
    } catch (error) {
      console.error("Failed to fetch team permissions:", error);
      setTeamPermissions({ vault: [], financials: [], reporting: [] });
    } finally {
      setLoading(false);
    }
  };

  const can = (module: Module, permission: Permission) => {
    if (teamId) {
      return teamPermissions?.[module]?.includes(permission) || false;
    }
    return hasPermission(module, permission);
  };

  return {
    permissions: teamPermissions || permissions,
    loading,
    can,
    hasPermission: can,
  };
}
