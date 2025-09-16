import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { LoadingSpinner } from "../components/common/LaodingSpinner";
import { api } from "../utils/api";
import { Role, Module, Permission } from "../types";
import { Shield, Plus, Edit2, Trash2 } from "lucide-react";

const MODULES: Module[] = ["vault", "financials", "reporting"];
const PERMISSIONS: Permission[] = ["create", "read", "update", "delete"];

export function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await api.roles.getAll();
      setRoles(response.roles);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (
    name: string,
    description: string,
    permissions: Record<Module, Permission[]>
  ) => {
    try {
      await api.roles.create(name, description, permissions);
      await fetchRoles();
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create role:", error);
    }
  };

  const handleUpdate = async (
    id: string,
    name: string,
    description: string,
    permissions: Record<Module, Permission[]>
  ) => {
    try {
      await api.roles.update(id, { name, description, permissions });
      await fetchRoles();
      setEditingRole(null);
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return;

    try {
      await api.roles.delete(id);
      await fetchRoles();
    } catch (error) {
      console.error("Failed to delete role:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="w-6 h-6 mr-2" />
            Roles
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Define permissions for different user roles
          </p>
        </div>

        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Role
        </Button>
      </div>

      {/* Roles List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-4">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{role.name}</h3>
                    {role.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {role.description}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditingRole(role)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(role.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {MODULES.map((module) => (
                    <div key={module}>
                      <h4 className="font-medium text-gray-900 capitalize mb-2">
                        {module}
                      </h4>
                      <div className="space-y-1">
                        {role.permissions[module]?.length > 0 ? (
                          role.permissions[module].map((perm) => (
                            <span
                              key={perm}
                              className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded mr-1"
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
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <RoleModal
          title="Create Role"
          onSave={handleCreate}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Modal */}
      {editingRole && (
        <RoleModal
          title="Edit Role"
          initialName={editingRole.name}
          initialDescription={editingRole.description || ""}
          initialPermissions={editingRole.permissions}
          onSave={(name, description, permissions) =>
            handleUpdate(editingRole.id, name, description, permissions)
          }
          onClose={() => setEditingRole(null)}
        />
      )}
    </div>
  );
}

// Role Modal Component
interface RoleModalProps {
  title: string;
  initialName?: string;
  initialDescription?: string;
  initialPermissions?: Record<Module, Permission[]>;
  onSave: (
    name: string,
    description: string,
    permissions: Record<Module, Permission[]>
  ) => Promise<void>;
  onClose: () => void;
}

function RoleModal({
  title,
  initialName = "",
  initialDescription = "",
  initialPermissions = { vault: [], financials: [], reporting: [] },
  onSave,
  onClose,
}: RoleModalProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [permissions, setPermissions] =
    useState<Record<Module, Permission[]>>(initialPermissions);
  const [loading, setLoading] = useState(false);

  const togglePermission = (module: Module, permission: Permission) => {
    setPermissions((prev) => {
      const modulePerms = prev[module] || [];
      const hasPermission = modulePerms.includes(permission);

      return {
        ...prev,
        [module]: hasPermission
          ? modulePerms.filter((p) => p !== permission)
          : [...modulePerms, permission],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onSave(name, description, permissions);
    } catch (error) {
      console.error("Failed to save role:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter role name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Role description"
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Permissions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MODULES.map((module) => (
                <div
                  key={module}
                  className="border border-gray-200 rounded-lg p-3"
                >
                  <h5 className="font-medium text-gray-900 capitalize mb-2">
                    {module}
                  </h5>
                  <div className="space-y-2">
                    {PERMISSIONS.map((permission) => (
                      <label key={permission} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={
                            permissions[module]?.includes(permission) || false
                          }
                          onChange={() => togglePermission(module, permission)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {permission}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

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
              Save Role
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
