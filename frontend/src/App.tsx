/* import React from "react"; */
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoutes";
import { Layout } from "./components/layout/Layout";

// Auth pages
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { PendingVerificationPage } from "./pages/PendingVerificationPage";

// Main pages
import { DashboardPage } from "./pages/DashboardPage";
import { UsersPage } from "./pages/UsersPage";
import { TeamsPage } from "./pages/TeamsPage";
import { RolesPage } from "./pages/RolesPage";
import { GroupsPage } from "./pages/GroupsPage";
import { VaultPage } from "./pages/VaultPage";
import { FinancialsPage } from "./pages/FinancialsPage";
import { ReportingPage } from "./pages/ReportingPage";
import AdminPage from "./pages/AdminPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/pending-verification"
            element={<PendingVerificationPage />}
          />

          {/* Protected routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/teams" element={<TeamsPage />} />
                    <Route path="/roles" element={<RolesPage />} />
                    <Route path="/groups" element={<GroupsPage />} />
                    <Route path="/vault" element={<VaultPage />} />
                    <Route path="/financials" element={<FinancialsPage />} />
                    <Route path="/reporting" element={<ReportingPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
