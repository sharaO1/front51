import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Role } from '@shared/rbac';
import { 
  Shield, 
  Crown, 
  UserCheck, 
  Users, 
  User, 
  UserMinus, 
  Eye 
} from 'lucide-react';

interface RoleBadgeProps {
  role: Role;
  showIcon?: boolean;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const roleConfig: Record<Role, {
  label: string;
  icon: typeof Shield;
  color: string;
  bgColor: string;
}> = {
  super_admin: {
    label: 'Super Admin',
    icon: Crown,
    color: 'text-purple-700',
    bgColor: 'bg-purple-100 hover:bg-purple-200 border-purple-300'
  },
  admin: {
    label: 'Admin',
    icon: Shield,
    color: 'text-red-700',
    bgColor: 'bg-red-100 hover:bg-red-200 border-red-300'
  },
  manager: {
    label: 'Manager',
    icon: UserCheck,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100 hover:bg-blue-200 border-blue-300'
  },
  team_lead: {
    label: 'Team Lead',
    icon: Users,
    color: 'text-green-700',
    bgColor: 'bg-green-100 hover:bg-green-200 border-green-300'
  },
  employee: {
    label: 'Employee',
    icon: User,
    color: 'text-gray-700',
    bgColor: 'bg-gray-100 hover:bg-gray-200 border-gray-300'
  },
  intern: {
    label: 'Intern',
    icon: UserMinus,
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300'
  },
  viewer: {
    label: 'Viewer',
    icon: Eye,
    color: 'text-slate-700',
    bgColor: 'bg-slate-100 hover:bg-slate-200 border-slate-300'
  }
};

export default function RoleBadge({
  role,
  showIcon = true,
  variant = 'default',
  size = 'default',
  className
}: RoleBadgeProps) {
  const config = roleConfig[role] || {
    label: role ? role.replace('_', ' ').split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') : 'Unknown Role',
    icon: User,
    color: 'text-gray-700',
    bgColor: 'bg-gray-100 hover:bg-gray-200 border-gray-300'
  };
  const Icon = config.icon;

  if (variant === 'outline') {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          'border-2',
          config.bgColor,
          config.color,
          size === 'sm' && 'text-xs px-2 py-0.5',
          size === 'lg' && 'text-sm px-3 py-1',
          className
        )}
      >
        {showIcon && <Icon className={cn(
          'mr-1',
          size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'
        )} />}
        {config.label}
      </Badge>
    );
  }

  return (
    <Badge 
      variant={variant} 
      className={cn(
        variant === 'default' && config.bgColor,
        variant === 'default' && config.color,
        size === 'sm' && 'text-xs px-2 py-0.5',
        size === 'lg' && 'text-sm px-3 py-1',
        className
      )}
    >
      {showIcon && <Icon className={cn(
        'mr-1',
        size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'
      )} />}
      {config.label}
    </Badge>
  );
}

// Role selector component
interface RoleSelectorProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  allowedRoles: Role[];
  disabled?: boolean;
  className?: string;
}

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function RoleSelector({ 
  currentRole, 
  onRoleChange, 
  allowedRoles, 
  disabled = false,
  className 
}: RoleSelectorProps) {
  return (
    <Select 
      value={currentRole} 
      onValueChange={onRoleChange}
      disabled={disabled}
    >
      <SelectTrigger className={cn('w-[180px]', className)}>
        <SelectValue>
          <RoleBadge role={currentRole} size="sm" />
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {allowedRoles.map((role) => (
          <SelectItem key={role} value={role}>
            <RoleBadge role={role} size="sm" />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
