import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { api } from "../utils/api";
import { User } from "../types";
import { UserCheck, Users, Shield, Lock } from "lucide-react";

export function DashboardPage() {
  const { user, permissions } = useAuth();
  const [unverifiedUsers, setUnverifiedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUnverifiedUsers();
    }
  }, [user]);

  const fetchUnverifiedUsers = async () => {
    try {
      const response = await api.admin.getUnverifiedUsers();
      setUnverifiedUsers(response.users);
    } catch (error) {
      console.error("Failed to fetch unverified users:", error);
    }
  };

  const handleVerifyUser = async (userId: string) => {
    setLoading(true);
    try {
      await api.admin.verifyUser(userId);
      await fetchUnverifiedUsers(); // Refresh the list
    } catch (error) {
      console.error("Failed to verify user:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: "Vault Access",
      value: permissions?.vault?.length || 0,
      description: "permissions",
      icon: <Lock className="w-8 h-8 text-blue-600" />,
    },
    {
      title: "Financials Access",
      value: permissions?.financials?.length || 0,
      description: "permissions",
      icon: <Shield className="w-8 h-8 text-green-600" />,
    },
    {
      title: "Reporting Access",
      value: permissions?.reporting?.length || 0,
      description: "permissions",
      icon: <Users className="w-8 h-8 text-purple-600" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.email}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">{stat.icon}</div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500">{stat.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Unverified Users (Admin only) */}
      {unverifiedUsers.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-medium text-gray-900">
                Pending User Verifications
              </h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unverifiedUsers.map((unverifiedUser) => (
                <div
                  key={unverifiedUser.id}
                  className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {unverifiedUser.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      Registered on{" "}
                      {new Date(unverifiedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    loading={loading}
                    onClick={() => handleVerifyUser(unverifiedUser.id)}
                  >
                    Verify User
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/users"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="w-6 h-6 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900">Manage Users</h3>
              <p className="text-sm text-gray-500">
                Add, edit, and manage users
              </p>
            </a>

            <a
              href="/teams"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="w-6 h-6 text-green-600 mb-2" />
              <h3 className="font-medium text-gray-900">Manage Teams</h3>
              <p className="text-sm text-gray-500">Organize users into teams</p>
            </a>

            <a
              href="/roles"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Shield className="w-6 h-6 text-purple-600 mb-2" />
              <h3 className="font-medium text-gray-900">Manage Roles</h3>
              <p className="text-sm text-gray-500">
                Define permissions and roles
              </p>
            </a>

            <a
              href="/groups"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <UserCheck className="w-6 h-6 text-orange-600 mb-2" />
              <h3 className="font-medium text-gray-900">Manage Groups</h3>
              <p className="text-sm text-gray-500">Assign roles to teams</p>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Current Permissions */}
      {permissions && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">
              Your Permissions
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(permissions).map(([module, perms]) => (
                <div key={module}>
                  <h3 className="font-medium text-gray-900 capitalize mb-2">
                    {module}
                  </h3>
                  <div className="space-y-1">
                    {perms.length > 0 ? (
                      perms.map((perm) => (
                        <span
                          key={perm}
                          className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded mr-1"
                        >
                          {perm}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">
                        No permissions
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
