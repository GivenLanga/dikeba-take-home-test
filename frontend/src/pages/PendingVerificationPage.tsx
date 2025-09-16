import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent } from "../components/common/Card";

export function PendingVerificationPage() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full">
        <CardContent className="text-center py-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Account Pending Verification
          </h2>
          <p className="text-gray-600 mb-2">
            Your account ({user?.email}) has been created but is waiting for
            administrator approval.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Please contact your system administrator to activate your account.
          </p>
          <button
            onClick={handleLogout}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Sign out
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
