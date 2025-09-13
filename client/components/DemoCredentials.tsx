import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, User, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RoleBadge from '@/components/ui/role-badge';
import { Role } from '@shared/rbac';

interface DemoCredential {
  email: string;
  password: string;
  role: Role;
  description: string;
}

const demoCredentials: DemoCredential[] = [
  {
    email: 'admin@example.com',
    password: 'admin123',
    role: 'super_admin',
    description: 'Full system access with all administrative privileges'
  },
  {
    email: 'manager@example.com', 
    password: 'manager123',
    role: 'manager',
    description: 'Departmental management with approval capabilities'
  },
  {
    email: 'employee@example.com',
    password: 'employee123', 
    role: 'employee',
    description: 'Standard user access for daily operational tasks'
  },
  {
    email: 'viewer@example.com',
    password: 'viewer123',
    role: 'viewer', 
    description: 'Read-only access to basic system information'
  }
];

interface DemoCredentialsProps {
  onCredentialSelect?: (email: string, password: string) => void;
}

export default function DemoCredentials({ onCredentialSelect }: DemoCredentialsProps) {
  const { toast } = useToast();

  const copyCredentials = (email: string, password: string) => {
    navigator.clipboard.writeText(`Email: ${email}\nPassword: ${password}`);
    toast({
      title: 'Credentials Copied',
      description: 'Demo credentials have been copied to clipboard',
    });
  };

  const useCredentials = (email: string, password: string) => {
    if (onCredentialSelect) {
      onCredentialSelect(email, password);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Demo Credentials
        </CardTitle>
        <CardDescription>
          Use these test accounts to explore different permission levels. Only admins can create, edit, and manage user accounts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demoCredentials.map((cred) => (
            <div
              key={cred.email}
              className="p-4 border rounded-lg space-y-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <RoleBadge role={cred.role} size="sm" />
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyCredentials(cred.email, cred.password)}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  {onCredentialSelect && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => useCredentials(cred.email, cred.password)}
                      className="text-xs px-2"
                    >
                      Use
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="font-mono text-xs">{cred.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Key className="h-3 w-3 text-muted-foreground" />
                  <span className="font-mono text-xs">{cred.password}</span>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground leading-relaxed">
                {cred.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Try logging in with different roles to see how the interface
            and available features change based on your permissions. Only administrators can
            create, edit, and manage user accounts for security purposes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
