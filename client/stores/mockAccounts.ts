import { Role } from '@shared/rbac';

export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  password: string;
  avatar: string;
  department: string;
  title: string;
  phone: string;
  location: string;
  filialId: string;
  filialName: string;
  joinDate: string;
  isActive: boolean;
  lastLogin: string;
  permissions: string[];
}

export const mockUsers: MockUser[] = [
  {
    id: '1',
    email: 'sarah.chen@company.com',
    name: 'Sarah Chen',
    role: 'super_admin',
    password: 'SecurePass123!',
    avatar: 'https://images.pexels.com/photos/25651531/pexels-photo-25651531.jpeg',
    department: 'Information Technology',
    title: 'Chief Technology Officer',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    filialId: 'store1',
    filialName: 'Main Warehouse',
    joinDate: '2020-01-15',
    isActive: true,
    lastLogin: '2024-12-19T10:30:00Z',
    permissions: [
      'users.create', 'users.read', 'users.update', 'users.delete',
      'roles.manage', 'system.configure', 'audit.view', 'reports.admin'
    ]
  },
  {
    id: '2', 
    email: 'michael.rodriguez@company.com',
    name: 'Michael Rodriguez',
    role: 'manager',
    password: 'Manager2024!',
    avatar: 'https://images.pexels.com/photos/3613388/pexels-photo-3613388.jpeg',
    department: 'Sales & Marketing',
    title: 'Regional Sales Manager',
    phone: '+1 (555) 234-5678',
    location: 'Austin, TX',
    filialId: 'store2',
    filialName: 'Downtown Retail Store',
    joinDate: '2021-03-10',
    isActive: true,
    lastLogin: '2024-12-19T08:45:00Z',
    permissions: [
      'clients.read', 'clients.update', 'sales.create', 'sales.read', 
      'sales.update', 'reports.team', 'employees.read'
    ]
  },
  {
    id: '3',
    email: 'jennifer.patel@company.com', 
    name: 'Jennifer Patel',
    role: 'employee',
    password: 'Employee2024!',
    avatar: 'https://images.pexels.com/photos/7640433/pexels-photo-7640433.jpeg',
    department: 'Customer Success',
    title: 'Senior Account Specialist',
    phone: '+1 (555) 345-6789',
    location: 'Chicago, IL',
    filialId: 'store2',
    filialName: 'Downtown Retail Store',
    joinDate: '2022-07-20',
    isActive: true,
    lastLogin: '2024-12-19T09:15:00Z',
    permissions: [
      'clients.read', 'clients.update', 'sales.read', 'products.read',
      'invoices.create', 'invoices.read'
    ]
  },
  {
    id: '4',
    email: 'david.kim@company.com',
    name: 'David Kim',
    role: 'viewer',
    password: 'Viewer2024!',
    avatar: 'https://images.pexels.com/photos/7640741/pexels-photo-7640741.jpeg',
    department: 'Finance',
    title: 'Financial Analyst',
    phone: '+1 (555) 456-7890',
    location: 'New York, NY',
    filialId: 'store4',
    filialName: 'Online Fulfillment Center',
    joinDate: '2023-09-05',
    isActive: true,
    lastLogin: '2024-12-19T07:30:00Z',
    permissions: [
      'dashboard.read', 'reports.read', 'analytics.read', 'invoices.read'
    ]
  },
  {
    id: '5',
    email: 'alexandra.johnson@company.com',
    name: 'Alexandra Johnson',
    role: 'admin',
    password: 'Admin2024!',
    avatar: 'https://images.pexels.com/photos/7640433/pexels-photo-7640433.jpeg',
    department: 'Human Resources',
    title: 'HR Operations Manager',
    phone: '+1 (555) 567-8901',
    location: 'Seattle, WA',
    filialId: 'store1',
    filialName: 'Main Warehouse',
    joinDate: '2020-11-12',
    isActive: true,
    lastLogin: '2024-12-19T11:00:00Z',
    permissions: [
      'users.create', 'users.read', 'users.update', 'employees.create',
      'employees.read', 'employees.update', 'reports.hr', 'settings.read'
    ]
  },
  {
    id: '6',
    email: 'robert.brown@company.com',
    name: 'Robert Brown',
    role: 'manager',
    password: 'Manager2024!',
    avatar: 'https://images.pexels.com/photos/3613388/pexels-photo-3613388.jpeg',
    department: 'Operations',
    title: 'Operations Director',
    phone: '+1 (555) 678-9012',
    location: 'Denver, CO',
    filialId: 'store1',
    filialName: 'Main Warehouse',
    joinDate: '2019-06-18',
    isActive: true,
    lastLogin: '2024-12-19T09:45:00Z',
    permissions: [
      'warehouse.read', 'warehouse.update', 'products.create', 'products.read',
      'products.update', 'reports.operations', 'employees.read'
    ]
  },
  {
    id: '7',
    email: 'lisa.martinez@company.com',
    name: 'Lisa Martinez',
    role: 'employee',
    password: 'Employee2024!',
    avatar: 'https://images.pexels.com/photos/25651531/pexels-photo-25651531.jpeg',
    department: 'Marketing',
    title: 'Digital Marketing Specialist',
    phone: '+1 (555) 789-0123',
    location: 'Los Angeles, CA',
    filialId: 'store3',
    filialName: 'North Branch',
    joinDate: '2023-02-14',
    isActive: true,
    lastLogin: '2024-12-19T10:15:00Z',
    permissions: [
      'clients.read', 'products.read', 'campaigns.create', 'campaigns.read',
      'campaigns.update', 'analytics.read'
    ]
  },
  {
    id: '8',
    email: 'thomas.wilson@company.com',
    name: 'Thomas Wilson',
    role: 'viewer',
    password: 'Viewer2024!',
    avatar: 'https://images.pexels.com/photos/7640741/pexels-photo-7640741.jpeg',
    department: 'Quality Assurance',
    title: 'QA Coordinator',
    phone: '+1 (555) 890-1234',
    location: 'Portland, OR',
    filialId: 'store3',
    filialName: 'North Branch',
    joinDate: '2023-11-08',
    isActive: true,
    lastLogin: '2024-12-19T08:00:00Z',
    permissions: [
      'products.read', 'warehouse.read', 'quality.read', 'reports.read'
    ]
  }
];

export const getRoleDescription = (role: Role): string => {
  switch (role) {
    case 'super_admin':
      return 'Complete system access with ability to manage all users, roles, and system configurations';
    case 'admin':
      return 'Administrative access to manage users, departments, and system settings within scope';
    case 'manager':
      return 'Team leadership with approval capabilities and access to departmental resources';
    case 'employee':
      return 'Standard operational access for daily business tasks and department-specific functions';
    case 'viewer':
      return 'Read-only access to dashboards, reports, and assigned data for monitoring purposes';
    default:
      return 'Basic system access';
  }
};

export const getRoleColor = (role: Role): string => {
  switch (role) {
    case 'super_admin':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'admin':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'manager':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'employee':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'viewer':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getDepartmentColor = (department: string): string => {
  const colors = {
    'Information Technology': 'bg-purple-100 text-purple-800',
    'Sales & Marketing': 'bg-green-100 text-green-800',
    'Customer Success': 'bg-blue-100 text-blue-800',
    'Finance': 'bg-yellow-100 text-yellow-800',
    'Human Resources': 'bg-pink-100 text-pink-800',
    'Operations': 'bg-orange-100 text-orange-800',
    'Marketing': 'bg-teal-100 text-teal-800',
    'Quality Assurance': 'bg-indigo-100 text-indigo-800'
  };
  return colors[department as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

export const mockUserStats = {
  totalUsers: mockUsers.length,
  activeUsers: mockUsers.filter(user => user.isActive).length,
  totalDepartments: [...new Set(mockUsers.map(user => user.department))].length,
  roleDistribution: {
    super_admin: mockUsers.filter(user => user.role === 'super_admin').length,
    admin: mockUsers.filter(user => user.role === 'admin').length,
    manager: mockUsers.filter(user => user.role === 'manager').length,
    employee: mockUsers.filter(user => user.role === 'employee').length,
    viewer: mockUsers.filter(user => user.role === 'viewer').length,
  }
};
