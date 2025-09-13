import { RequestHandler } from 'express';
import { Role, Resource, Action, hasPermission, isHigherRole } from '@shared/rbac';

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
        department?: string;
        region?: string;
      };
    }
  }
}

// JWT verification middleware (mock implementation)
export const authenticateToken: RequestHandler = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // In a real implementation, verify JWT token here
    // For demo purposes, we'll decode a mock token
    const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    
    req.user = {
      id: decoded.sub || decoded.userId,
      email: decoded.email,
      role: decoded.role as Role,
      department: decoded.department,
      region: decoded.region
    };

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Role-based authorization middleware
export function requireRole(...roles: Role[]): RequestHandler {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
}

// Permission-based authorization middleware
export function requirePermission(resource: Resource, action: Action): RequestHandler {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const context = {
      userId: req.user.id,
      department: req.user.department,
      region: req.user.region
    };

    if (!hasPermission(req.user.role, resource, action, context)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: { resource, action },
        role: req.user.role
      });
    }

    next();
  };
}

// Resource ownership validation
export function requireOwnership(resourceIdParam: string = 'id'): RequestHandler {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const resourceId = req.params[resourceIdParam];
    const userId = req.user.id;

    // This is a simplified example - in real implementation,
    // you'd query the database to check ownership
    if (resourceId !== userId && !isHigherRole(req.user.role, 'employee')) {
      return res.status(403).json({ 
        error: 'Access denied - resource ownership required' 
      });
    }

    next();
  };
}

// Department-based access control
export function requireSameDepartment(): RequestHandler {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Skip department check for admin and above
    if (isHigherRole(req.user.role, 'manager')) {
      return next();
    }

    // In a real implementation, you'd check if the requested resource
    // belongs to the same department as the user
    // For now, we'll just pass through
    next();
  };
}

// Audit logging middleware
export const auditLogger: RequestHandler = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log the action after response
    if (req.user) {
      const auditData = {
        userId: req.user.id,
        userRole: req.user.role,
        action: req.method,
        resource: req.path,
        timestamp: new Date().toISOString(),
        statusCode: res.statusCode,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      };

      console.log('AUDIT:', JSON.stringify(auditData));
      // In production, save to database
    }

    return originalSend.call(this, data);
  };

  next();
};

// Rate limiting by role
export function rateLimitByRole(limits: Partial<Record<Role, number>>): RequestHandler {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const limit = limits[req.user.role] || 100; // default limit
    const windowMs = 60 * 1000; // 1 minute window
    const key = `${req.user.id}-${Math.floor(Date.now() / windowMs)}`;
    
    const userRequests = requests.get(key) || { count: 0, resetTime: Date.now() + windowMs };
    
    if (userRequests.count >= limit) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        limit,
        resetTime: userRequests.resetTime
      });
    }

    userRequests.count++;
    requests.set(key, userRequests);

    // Cleanup old entries
    if (Math.random() < 0.01) { // 1% chance to cleanup
      const now = Date.now();
      for (const [k, v] of requests.entries()) {
        if (v.resetTime < now) {
          requests.delete(k);
        }
      }
    }

    next();
  };
}

// Helper function to create RBAC-protected route handlers
export function createProtectedHandler(
  options: {
    roles?: Role[];
    permission?: { resource: Resource; action: Action };
    ownership?: boolean;
    sameDepartment?: boolean;
    rateLimit?: Partial<Record<Role, number>>;
  }
) {
  const middlewares: RequestHandler[] = [authenticateToken];

  if (options.rateLimit) {
    middlewares.push(rateLimitByRole(options.rateLimit));
  }

  if (options.roles) {
    middlewares.push(requireRole(...options.roles));
  }

  if (options.permission) {
    middlewares.push(requirePermission(options.permission.resource, options.permission.action));
  }

  if (options.ownership) {
    middlewares.push(requireOwnership());
  }

  if (options.sameDepartment) {
    middlewares.push(requireSameDepartment());
  }

  middlewares.push(auditLogger);

  return middlewares;
}

// Validation helpers for request data
export function validateRoleChange(currentUserRole: Role, targetRole: Role, targetUserId: string, currentUserId: string): boolean {
  // Can't change your own role
  if (targetUserId === currentUserId) {
    return false;
  }

  // Must have higher role than target
  if (!isHigherRole(currentUserRole, targetRole)) {
    return false;
  }

  return true;
}

export function validateResourceAccess(userRole: Role, resource: Resource, action: Action): boolean {
  return hasPermission(userRole, resource, action);
}
