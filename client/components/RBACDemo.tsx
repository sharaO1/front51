import { useState } from 'react';
import { useRBACStore } from '@/stores/rbacStore';
import { useAuthStore } from '@/stores/authStore';
import { Role, Resource, Action } from '@shared/rbac';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import RoleBadge, { RoleSelector } from '@/components/ui/role-badge';
import PermissionGate, { AdminOnly, CanCreate, CanUpdate, CanDelete } from '@/components/PermissionGate';
import PermissionDisplay from '@/components/ui/permission-display';
import { usePermissionCheck } from '@/components/RoleProtectedRoute';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  UserCheck,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function RBACDemo() {
  const { currentUser, hasPermission } = useRBACStore();
  const { updateUserRole } = useAuthStore();
  const { toast } = useToast();
  const { isAdmin, isSuperAdmin } = usePermissionCheck();
  const [demoResource, setDemoResource] = useState<Resource>('clients');
  
  if (!currentUser) return null;

  const testPermissions = [
    { resource: 'clients' as Resource, action: 'read' as Action, label: 'View Clients' },
    { resource: 'clients' as Resource, action: 'create' as Action, label: 'Create Clients' },
    { resource: 'clients' as Resource, action: 'update' as Action, label: 'Update Clients' },
    { resource: 'clients' as Resource, action: 'delete' as Action, label: 'Delete Clients' },
    { resource: 'finance' as Resource, action: 'read' as Action, label: 'View Finance' },
    { resource: 'users' as Resource, action: 'read' as Action, label: 'Manage Users' },
    { resource: 'settings' as Resource, action: 'update' as Action, label: 'System Settings' },
  ];

  const simulateRoleChange = (newRole: Role) => {
    updateUserRole(newRole);
    toast({
      title: 'Role Changed (Demo)',
      description: `Your role has been temporarily changed to ${newRole.replace('_', ' ')} for demonstration purposes.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">RBAC System Demo</h2>
        <p className="text-muted-foreground mb-4">
          This demo shows how the Role-Based Access Control system works in real-time. User accounts are managed exclusively by administrators for enhanced security.
        </p>
      </div>

      {/* Current User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Current User & Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="text-lg font-semibold">{currentUser.name}</div>
                <RoleBadge role={currentUser.role} />
              </div>
              <div className="text-sm text-muted-foreground">{currentUser.email}</div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Admin Status:</span>
                {isAdmin() ? (
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <XCircle className="h-3 w-3 mr-1" />
                    Non-Admin
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Try Different Roles:</div>
              <div className="flex flex-wrap gap-2">
                {(['super_admin', 'admin', 'manager', 'employee', 'viewer'] as Role[]).map(role => (
                  <Button
                    key={role}
                    variant={currentUser.role === role ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => simulateRoleChange(role)}
                    className="capitalize"
                  >
                    {role.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permission Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permission Testing
          </CardTitle>
          <CardDescription>
            See what actions your current role can perform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testPermissions.map(({ resource, action, label }) => {
              const hasAccess = hasPermission(resource, action);
              return (
                <div
                  key={`${resource}-${action}`}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    hasAccess 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{label}</span>
                    {hasAccess ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {resource} • {action}
                  </div>
                  <Badge 
                    variant="outline" 
                    className={hasAccess ? 'border-green-300 text-green-700' : 'border-red-300 text-red-700'}
                  >
                    {hasAccess ? 'Allowed' : 'Denied'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* UI Component Visibility Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            UI Component Visibility
          </CardTitle>
          <CardDescription>
            See how UI components show/hide based on permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Admin Only Section */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Admin-Only Content</h4>
              <AdminOnly 
                fallback={
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span>This content is only visible to admins</span>
                  </div>
                }
              >
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span>🎉 You can see this because you're an admin!</span>
                </div>
              </AdminOnly>
            </div>

            {/* Permission-based buttons */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Action Buttons (Based on Permissions)</h4>
              <div className="flex gap-2 flex-wrap">
                <CanCreate resource="clients">
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Client
                  </Button>
                </CanCreate>
                
                <CanUpdate resource="clients">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Client
                  </Button>
                </CanUpdate>
                
                <CanDelete resource="clients">
                  <Button variant="destructive" className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Client
                  </Button>
                </CanDelete>

                <PermissionGate
                  requiredPermission={{ resource: 'finance', action: 'read' }}
                  fallback={
                    <Button disabled variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Finance (No Access)
                    </Button>
                  }
                >
                  <Button variant="secondary" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    View Finance
                  </Button>
                </PermissionGate>
              </div>
            </div>

            {/* Role-based features */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Role-Based Features</h4>
              <div className="space-y-2">
                <PermissionGate
                  requiredRoles={['super_admin']}
                  fallback={<span className="text-muted-foreground">• System Configuration (Super Admin only)</span>}
                >
                  <span className="text-green-700">• ✅ System Configuration Access</span>
                </PermissionGate>
                
                <PermissionGate
                  requiredRoles={['super_admin', 'admin']}
                  fallback={<span className="text-muted-foreground">• User Management (Admin+ only)</span>}
                >
                  <span className="text-green-700">• ✅ User Management Access</span>
                </PermissionGate>
                
                <PermissionGate
                  requiredRoles={['super_admin', 'admin', 'manager']}
                  fallback={<span className="text-muted-foreground">• Team Oversight (Manager+ only)</span>}
                >
                  <span className="text-green-700">• ✅ Team Oversight Access</span>
                </PermissionGate>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Your Current Permissions
          </CardTitle>
          <CardDescription>
            Complete list of what your current role can access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PermissionDisplay permissions={currentUser.permissions} />
        </CardContent>
      </Card>
    </div>
  );
}
