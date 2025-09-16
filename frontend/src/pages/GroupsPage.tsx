import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { LoadingSpinner } from "../components/common/LaodingSpinner";
import { api } from "../utils/api";
import { Group, Role, User, Team } from "../types";
import {
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Users,
  Shield,
  UserPlus,
  UserMinus,
} from "lucide-react";

export function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [groupsRes, teamsRes, rolesRes, usersRes] = await Promise.all([
        api.groups.getAll(),
        api.teams.getAll(),
        api.roles.getAll(),
        api.users.getAll(),
      ]);
      setGroups(groupsRes.groups);
      setTeams(teamsRes.teams);
      setRoles(rolesRes.roles);
      setUsers(usersRes.users);
    } catch (error) {
      setError(
        "Failed to fetch groups or related data. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (
    name: string,
    description: string,
    teamId?: string
  ) => {
    if (!teamId) return;
    setActionLoading(true);
    try {
      await api.groups.create(name, description, teamId);
      await fetchData();
      setShowCreateModal(false);
    } catch (error) {
      setError("Failed to create group.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (
    id: string,
    name: string,
    description: string
  ) => {
    setActionLoading(true);
    try {
      await api.groups.update(id, { name, description });
      await fetchData();
      setEditingGroup(null);
    } catch (error) {
      setError("Failed to update group.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this group?")) return;
    setActionLoading(true);
    try {
      await api.groups.delete(id);
      await fetchData();
    } catch (error) {
      setError("Failed to delete group.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddUser = async (groupId: string, userId: string) => {
    try {
      await api.groups.addUser(groupId, userId);
      await fetchData();
    } catch (error) {
      console.error("Failed to add user to group:", error);
    }
  };

  const handleRemoveUser = async (groupId: string, userId: string) => {
    try {
      await api.groups.removeUser(groupId, userId);
      await fetchData();
    } catch (error) {
      console.error("Failed to remove user from group:", error);
    }
  };

  const handleAddRole = async (groupId: string, roleId: string) => {
    try {
      await api.groups.addRole(groupId, roleId);
      await fetchData();
    } catch (error) {
      console.error("Failed to add role to group:", error);
    }
  };

  const handleRemoveRole = async (groupId: string, roleId: string) => {
    try {
      await api.groups.removeRole(groupId, roleId);
      await fetchData();
    } catch (error) {
      console.error("Failed to remove role from group:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <UserCheck className="w-6 h-6 mr-2" />
            Groups
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Assign roles to teams and manage user permissions
          </p>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          disabled={actionLoading || loading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 mb-2">
          {error}
        </div>
      )}

      {/* Groups List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No groups found. Create your first group to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {groups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{group.name}</h3>
                    {group.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {group.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        Team: {group.team.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedGroup(group)}
                      disabled={actionLoading}
                    >
                      Manage
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditingGroup(group)}
                      disabled={actionLoading}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(group.id)}
                      disabled={actionLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Users */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">
                      Users ({group.userGroups?.length || 0})
                    </h4>
                    {group.userGroups && group.userGroups.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {group.userGroups.slice(0, 3).map((userGroup) => (
                          <span
                            key={userGroup.id}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                          >
                            {userGroup.user.email}
                          </span>
                        ))}
                        {group.userGroups.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{group.userGroups.length - 3} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">No users assigned</p>
                    )}
                  </div>

                  {/* Roles */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">
                      Roles ({group.groupRoles?.length || 0})
                    </h4>
                    {group.groupRoles && group.groupRoles.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {group.groupRoles.map((groupRole) => (
                          <span
                            key={groupRole.id}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                          >
                            {groupRole.role.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">No roles assigned</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <GroupModal
          title="Create Group"
          teams={teams}
          onSave={handleCreate}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Modal */}
      {editingGroup && (
        <GroupModal
          title="Edit Group"
          initialName={editingGroup.name}
          initialDescription={editingGroup.description || ""}
          teams={teams}
          selectedTeamId={editingGroup.teamId}
          onSave={(name, description) =>
            handleUpdate(editingGroup.id, name, description)
          }
          onClose={() => setEditingGroup(null)}
          isEdit
        />
      )}

      {/* Manage Group Modal */}
      {selectedGroup && (
        <GroupManageModal
          group={selectedGroup}
          users={users}
          roles={roles}
          onAddUser={handleAddUser}
          onRemoveUser={handleRemoveUser}
          onAddRole={handleAddRole}
          onRemoveRole={handleRemoveRole}
          onClose={() => setSelectedGroup(null)}
        />
      )}
    </div>
  );
}

// Group Create/Edit Modal
interface GroupModalProps {
  title: string;
  initialName?: string;
  initialDescription?: string;
  teams: Team[];
  selectedTeamId?: string;
  isEdit?: boolean;
  onSave: (name: string, description: string, teamId?: string) => Promise<void>;
  onClose: () => void;
}

function GroupModal({
  title,
  initialName = "",
  initialDescription = "",
  teams,
  selectedTeamId = "",
  isEdit = false,
  onSave,
  onClose,
}: GroupModalProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [teamId, setTeamId] = useState(selectedTeamId);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || (!isEdit && !teamId)) return;

    setLoading(true);
    try {
      await onSave(name, description, teamId);
    } catch (error) {
      console.error("Failed to save group:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter group name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Group description"
              rows={3}
            />
          </div>

          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team
              </label>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Save Group
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Group Management Modal
interface GroupManageModalProps {
  group: Group;
  users: User[];
  roles: Role[];
  onAddUser: (groupId: string, userId: string) => Promise<void>;
  onRemoveUser: (groupId: string, userId: string) => Promise<void>;
  onAddRole: (groupId: string, roleId: string) => Promise<void>;
  onRemoveRole: (groupId: string, roleId: string) => Promise<void>;
  onClose: () => void;
}

function GroupManageModal({
  group,
  users,
  roles,
  onAddUser,
  onRemoveUser,
  onAddRole,
  onRemoveRole,
  onClose,
}: GroupManageModalProps) {
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");
  const [loading, setLoading] = useState(false);

  // Get users in the same team who are not in this group
  const availableUsers = users.filter(
    (user) =>
      user.teamId === group.teamId &&
      !group.userGroups?.some((ug) => ug.userId === user.id)
  );

  // Get roles not assigned to this group
  const availableRoles = roles.filter(
    (role) => !group.groupRoles?.some((gr) => gr.roleId === role.id)
  );

  const handleAddUser = async (userId: string) => {
    setLoading(true);
    try {
      await onAddUser(group.id, userId);
    } catch (error) {
      console.error("Failed to add user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    setLoading(true);
    try {
      await onRemoveUser(group.id, userId);
    } catch (error) {
      console.error("Failed to remove user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async (roleId: string) => {
    setLoading(true);
    try {
      await onAddRole(group.id, roleId);
    } catch (error) {
      console.error("Failed to add role:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    setLoading(true);
    try {
      await onRemoveRole(group.id, roleId);
    } catch (error) {
      console.error("Failed to remove role:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Manage Group: {group.name}
            </h3>
            <p className="text-sm text-gray-500">Team: {group.team.name}</p>
          </div>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "users"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Users
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "roles"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Shield className="w-4 h-4 inline mr-2" />
            Roles
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Users */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Current Users ({group.userGroups?.length || 0})
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {group.userGroups && group.userGroups.length > 0 ? (
                  group.userGroups.map((userGroup) => (
                    <div
                      key={userGroup.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <span className="text-sm text-gray-900">
                        {userGroup.user.email}
                      </span>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleRemoveUser(userGroup.userId)}
                        disabled={loading}
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No users in this group
                  </p>
                )}
              </div>
            </div>

            {/* Available Users */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Available Users ({availableUsers.length})
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableUsers.length > 0 ? (
                  availableUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <span className="text-sm text-gray-900">
                        {user.email}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleAddUser(user.id)}
                        disabled={loading}
                      >
                        <UserPlus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No available users from this team
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Roles Tab */}
        {activeTab === "roles" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Roles */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Current Roles ({group.groupRoles?.length || 0})
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {group.groupRoles && group.groupRoles.length > 0 ? (
                  group.groupRoles.map((groupRole) => (
                    <div
                      key={groupRole.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {groupRole.role.name}
                        </span>
                        {groupRole.role.description && (
                          <p className="text-xs text-gray-500">
                            {groupRole.role.description}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleRemoveRole(groupRole.roleId)}
                        disabled={loading}
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No roles assigned to this group
                  </p>
                )}
              </div>
            </div>

            {/* Available Roles */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Available Roles ({availableRoles.length})
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableRoles.length > 0 ? (
                  availableRoles.map((role) => (
                    <div
                      key={role.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {role.name}
                        </span>
                        {role.description && (
                          <p className="text-xs text-gray-500">
                            {role.description}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddRole(role.id)}
                        disabled={loading}
                      >
                        <UserPlus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No available roles
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
