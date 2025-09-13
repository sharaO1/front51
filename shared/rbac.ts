/**
 * Comprehensive Role-Based Access Control (RBAC) System
 * Defines roles, permissions, and resource access patterns
 */

// Core resource types in the system
export type Resource = 
  | 'users' 
  | 'employees' 
  | 'clients' 
  | 'sales' 
  | 'finance' 
  | 'dashboard' 
  | 'settings'
  | 'reports'
  | 'audit_logs'
  | 'system_config';

// Actions that can be performed on resources
export type Action = 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete' 
  | 'export' 
  | 'import'
  | 'approve'
  | 'reject'
  | 'assign';

// Permission structure
export interface Permission {
  resource: Resource;
  actions: Action[];
  conditions?: PermissionCondition[];
}

// Conditional permissions (e.g., only own records)
export interface PermissionCondition {
  type: 'ownership' | 'department' | 'region' | 'custom';
  value?: string;
}

// System roles with hierarchical structure
export type Role = 
  | 'super_admin'
  | 'admin' 
  | 'manager' 
  | 'team_lead'
  | 'employee' 
  | 'intern'
  | 'viewer';

// User with enhanced role information
export interface RBACUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  permissions: Permission[];
  department?: string;
  region?: string;
  avatar?: string;
  filialId?: string;
  filialName?: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Role definitions with permissions
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: [
    {
      resource: 'users',
      actions: ['create', 'read', 'update', 'delete', 'export', 'import']
    },
    {
      resource: 'employees',
      actions: ['create', 'read', 'update', 'delete', 'export', 'assign']
    },
    {
      resource: 'clients',
      actions: ['create', 'read', 'update', 'delete', 'export', 'import']
    },
    {
      resource: 'sales',
      actions: ['create', 'read', 'update', 'delete', 'export', 'approve', 'reject']
    },
    {
      resource: 'finance',
      actions: ['create', 'read', 'update', 'delete', 'export', 'approve', 'reject']
    },
    {
      resource: 'dashboard',
      actions: ['read']
    },
    {
      resource: 'settings',
      actions: ['create', 'read', 'update', 'delete']
    },
    {
      resource: 'reports',
      actions: ['create', 'read', 'export']
    },
    {
      resource: 'audit_logs',
      actions: ['read', 'export']
    },
    {
      resource: 'system_config',
      actions: ['create', 'read', 'update', 'delete']
    }
  ],

  admin: [
    {
      resource: 'users',
      actions: ['create', 'read', 'update', 'export'],
      conditions: [{ type: 'department' }]
    },
    {
      resource: 'employees',
      actions: ['create', 'read', 'update', 'delete', 'assign']
    },
    {
      resource: 'clients',
      actions: ['create', 'read', 'update', 'delete', 'export']
    },
    {
      resource: 'sales',
      actions: ['create', 'read', 'update', 'delete', 'export', 'approve']
    },
    {
      resource: 'finance',
      actions: ['read', 'update', 'export', 'approve']
    },
    {
      resource: 'dashboard',
      actions: ['read']
    },
    {
      resource: 'settings',
      actions: ['read', 'update']
    },
    {
      resource: 'reports',
      actions: ['create', 'read', 'export']
    }
  ],

  manager: [
    {
      resource: 'employees',
      actions: ['read', 'update', 'assign'],
      conditions: [{ type: 'department' }]
    },
    {
      resource: 'clients',
      actions: ['create', 'read', 'update', 'export']
    },
    {
      resource: 'sales',
      actions: ['create', 'read', 'update', 'export', 'approve']
    },
    {
      resource: 'finance',
      actions: ['read', 'export']
    },
    {
      resource: 'dashboard',
      actions: ['read']
    },
    {
      resource: 'reports',
      actions: ['read', 'export']
    }
  ],

  team_lead: [
    {
      resource: 'employees',
      actions: ['read'],
      conditions: [{ type: 'department' }]
    },
    {
      resource: 'clients',
      actions: ['create', 'read', 'update']
    },
    {
      resource: 'sales',
      actions: ['create', 'read', 'update']
    },
    {
      resource: 'dashboard',
      actions: ['read']
    },
    {
      resource: 'reports',
      actions: ['read']
    }
  ],

  employee: [
    {
      resource: 'clients',
      actions: ['read', 'update'],
      conditions: [{ type: 'ownership' }]
    },
    {
      resource: 'sales',
      actions: ['create', 'read', 'update'],
      conditions: [{ type: 'ownership' }]
    },
    {
      resource: 'dashboard',
      actions: ['read']
    }
  ],

  intern: [
    {
      resource: 'clients',
      actions: ['read']
    },
    {
      resource: 'dashboard',
      actions: ['read']
    }
  ],

  viewer: [
    {
      resource: 'dashboard',
      actions: ['read']
    }
  ]
};

// Role hierarchy for inheritance
export const ROLE_HIERARCHY: Record<Role, Role[]> = {
  super_admin: ['admin', 'manager', 'team_lead', 'employee', 'intern', 'viewer'],
  admin: ['manager', 'team_lead', 'employee', 'intern', 'viewer'],
  manager: ['team_lead', 'employee', 'intern', 'viewer'],
  team_lead: ['employee', 'intern', 'viewer'],
  employee: ['intern', 'viewer'],
  intern: ['viewer'],
  viewer: []
};

// Helper functions for permission checking
export function hasPermission(
  userRole: Role, 
  resource: Resource, 
  action: Action,
  context?: { userId?: string; department?: string; region?: string }
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  
  for (const permission of rolePermissions) {
    if (permission.resource === resource && permission.actions.includes(action)) {
      // Check conditions if any
      if (permission.conditions && context) {
        return evaluateConditions(permission.conditions, context);
      }
      return true;
    }
  }
  
  return false;
}

function evaluateConditions(
  conditions: PermissionCondition[], 
  context: { userId?: string; department?: string; region?: string }
): boolean {
  return conditions.every(condition => {
    switch (condition.type) {
      case 'ownership':
        return true; // Implement ownership logic based on your data model
      case 'department':
        return condition.value ? context.department === condition.value : true;
      case 'region':
        return condition.value ? context.region === condition.value : true;
      default:
        return true;
    }
  });
}

export function canAccessResource(userRole: Role, resource: Resource): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return rolePermissions.some(permission => permission.resource === resource);
}

export function getAllowedActions(userRole: Role, resource: Resource): Action[] {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  const permission = rolePermissions.find(p => p.resource === resource);
  return permission ? permission.actions : [];
}

export function isHigherRole(role1: Role, role2: Role): boolean {
  return ROLE_HIERARCHY[role1]?.includes(role2) || false;
}

// Navigation permissions for UI
export interface NavPermission {
  path: string;
  requiredRole: Role[];
  requiredPermission?: { resource: Resource; action: Action };
}

export const NAVIGATION_PERMISSIONS: NavPermission[] = [
  {
    path: '/dashboard',
    requiredRole: ['super_admin', 'admin', 'manager', 'team_lead', 'employee', 'intern', 'viewer'],
    requiredPermission: { resource: 'dashboard', action: 'read' }
  },
  {
    path: '/filials',
    requiredRole: ['super_admin', 'admin']
  },
  {
    path: '/employees',
    requiredRole: ['super_admin', 'admin', 'manager', 'team_lead'],
    requiredPermission: { resource: 'employees', action: 'read' }
  },
  {
    path: '/clients',
    requiredRole: ['super_admin', 'admin', 'manager', 'team_lead', 'employee', 'intern'],
    requiredPermission: { resource: 'clients', action: 'read' }
  },
  {
    path: '/sales',
    requiredRole: ['super_admin', 'admin', 'manager', 'team_lead', 'employee'],
    requiredPermission: { resource: 'sales', action: 'read' }
  },
  {
    path: '/finance',
    requiredRole: ['super_admin', 'admin', 'manager'],
    requiredPermission: { resource: 'finance', action: 'read' }
  },
  {
    path: '/settings',
    requiredRole: ['super_admin', 'admin'],
    requiredPermission: { resource: 'settings', action: 'read' }
  },
  {
    path: '/admin/users',
    requiredRole: ['super_admin', 'admin'],
    requiredPermission: { resource: 'users', action: 'read' }
  }
];
