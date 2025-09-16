import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { LoadingSpinner } from "../components/common/LaodingSpinner";
import { api } from "../utils/api";
import { User, Team } from "../types";
import { Users, UserCheck, UserX, Edit2 } from "lucide-react";

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.users.getAll();
      setUsers(response.users);
    } catch (error) {
      setError("Failed to fetch users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await api.teams.getAll();
      setTeams(response.teams);
    } catch (error) {
      // Silent fail for teams
    }
  };

  const handleUpdateUser = async (
    userId: string,
    teamId?: string,
    verified?: boolean
  ) => {
    setActionLoading(true);
    setActionMessage("");
    try {
      await api.users.update(userId, {
        ...(teamId !== undefined && { teamId }),
        ...(verified !== undefined && { verified }),
      });
      setActionMessage("User updated successfully.");
      await fetchUsers();
      setEditingUser(null);
    } catch (error) {
      setActionMessage("Failed to update user.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setActionLoading(true);
    setActionMessage("");
    try {
      await api.users.delete(userId);
      setActionMessage("User deleted successfully.");
      await fetchUsers();
    } catch (error) {
      setActionMessage("Failed to delete user.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Users className="w-6 h-6 mr-2" />
          Users
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage users and their access
        </p>
      </div>

      {/* Action messages */}
      {actionMessage && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700 mb-2">
          {actionMessage}
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 mb-2">
          {error}
        </div>
      )}

      {/* Users List */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">All Users</h2>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Groups
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            Joined{" "}
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.verified
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {user.verified ? (
                            <>
                              <UserCheck className="w-3 h-3 mr-1" />
                              Verified
                            </>
                          ) : (
                            <>
                              <UserX className="w-3 h-3 mr-1" />
                              Pending
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.team?.name || "No team"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.userGroups?.length || 0} groups
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setEditingUser(user)}
                            disabled={actionLoading}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          {user.id !== currentUser?.id && (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={actionLoading}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      {editingUser && (
        <UserEditModal
          user={editingUser}
          teams={teams}
          onSave={(teamId, verified) =>
            handleUpdateUser(editingUser.id, teamId, verified)
          }
          onClose={() => setEditingUser(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

// User Edit Modal Component
interface UserEditModalProps {
  user: User;
  teams: Team[];
  onSave: (teamId?: string, verified?: boolean) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

function UserEditModal({
  user,
  teams,
  onSave,
  onClose,
  loading,
}: UserEditModalProps) {
  const [teamId, setTeamId] = useState(user.teamId || "");
  const [verified, setVerified] = useState(user.verified);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(teamId || undefined, verified);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Edit User: {user.email}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={verified}
                onChange={(e) => setVerified(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={loading}
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                <UserCheck className="inline w-4 h-4 mr-1 text-green-600" />
                Verified (Allow login)
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team
            </label>
            <select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="">No team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="flex-1"
              disabled={loading}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
