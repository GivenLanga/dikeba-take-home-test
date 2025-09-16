import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/common/Button";
import { Card, CardContent, CardHeader } from "../components/common/Card";
import { api } from "../utils/api";
import { Tenant } from "../types";

export function RegisterPage() {
  const { user, register } = useAuth();
  const [email, setEmail] = useState("");
  const [selectedTenant, setSelectedTenant] = useState("");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingTenants, setFetchingTenants] = useState(true);
  const [fetchTenantsError, setFetchTenantsError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchTenants();
  }, []);

  if (user?.verified) {
    return <Navigate to="/" replace />;
  }

  const fetchTenants = async () => {
    setFetchingTenants(true);
    setFetchTenantsError("");
    try {
      const response = await api.tenants.getAll();
      setTenants(response.tenants);
    } catch (err) {
      setFetchTenantsError(
        "Failed to fetch organizations. Please try again later."
      );
    } finally {
      setFetchingTenants(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !selectedTenant) {
      setError("Please enter your email and select an organization.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register(email, selectedTenant);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Registration Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your account has been created but needs to be verified by an
              administrator before you can log in.
            </p>
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Back to Login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Register for access to the platform
          </p>
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Registration</h3>
          </CardHeader>
          <CardContent>
            {fetchingTenants && (
              <div className="mb-4 flex justify-center">
                <span className="animate-spin h-5 w-5 mr-2 border-2 border-blue-400 border-t-transparent rounded-full"></span>
                Loading organizations...
              </div>
            )}
            {fetchTenantsError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{fetchTenantsError}</p>
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="Enter your email"
                  disabled={loading || fetchingTenants}
                />
              </div>

              <div>
                <label
                  htmlFor="tenant"
                  className="block text-sm font-medium text-gray-700"
                >
                  Organization
                </label>
                <select
                  id="tenant"
                  required
                  value={selectedTenant}
                  onChange={(e) => setSelectedTenant(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  disabled={loading || fetchingTenants || !!fetchTenantsError}
                >
                  <option value="">Select an organization</option>
                  {tenants.length === 0 &&
                    !fetchingTenants &&
                    !fetchTenantsError && (
                      <option value="" disabled>
                        No organizations available. Please contact support.
                      </option>
                    )}
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full"
                disabled={
                  loading ||
                  fetchingTenants ||
                  !!fetchTenantsError ||
                  tenants.length === 0
                }
              >
                Create Account
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
