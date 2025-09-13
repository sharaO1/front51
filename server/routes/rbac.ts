import { RequestHandler } from 'express';
import { createProtectedHandler, validateRoleChange } from '../middleware/rbac';
import { Role, RBACUser, ROLE_PERMISSIONS, ROLE_HIERARCHY } from '@shared/rbac';

// Mock database - in production, use a real database
const mockUsers: RBACUser[] = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'System Admin',
    role: 'super_admin',
    permissions: ROLE_PERMISSIONS.super_admin,
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    email: 'manager@example.com',
    name: 'Department Manager',
    role: 'manager',
    permissions: ROLE_PERMISSIONS.manager,
    department: 'Sales',
    status: 'active',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    email: 'employee@example.com',
    name: 'Team Member',
    role: 'employee',
    permissions: ROLE_PERMISSIONS.employee,
    department: 'Sales',
    status: 'active',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-25'),
  }
];

// Get all users (admin only)
export const getUsers: RequestHandler[] = [
  ...createProtectedHandler({
    permission: { resource: 'users', action: 'read' },
    rateLimit: { super_admin: 1000, admin: 500, manager: 100 }
  }),
  (req, res) => {
    try {
      // Filter users based on role hierarchy
      let filteredUsers = mockUsers;
      
      if (req.user) {
        const allowedRoles = ROLE_HIERARCHY[req.user.role] || [];
        allowedRoles.push(req.user.role); // Include same role
        
        filteredUsers = mockUsers.filter(user => 
          allowedRoles.includes(user.role)
        );
      }

      res.json({
        success: true,
        data: filteredUsers,
        total: filteredUsers.length
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to fetch users',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
];

// Get user by ID
export const getUserById: RequestHandler[] = [
  ...createProtectedHandler({
    permission: { resource: 'users', action: 'read' }
  }),
  (req, res) => {
    try {
      const { id } = req.params;
      const user = mockUsers.find(u => u.id === id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if current user can view this user
      if (req.user) {
        const allowedRoles = ROLE_HIERARCHY[req.user.role] || [];
        allowedRoles.push(req.user.role);
        
        if (!allowedRoles.includes(user.role)) {
          return res.status(403).json({ error: 'Insufficient permissions to view this user' });
        }
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to fetch user',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
];

// Update user role
export const updateUserRole: RequestHandler[] = [
  ...createProtectedHandler({
    permission: { resource: 'users', action: 'update' }
  }),
  (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role || !Object.keys(ROLE_PERMISSIONS).includes(role)) {
        return res.status(400).json({ error: 'Invalid role provided' });
      }

      const userIndex = mockUsers.findIndex(u => u.id === id);
      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
      }

      const targetUser = mockUsers[userIndex];
      
      // Validate role change
      if (req.user && !validateRoleChange(req.user.role, role as Role, id, req.user.id)) {
        return res.status(403).json({ 
          error: 'Cannot change role - insufficient permissions or invalid operation' 
        });
      }

      // Update user
      mockUsers[userIndex] = {
        ...targetUser,
        role: role as Role,
        permissions: ROLE_PERMISSIONS[role as Role],
        updatedAt: new Date()
      };

      res.json({
        success: true,
        data: mockUsers[userIndex],
        message: `User role updated to ${role}`
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to update user role',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
];

// Update user status
export const updateUserStatus: RequestHandler[] = [
  ...createProtectedHandler({
    permission: { resource: 'users', action: 'update' }
  }),
  (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['active', 'inactive', 'suspended'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status provided' });
      }

      const userIndex = mockUsers.findIndex(u => u.id === id);
      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Can't change your own status
      if (req.user && req.user.id === id) {
        return res.status(403).json({ error: 'Cannot change your own status' });
      }

      // Update user
      mockUsers[userIndex] = {
        ...mockUsers[userIndex],
        status: status as 'active' | 'inactive' | 'suspended',
        updatedAt: new Date()
      };

      res.json({
        success: true,
        data: mockUsers[userIndex],
        message: `User status updated to ${status}`
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to update user status',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
];

// Get role permissions
export const getRolePermissions: RequestHandler[] = [
  ...createProtectedHandler({
    roles: ['super_admin', 'admin']
  }),
  (req, res) => {
    try {
      const { role } = req.params;

      if (!role || !Object.keys(ROLE_PERMISSIONS).includes(role)) {
        return res.status(400).json({ error: 'Invalid role provided' });
      }

      res.json({
        success: true,
        data: {
          role: role as Role,
          permissions: ROLE_PERMISSIONS[role as Role],
          hierarchy: ROLE_HIERARCHY[role as Role] || []
        }
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to fetch role permissions',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
];

// Get all roles and their permissions
export const getAllRoles: RequestHandler[] = [
  ...createProtectedHandler({
    roles: ['super_admin', 'admin']
  }),
  (req, res) => {
    try {
      const rolesData = Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => ({
        role: role as Role,
        permissions,
        hierarchy: ROLE_HIERARCHY[role as Role] || [],
        label: role.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
      }));

      res.json({
        success: true,
        data: rolesData
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to fetch roles',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
];

// Check user permissions
export const checkPermissions: RequestHandler[] = [
  ...createProtectedHandler({}), // Just require authentication
  (req, res) => {
    try {
      const { resource, action } = req.query;

      if (!resource || !action) {
        return res.status(400).json({ error: 'Resource and action parameters required' });
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userPermissions = ROLE_PERMISSIONS[req.user.role];
      const hasAccess = userPermissions.some(permission => 
        permission.resource === resource && 
        permission.actions.includes(action as any)
      );

      res.json({
        success: true,
        data: {
          hasPermission: hasAccess,
          userRole: req.user.role,
          resource,
          action
        }
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to check permissions',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
];

// Get audit logs
export const getAuditLogs: RequestHandler[] = [
  ...createProtectedHandler({
    permission: { resource: 'audit_logs', action: 'read' }
  }),
  (req, res) => {
    try {
      // Mock audit logs
      const auditLogs = [
        {
          id: '1',
          userId: '1',
          action: 'login',
          resource: 'auth',
          timestamp: new Date().toISOString(),
          details: { success: true },
          ipAddress: '127.0.0.1'
        },
        {
          id: '2',
          userId: '2',
          action: 'update_user_role',
          resource: 'users',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          details: { targetUserId: '3', newRole: 'employee' },
          ipAddress: '127.0.0.1'
        }
      ];

      res.json({
        success: true,
        data: auditLogs,
        total: auditLogs.length
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to fetch audit logs',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
];
