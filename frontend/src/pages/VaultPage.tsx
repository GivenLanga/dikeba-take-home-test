import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import { PermissionGate } from "../components/auth/PermissionGate";
import { Card, CardContent, CardHeader } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { LoadingSpinner } from "../components/common/LaodingSpinner";
import { api } from "../utils/api";
import { Secret } from "../types";
import { Lock, Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";

export function VaultPage() {
  const { user } = useAuth();
  const { can } = usePermissions();
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSecret, setEditingSecret] = useState<Secret | null>(null);
  const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (user?.teamId && can("vault", "read")) {
      fetchSecrets();
    }
  }, [user?.teamId, can]);

  const fetchSecrets = async () => {
    if (!user?.teamId) return;

    setLoading(true);
    try {
      const response = await api.vault.getAll(user.teamId);
      setSecrets(response.secrets);
    } catch (error) {
      console.error("Failed to fetch secrets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (name: string, value: string) => {
    if (!user?.teamId) return;

    try {
      await api.vault.create(name, value, user.teamId);
      await fetchSecrets();
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create secret:", error);
    }
  };

  const handleUpdate = async (id: string, name: string, value: string) => {
    try {
      await api.vault.update(id, { name, value });
      await fetchSecrets();
      setEditingSecret(null);
    } catch (error) {
      console.error("Failed to update secret:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this secret?")) return;

    try {
      await api.vault.delete(id);
      await fetchSecrets();
    } catch (error) {
      console.error("Failed to delete secret:", error);
    }
  };

  const toggleReveal = (secretId: string) => {
    const newRevealed = new Set(revealedSecrets);
    if (newRevealed.has(secretId)) {
      newRevealed.delete(secretId);
    } else {
      newRevealed.add(secretId);
    }
    setRevealedSecrets(newRevealed);
  };

  if (!can("vault", "read")) {
    return (
      <div className="text-center py-12">
        <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Access Denied
        </h2>
        <p className="text-gray-600">
          You don't have permission to access the Vault module.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Lock className="w-6 h-6 mr-2" />
            Vault
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Secure storage for sensitive information
          </p>
        </div>

        <PermissionGate module="vault" permission="create">
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Secret
          </Button>
        </PermissionGate>
      </div>

      {/* Secrets List */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Secrets</h2>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : secrets.length === 0 ? (
            <div className="text-center py-8">
              <Lock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No secrets found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {secrets.map((secret) => (
                <div
                  key={secret.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {secret.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                          {revealedSecrets.has(secret.id)
                            ? secret.value
                            : "••••••••"}
                        </code>
                        <button
                          onClick={() => toggleReveal(secret.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          {revealedSecrets.has(secret.id) ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Created{" "}
                        {new Date(secret.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <PermissionGate module="vault" permission="update">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setEditingSecret(secret)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </PermissionGate>

                      <PermissionGate module="vault" permission="delete">
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(secret.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </PermissionGate>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      {showCreateModal && (
        <SecretModal
          title="Create Secret"
          onSave={handleCreate}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Modal */}
      {editingSecret && (
        <SecretModal
          title="Edit Secret"
          initialName={editingSecret.name}
          initialValue={editingSecret.value}
          onSave={(name, value) => handleUpdate(editingSecret.id, name, value)}
          onClose={() => setEditingSecret(null)}
        />
      )}
    </div>
  );
}

// Secret Modal Component
interface SecretModalProps {
  title: string;
  initialName?: string;
  initialValue?: string;
  onSave: (name: string, value: string) => Promise<void>;
  onClose: () => void;
}

function SecretModal({
  title,
  initialName = "",
  initialValue = "",
  onSave,
  onClose,
}: SecretModalProps) {
  const [name, setName] = useState(initialName);
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !value) return;

    setLoading(true);
    try {
      await onSave(name, value);
    } catch (error) {
      console.error("Failed to save secret:", error);
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
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Secret name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Value
            </label>
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Secret value"
              rows={3}
              required
            />
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
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
