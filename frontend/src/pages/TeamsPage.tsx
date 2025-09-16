import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { LoadingSpinner } from "../components/common/LaodingSpinner";
import { api } from "../utils/api";
import { Team } from "../types";
import { Users2, Plus, Edit2, Trash2, Users } from "lucide-react";

export function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.teams.getAll();
      setTeams(response.teams);
    } catch (error) {
      setError("Failed to fetch teams. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (name: string) => {
    setActionLoading(true);
    try {
      await api.teams.create(name);
      await fetchTeams();
      setShowCreateModal(false);
    } catch (error) {
      setError("Failed to create team.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (id: string, name: string) => {
    setActionLoading(true);
    try {
      await api.teams.update(id, name);
      await fetchTeams();
      setEditingTeam(null);
    } catch (error) {
      setError("Failed to update team.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team?")) return;
    setActionLoading(true);
    try {
      await api.teams.delete(id);
      await fetchTeams();
    } catch (error) {
      setError("Failed to delete team.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users2 className="w-6 h-6 mr-2" />
            Teams
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Organize users into teams
          </p>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          disabled={actionLoading || loading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Team
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 mb-2">
          {error}
        </div>
      )}

      {/* Teams Grid */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No teams found. Create your first team to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{team.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <Users className="w-4 h-4 mr-1" />
                      {team._count?.users || 0} members
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditingTeam(team)}
                      disabled={actionLoading}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(team.id)}
                      disabled={actionLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  <p>Groups: {team._count?.groups || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Created {new Date(team.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {team.users && team.users.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Members:
                    </p>
                    <div className="space-y-1">
                      {team.users.slice(0, 3).map((user) => (
                        <p key={user.id} className="text-xs text-gray-600">
                          {user.email}
                        </p>
                      ))}
                      {team.users.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{team.users.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <TeamModal
          title="Create Team"
          onSave={handleCreate}
          onClose={() => setShowCreateModal(false)}
          loading={actionLoading}
        />
      )}

      {/* Edit Modal */}
      {editingTeam && (
        <TeamModal
          title="Edit Team"
          initialName={editingTeam.name}
          onSave={(name) => handleUpdate(editingTeam.id, name)}
          onClose={() => setEditingTeam(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

// Team Modal Component
interface TeamModalProps {
  title: string;
  initialName?: string;
  onSave: (name: string) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

function TeamModal({
  title,
  initialName = "",
  onSave,
  onClose,
  loading = false,
}: TeamModalProps) {
  const [name, setName] = useState(initialName);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSave(name);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter team name"
              required
              disabled={loading}
            />
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
              Save Team
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
