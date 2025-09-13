import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Permission, Resource, Action, Role, ROLE_PERMISSIONS } from '@shared/rbac';
import { 
  ChevronDown, 
  ChevronRight, 
  Shield, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Download, 
  Upload,
  Check,
  X
} from 'lucide-react';

interface PermissionDisplayProps {
  permissions: Permission[];
  className?: string;
  compact?: boolean;
}

const actionIcons: Record<Action, typeof Eye> = {
  read: Eye,
  create: Plus,
  update: Edit,
  delete: Trash2,
  export: Download,
  import: Upload,
  approve: Check,
  reject: X,
  assign: Shield
};

const actionColors: Record<Action, string> = {
  read: 'bg-blue-100 text-blue-700 border-blue-300',
  create: 'bg-green-100 text-green-700 border-green-300',
  update: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  delete: 'bg-red-100 text-red-700 border-red-300',
  export: 'bg-purple-100 text-purple-700 border-purple-300',
  import: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  approve: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  reject: 'bg-orange-100 text-orange-700 border-orange-300',
  assign: 'bg-teal-100 text-teal-700 border-teal-300'
};

const resourceLabels: Record<Resource, string> = {
  users: 'User Management',
  employees: 'Employee Management',
  clients: 'Client Management',
  sales: 'Sales Management',
  finance: 'Financial Management',
  dashboard: 'Dashboard Access',
  settings: 'System Settings',
  reports: 'Reports & Analytics',
  audit_logs: 'Audit Logs',
  system_config: 'System Configuration'
};

export default function PermissionDisplay({ 
  permissions, 
  className,
  compact = false 
}: PermissionDisplayProps) {
  const [expandedResources, setExpandedResources] = useState<Set<Resource>>(new Set());

  const toggleResource = (resource: Resource) => {
    const newExpanded = new Set(expandedResources);
    if (newExpanded.has(resource)) {
      newExpanded.delete(resource);
    } else {
      newExpanded.add(resource);
    }
    setExpandedResources(newExpanded);
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<Resource, Permission[]>);

  if (compact) {
    return (
      <div className={cn('space-y-2', className)}>
        {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
          <div key={resource} className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="font-medium">
              {resourceLabels[resource as Resource]}
            </Badge>
            <div className="flex gap-1 flex-wrap">
              {resourcePermissions.flatMap(p => p.actions).map((action, index) => {
                const Icon = actionIcons[action];
                return (
                  <Badge 
                    key={`${action}-${index}`} 
                    variant="outline" 
                    className={cn('text-xs', actionColors[action])}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {action}
                  </Badge>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => {
        const isExpanded = expandedResources.has(resource as Resource);
        const allActions = resourcePermissions.flatMap(p => p.actions);
        
        return (
          <Card key={resource} className="border-l-4 border-l-primary">
            <Collapsible>
              <CollapsibleTrigger 
                className="w-full"
                onClick={() => toggleResource(resource as Resource)}
              >
                <CardHeader className="pb-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <CardTitle className="text-sm font-medium">
                        {resourceLabels[resource as Resource]}
                      </CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {allActions.length} permissions
                    </Badge>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {allActions.map((action, index) => {
                      const Icon = actionIcons[action];
                      return (
                        <Badge 
                          key={`${action}-${index}`} 
                          variant="outline" 
                          className={cn(
                            'justify-start p-2 h-auto',
                            actionColors[action]
                          )}
                        >
                          <Icon className="h-3 w-3 mr-2" />
                          <span className="capitalize">{action}</span>
                        </Badge>
                      );
                    })}
                  </div>
                  
                  {resourcePermissions.some(p => p.conditions) && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Conditions:</p>
                      {resourcePermissions.map((permission, index) => 
                        permission.conditions?.map((condition, condIndex) => (
                          <Badge 
                            key={`${index}-${condIndex}`} 
                            variant="outline" 
                            className="mr-2 mb-1 text-xs"
                          >
                            {condition.type}: {condition.value || 'applies'}
                          </Badge>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}

// Role comparison component
interface RoleComparisonProps {
  roles: Role[];
  className?: string;
}

export function RoleComparison({ roles, className }: RoleComparisonProps) {
  const [selectedRoles, setSelectedRoles] = useState<Set<Role>>(new Set(roles.slice(0, 2)));

  const toggleRole = (role: Role) => {
    const newSelected = new Set(selectedRoles);
    if (newSelected.has(role)) {
      newSelected.delete(role);
    } else {
      newSelected.add(role);
    }
    setSelectedRoles(newSelected);
  };

  const allResources = Array.from(new Set(
    Object.values(ROLE_PERMISSIONS)
      .flat()
      .map(p => p.resource)
  ));

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex gap-2 flex-wrap">
        {roles.map(role => (
          <Button
            key={role}
            variant={selectedRoles.has(role) ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleRole(role)}
            className="capitalize"
          >
            {role.replace('_', ' ')}
          </Button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border">
          <thead>
            <tr>
              <th className="border border-border p-2 text-left bg-muted">Resource</th>
              {Array.from(selectedRoles).map(role => (
                <th key={role} className="border border-border p-2 text-center bg-muted capitalize">
                  {role.replace('_', ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allResources.map(resource => (
              <tr key={resource}>
                <td className="border border-border p-2 font-medium">
                  {resourceLabels[resource]}
                </td>
                {Array.from(selectedRoles).map(role => {
                  const permissions = ROLE_PERMISSIONS[role];
                  const resourcePermission = permissions.find(p => p.resource === resource);
                  
                  return (
                    <td key={role} className="border border-border p-2 text-center">
                      {resourcePermission ? (
                        <div className="flex flex-wrap gap-1 justify-center">
                          {resourcePermission.actions.map(action => {
                            const Icon = actionIcons[action];
                            return (
                              <Badge 
                                key={action} 
                                variant="outline" 
                                className={cn('text-xs', actionColors[action])}
                              >
                                <Icon className="h-2 w-2 mr-1" />
                                {action}
                              </Badge>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">No access</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
