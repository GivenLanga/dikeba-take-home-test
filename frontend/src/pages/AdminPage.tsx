import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "../components/common/Card";
import { Users, Users2, Shield, Layers } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="w-6 h-6 mr-2 text-blue-600" />
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Manage users, teams, and groups from one place.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 mt-4">
            <Link
              to="/users"
              className="block p-4 rounded-lg border border-gray-200 bg-white hover:bg-blue-50 transition flex items-center"
            >
              <Users className="w-5 h-5 mr-3 text-blue-500" />
              <span className="font-medium text-gray-900">User Management</span>
            </Link>
            <Link
              to="/teams"
              className="block p-4 rounded-lg border border-gray-200 bg-white hover:bg-blue-50 transition flex items-center"
            >
              <Users2 className="w-5 h-5 mr-3 text-green-500" />
              <span className="font-medium text-gray-900">Team Management</span>
            </Link>
            <Link
              to="/groups"
              className="block p-4 rounded-lg border border-gray-200 bg-white hover:bg-blue-50 transition flex items-center"
            >
              <Layers className="w-5 h-5 mr-3 text-purple-500" />
              <span className="font-medium text-gray-900">
                Group Management
              </span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
