import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster as AppToaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import Warehouse from "./pages/Warehouse";
import Filials from "./pages/Filials";
import Clients from "./pages/Clients";
import Sales from "./pages/Sales";
import Finance from "./pages/Finance";
import Employees from "./pages/Employees";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import NotFound from "./pages/NotFound";
import { useThemeStore } from "./stores/themeStore";
import { useAuthStore } from "./stores/authStore";
import { useRBACStore } from "./stores/rbacStore";
import { useEffect } from "react";
import {
  suppressDefaultPropsWarnings,
  suppressResizeObserverErrors,
} from "./lib/suppressWarnings";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import Chat from "./pages/Chat";

const App = () => {
  const { theme, setTheme } = useThemeStore();
  const { isAuthenticated, user } = useAuthStore();
  const { initializeFromAuth } = useRBACStore();

  useEffect(() => {
    // Initialize theme on app load
    setTheme(theme);

    // Initialize RBAC when user is available
    if (user) {
      initializeFromAuth(user);
    }

    // Suppress React defaultProps warnings from recharts library
    // This is a temporary fix until the library fully migrates to JavaScript default parameters
    suppressDefaultPropsWarnings();
    suppressResizeObserverErrors();
  }, [user, initializeFromAuth]);

  return (
    <TooltipProvider>
      <AppToaster />
      <Sonner />
      <PWAInstallPrompt />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route
            path="/auth/login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
          />

          {/* Full-screen chat route (independent of dashboard layout) */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/auth/forgot-password"
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <ForgotPassword />
            }
          />

          {/* Protected routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route
                      path="/"
                      element={<Navigate to="/dashboard" replace />}
                    />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/warehouse" element={<Warehouse />} />
                    <Route
                      path="/filials"
                      element={
                        <RoleProtectedRoute requiredRoles={["super_admin", "admin"]}>
                          <Filials />
                        </RoleProtectedRoute>
                      }
                    />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/sales" element={<Sales />} />
                    <Route path="/finance" element={<Finance />} />
                    <Route path="/employees" element={<Employees />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />

                    {/* Admin-only routes */}
                    <Route
                      path="/admin/users"
                      element={
                        <RoleProtectedRoute
                          requiredRoles={["super_admin", "admin"]}
                          requiredPermission={{
                            resource: "users",
                            action: "read",
                          }}
                        >
                          <UserManagement />
                        </RoleProtectedRoute>
                      }
                    />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
