import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import { PermissionGate } from "../components/auth/PermissionGate";
import { Card, CardContent, CardHeader } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { LoadingSpinner } from "../components/common/LaodingSpinner";
import { api } from "../utils/api";
import { Report } from "../types";
import { FileText, Plus, Edit2, Trash2 } from "lucide-react";

export function ReportingPage() {
  const { user } = useAuth();
  const { can } = usePermissions();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);

  useEffect(() => {
    if (user?.teamId && can("reporting", "read")) {
      fetchReports();
    }
  }, [user?.teamId, can]);

  const fetchReports = async () => {
    if (!user?.teamId) return;

    setLoading(true);
    try {
      const response = await api.reporting.getAll(user.teamId);
      setReports(response.reports);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (title: string, content: string) => {
    if (!user?.teamId) return;

    try {
      await api.reporting.create(title, content, user.teamId);
      await fetchReports();
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create report:", error);
    }
  };

  const handleUpdate = async (id: string, title: string, content: string) => {
    try {
      await api.reporting.update(id, { title, content });
      await fetchReports();
      setEditingReport(null);
    } catch (error) {
      console.error("Failed to update report:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;

    try {
      await api.reporting.delete(id);
      await fetchReports();
    } catch (error) {
      console.error("Failed to delete report:", error);
    }
  };

  if (!can("reporting", "read")) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Access Denied
        </h2>
        <p className="text-gray-600">
          You don't have permission to access the Reporting module.
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
            <FileText className="w-6 h-6 mr-2" />
            Reporting
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage reports
          </p>
        </div>

        <PermissionGate module="reporting" permission="create">
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Report
          </Button>
        </PermissionGate>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : reports.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No reports found</p>
          </div>
        ) : (
          reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">
                      {report.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <PermissionGate module="reporting" permission="update">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditingReport(report)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </PermissionGate>

                    <PermissionGate module="reporting" permission="delete">
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(report.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </PermissionGate>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {report.content}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <ReportModal
          title="Create Report"
          onSave={handleCreate}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Modal */}
      {editingReport && (
        <ReportModal
          title="Edit Report"
          initialTitle={editingReport.title}
          initialContent={editingReport.content}
          onSave={(title, content) =>
            handleUpdate(editingReport.id, title, content)
          }
          onClose={() => setEditingReport(null)}
        />
      )}
    </div>
  );
}

// Report Modal Component
interface ReportModalProps {
  title: string;
  initialTitle?: string;
  initialContent?: string;
  onSave: (title: string, content: string) => Promise<void>;
  onClose: () => void;
}

function ReportModal({
  title,
  initialTitle = "",
  initialContent = "",
  onSave,
  onClose,
}: ReportModalProps) {
  const [reportTitle, setReportTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle || !content) return;

    setLoading(true);
    try {
      await onSave(reportTitle, content);
    } catch (error) {
      console.error("Failed to save report:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Report title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Report content"
              rows={10}
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
              Save Report
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
