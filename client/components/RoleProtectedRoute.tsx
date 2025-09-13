import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useRBACStore } from '@/stores/rbacStore';
import { Role, Resource, Action } from '@shared/rbac';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Role[];
  requiredPermission?: {
    resource: Resource;
    action: Action;
  };
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export default function RoleProtectedRoute({
  children,
  requiredRoles = [],
  requiredPermission,
  fallback,
  redirectTo = '/dashboard'
}: RoleProtectedRouteProps) {
  const { isAuthenticated } = useAuthStore();
  const { currentUser, hasPermission } = useRBACStore();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = () => {
      setIsChecking(true);

      // Must be authenticated
      if (!isAuthenticated || !currentUser) {
        navigate('/auth/login', { replace: true });
        return;
      }

      let accessGranted = true;

      // Check role requirements
      if (requiredRoles.length > 0) {
        accessGranted = requiredRoles.includes(currentUser.role);
      }

      // Check specific permission if required
      if (accessGranted && requiredPermission) {
        accessGranted = hasPermission(
          requiredPermission.resource,
          requiredPermission.action
        );
      }

      setHasAccess(accessGranted);
      setIsChecking(false);
    };

    checkAccess();
  }, [isAuthenticated, currentUser, requiredRoles, requiredPermission, hasPermission, navigate]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show access denied if no permission
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Alert className="border-destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription className="mt-2">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-destructive mb-2">Access Denied</h3>
                <p className="text-sm text-muted-foreground">
                  You don't have the required permissions to access this page.
                </p>
                {requiredRoles.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Required roles: {requiredRoles.join(', ')}
                  </p>
                )}
                {requiredPermission && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Required permission: {requiredPermission.action} on {requiredPermission.resource}
                  </p>
                )}
                {currentUser && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Your current role: {currentUser.role}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Go Back
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate(redirectTo)}
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}

// Higher-order component for easier usage
export function withRoleProtection<P extends object>(
  Component: React.ComponentType<P>,
  protection: Omit<RoleProtectedRouteProps, 'children'>
) {
  return function ProtectedComponent(props: P) {
    return (
      <RoleProtectedRoute {...protection}>
        <Component {...props} />
      </RoleProtectedRoute>
    );
  };
}

// Hook for checking permissions in components
export function usePermissionCheck() {
  const { currentUser, hasPermission, canAccessResource, getAllowedActions } = useRBACStore();

  return {
    currentUser,
    hasPermission,
    canAccessResource,
    getAllowedActions,
    hasRole: (role: Role) => currentUser?.role === role,
    hasAnyRole: (roles: Role[]) => currentUser ? roles.includes(currentUser.role) : false,
    isAdmin: () => currentUser?.role === 'admin' || currentUser?.role === 'super_admin',
    isSuperAdmin: () => currentUser?.role === 'super_admin'
  };
}
