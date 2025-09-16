import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import { PermissionGate } from "../components/auth/PermissionGate";
import { Card, CardContent, CardHeader } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { LoadingSpinner } from "../components/common/LaodingSpinner";
import { api } from "../utils/api";
import { Transaction } from "../types";
import { DollarSign, Plus, Edit2, Trash2 } from "lucide-react";

export function FinancialsPage() {
  const { user } = useAuth();
  const { can } = usePermissions();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  useEffect(() => {
    if (user?.teamId && can("financials", "read")) {
      fetchTransactions();
    }
  }, [user?.teamId, can]);

  const fetchTransactions = async () => {
    if (!user?.teamId) return;

    setLoading(true);
    try {
      const response = await api.financials.getAll(user.teamId);
      setTransactions(response.transactions);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (amount: number, description: string) => {
    if (!user?.teamId) return;

    try {
      await api.financials.create(amount, description, user.teamId);
      await fetchTransactions();
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create transaction:", error);
    }
  };

  const handleUpdate = async (
    id: string,
    amount: number,
    description: string
  ) => {
    try {
      await api.financials.update(id, { amount, description });
      await fetchTransactions();
      setEditingTransaction(null);
    } catch (error) {
      console.error("Failed to update transaction:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
      await api.financials.delete(id);
      await fetchTransactions();
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  if (!can("financials", "read")) {
    return (
      <div className="text-center py-12">
        <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Access Denied
        </h2>
        <p className="text-gray-600">
          You don't have permission to access the Financials module.
        </p>
      </div>
    );
  }

  const totalAmount = transactions.reduce(
    (sum, t) => sum + Number(t.amount),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <DollarSign className="w-6 h-6 mr-2" />
            Financials
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track financial transactions and data
          </p>
        </div>

        <PermissionGate module="financials" permission="create">
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </PermissionGate>
      </div>

      {/* Summary Card */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">Total Amount</p>
            <p
              className={`text-3xl font-bold ${
                totalAmount >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ${totalAmount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {transactions.length} transaction
              {transactions.length !== 1 ? "s" : ""}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Transactions</h2>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span
                          className={`text-lg font-semibold ${
                            Number(transaction.amount) >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          ${Number(transaction.amount).toLocaleString()}
                        </span>
                        <span className="text-gray-600">
                          {transaction.description}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <PermissionGate module="financials" permission="update">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setEditingTransaction(transaction)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </PermissionGate>

                      <PermissionGate module="financials" permission="delete">
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(transaction.id)}
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
        <TransactionModal
          title="Add Transaction"
          onSave={handleCreate}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Modal */}
      {editingTransaction && (
        <TransactionModal
          title="Edit Transaction"
          initialAmount={Number(editingTransaction.amount)}
          initialDescription={editingTransaction.description}
          onSave={(amount, description) =>
            handleUpdate(editingTransaction.id, amount, description)
          }
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </div>
  );
}

// Transaction Modal Component
interface TransactionModalProps {
  title: string;
  initialAmount?: number;
  initialDescription?: string;
  onSave: (amount: number, description: string) => Promise<void>;
  onClose: () => void;
}

function TransactionModal({
  title,
  initialAmount = 0,
  initialDescription = "",
  onSave,
  onClose,
}: TransactionModalProps) {
  const [amount, setAmount] = useState(initialAmount.toString());
  const [description, setDescription] = useState(initialDescription);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    setLoading(true);
    try {
      await onSave(parseFloat(amount), description);
    } catch (error) {
      console.error("Failed to save transaction:", error);
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
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
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
              placeholder="Transaction description"
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
