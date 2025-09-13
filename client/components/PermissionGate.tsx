import { useRBACStore } from '@/stores/rbacStore';
import { Role, Resource, Action } from '@shared/rbac';

interface PermissionGateProps {
  children: React.ReactNode;
  requiredRoles?: Role[];
  requiredPermission?: {
    resource: Resource;
    action: Action;
  };
  fallback?: React.ReactNode;
  invert?: boolean; // Show children when permission is NOT granted
}

export default function PermissionGate({
  children,
  requiredRoles = [],
  requiredPermission,
  fallback = null,
  invert = false
}: PermissionGateProps) {
  const { currentUser, hasPermission } = useRBACStore();

  if (!currentUser) {
    return invert ? <>{children}</> : <>{fallback}</>;
  }

  let hasAccess = true;

  // Check role requirements
  if (requiredRoles.length > 0) {
    hasAccess = requiredRoles.includes(currentUser.role);
  }

  // Check specific permission if required
  if (hasAccess && requiredPermission) {
    hasAccess = hasPermission(
      requiredPermission.resource,
      requiredPermission.action
    );
  }

  // Apply invert logic
  const shouldShow = invert ? !hasAccess : hasAccess;

  return shouldShow ? <>{children}</> : <>{fallback}</>;
}

// Specific permission gates for common use cases
export function AdminOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate 
      requiredRoles={['super_admin', 'admin']} 
      fallback={fallback}
    >
      {children}
    </PermissionGate>
  );
}

export function SuperAdminOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate 
      requiredRoles={['super_admin']} 
      fallback={fallback}
    >
      {children}
    </PermissionGate>
  );
}

export function ManagerAndAbove({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate 
      requiredRoles={['super_admin', 'admin', 'manager']} 
      fallback={fallback}
    >
      {children}
    </PermissionGate>
  );
}

export function CanCreate({ resource, children, fallback }: { 
  resource: Resource; 
  children: React.ReactNode; 
  fallback?: React.ReactNode 
}) {
  return (
    <PermissionGate 
      requiredPermission={{ resource, action: 'create' }} 
      fallback={fallback}
    >
      {children}
    </PermissionGate>
  );
}

export function CanUpdate({ resource, children, fallback }: { 
  resource: Resource; 
  children: React.ReactNode; 
  fallback?: React.ReactNode 
}) {
  return (
    <PermissionGate 
      requiredPermission={{ resource, action: 'update' }} 
      fallback={fallback}
    >
      {children}
    </PermissionGate>
  );
}

export function CanDelete({ resource, children, fallback }: { 
  resource: Resource; 
  children: React.ReactNode; 
  fallback?: React.ReactNode 
}) {
  return (
    <PermissionGate 
      requiredPermission={{ resource, action: 'delete' }} 
      fallback={fallback}
    >
      {children}
    </PermissionGate>
  );
}

export function CanExport({ resource, children, fallback }: { 
  resource: Resource; 
  children: React.ReactNode; 
  fallback?: React.ReactNode 
}) {
  return (
    <PermissionGate 
      requiredPermission={{ resource, action: 'export' }} 
      fallback={fallback}
    >
      {children}
    </PermissionGate>
  );
}

export function CanApprove({ resource, children, fallback }: { 
  resource: Resource; 
  children: React.ReactNode; 
  fallback?: React.ReactNode 
}) {
  return (
    <PermissionGate 
      requiredPermission={{ resource, action: 'approve' }} 
      fallback={fallback}
    >
      {children}
    </PermissionGate>
  );
}
