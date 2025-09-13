import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, User, Key, Building, MapPin, Phone, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RoleBadge from '@/components/ui/role-badge';
import { mockUsers, getRoleDescription, getDepartmentColor } from '@/stores/mockAccounts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserCredentialsProps {
  onCredentialSelect?: (email: string, password: string) => void;
}

export default function UserCredentials({ onCredentialSelect }: UserCredentialsProps) {
  const { toast } = useToast();

  const copyCredentials = (email: string, password: string) => {
    navigator.clipboard.writeText(`Email: ${email}\nPassword: ${password}`);
    toast({
      title: 'Credentials Copied',
      description: 'Login credentials have been copied to clipboard',
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
          User Accounts
        </CardTitle>
        <CardDescription>
          Select from our pre-configured user accounts to explore role-based permissions and features.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mockUsers.slice(0, 6).map((user) => (
            <div
              key={user.email}
              className="p-4 border rounded-lg space-y-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-primary/10">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">{user.name}</h3>
                    <RoleBadge role={user.role} size="sm" />
                  </div>
                  
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Building className="h-3 w-3" />
                      <span className="truncate">{user.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getDepartmentColor(user.department)}`}
                      >
                        {user.department}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="font-mono">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Key className="h-3 w-3 text-muted-foreground" />
                  <span className="font-mono">{user.password}</span>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground leading-relaxed">
                {getRoleDescription(user.role)}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyCredentials(user.email, user.password)}
                  className="flex-1 h-8 text-xs"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
                {onCredentialSelect && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => useCredentials(user.email, user.password)}
                    className="flex-1 h-8 text-xs"
                  >
                    Login
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💼 Business Dashboard:</strong> Each user account represents a different role 
            within a business organization. Login with different accounts to experience how 
            permissions and available features change based on your organizational role and responsibilities.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
