import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, UserPermissions, Module, Permission } from "../types";
import { api } from "../utils/api";

interface AuthContextType {
  user: User | null;
  permissions: UserPermissions | null;
  loading: boolean;
  login: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, tenantId: string) => Promise<void>;
  requestOtp: (email: string) => Promise<void>;
  hasPermission: (
    module: Module,
    permission: Permission,
    teamId?: string
  ) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Try to fetch current user info
      const response = await api.request("/auth/me");
      if (response.user) {
        setUser(response.user);
        await fetchPermissions(response.user);
      }
    } catch (error) {
      console.log("No active session");
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async (user: User) => {
    try {
      if (user.teamId) {
        const response = await api.request(
          `/auth/permissions?teamId=${user.teamId}`
        );
        setPermissions(response.permissions);
      }
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
      setPermissions({ vault: [], financials: [], reporting: [] });
    }
  };

  const register = async (email: string, tenantId: string) => {
    await api.auth.register(email, tenantId);
  };

  const requestOtp = async (email: string) => {
    await api.auth.requestOtp(email);
  };

  const login = async (email: string, code: string) => {
    try {
      // Verify OTP first
      console.log("Attempting OTP verification for:", email);
      const response = await api.auth.verifyOtp(email, code);
      console.log("OTP verification response:", response);

      // If OTP verification succeeds (doesn't throw), create a user object
      // This is a temporary workaround to test the flow
      const tempUser = {
        id: Date.now().toString(),
        email: email,
        verified: true,
        // Add any other required User properties here
      };

      console.log("OTP verified successfully, setting temp user:", tempUser);
      setUser(tempUser as User);

      // Try to fetch real user data in the background
      try {
        const userResponse = await api.request("/auth/me");
        console.log("Real user data:", userResponse);
        if (userResponse && userResponse.user) {
          console.log("Replacing with real user data");
          setUser(userResponse.user);
          await fetchPermissions(userResponse.user);
        }
      } catch (fetchError) {
        console.log("Couldn't fetch real user data, using temp user");
        // Keep using temp user for now
      }
    } catch (error) {
      console.error("Login error (OTP verification failed):", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setPermissions(null);
    }
  };

  const refreshUser = async () => {
    if (user) {
      await checkAuth();
    }
  };

  const hasPermission = (
    module: Module,
    permission: Permission,
    teamId?: string
  ): boolean => {
    if (!permissions || !user) return false;

    // If teamId is specified and user is not in that team, no permission
    if (teamId && user.teamId !== teamId) return false;

    return permissions[module]?.includes(permission) || false;
  };

  const value: AuthContextType = {
    user,
    permissions,
    loading,
    login,
    logout,
    register,
    requestOtp,
    hasPermission,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
