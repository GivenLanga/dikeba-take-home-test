import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import {
  Users,
  Users2,
  Shield,
  UserCheck,
  Lock,
  DollarSign,
  FileText,
  Settings,
} from "lucide-react";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}

function NavItem({ to, icon, label, end }: NavItemProps) {
  const location = useLocation();
  const isActive = end
    ? location.pathname === to
    : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
        isActive
          ? "bg-blue-100 text-blue-700"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
}

export function Navigation() {
  const { user } = useAuth();
  const { can } = usePermissions();

  if (!user) return null;

  return (
    <nav className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800">SaaS App</h2>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>

      <div className="px-4 space-y-2">
        {/* Dashboard */}
        <NavItem
          to="/"
          icon={<Settings className="w-5 h-5" />}
          label="Dashboard"
          end
        />

        {/* Management Section */}
        <div className="pt-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Management
          </h3>

          <NavItem
            to="/users"
            icon={<Users className="w-5 h-5" />}
            label="Users"
          />

          <NavItem
            to="/teams"
            icon={<Users2 className="w-5 h-5" />}
            label="Teams"
          />

          <NavItem
            to="/roles"
            icon={<Shield className="w-5 h-5" />}
            label="Roles"
          />

          <NavItem
            to="/groups"
            icon={<UserCheck className="w-5 h-5" />}
            label="Groups"
          />
        </div>

        {/* Modules Section */}
        <div className="pt-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Modules
          </h3>

          {can("vault", "read") && (
            <NavItem
              to="/vault"
              icon={<Lock className="w-5 h-5" />}
              label="Vault"
            />
          )}

          {can("financials", "read") && (
            <NavItem
              to="/financials"
              icon={<DollarSign className="w-5 h-5" />}
              label="Financials"
            />
          )}

          {can("reporting", "read") && (
            <NavItem
              to="/reporting"
              icon={<FileText className="w-5 h-5" />}
              label="Reporting"
            />
          )}
        </div>
      </div>
    </nav>
  );
}
