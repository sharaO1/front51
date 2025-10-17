import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useThemeStore } from "@/stores/themeStore";
import { useAuthStore } from "@/stores/authStore";
import {
  Settings as SettingsIcon,
  Globe,
  Moon,
  Sun,
  Bell,
  AlertTriangle,
  Shield,
  Building,
  Save,
  Lock,
  Key,
  Check,
  Eye,
  EyeOff
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SystemSettings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  currency: string;
  timezone: string;
  language: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  lowStockAlerts: boolean;
  paymentReminders: boolean;
  systemUpdates: boolean;
  securityAlerts: boolean;
}

interface LowStockAlertSettings {
  enabled: boolean;
  emailNotification: boolean;
  smsNotification: boolean;
  criticalThreshold: number;
  warningThreshold: number;
  checkFrequency: string;
  autoReorder: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
}

export default function Settings() {
  const { theme, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    companyName: "StockMind Corp",
    companyEmail: "admin@businesspro.com",
    companyPhone: "+1 (555) 123-4567",
    currency: "USD",
    timezone: "America/New_York",
    language: "en",
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    lowStockAlerts: true,
    paymentReminders: true,
    systemUpdates: true,
    securityAlerts: true,
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
  });

  const [lowStockAlertSettings, setLowStockAlertSettings] = useState<LowStockAlertSettings>({
    enabled: true,
    emailNotification: true,
    smsNotification: false,
    criticalThreshold: 25,
    warningThreshold: 50,
    checkFrequency: "daily",
    autoReorder: false,
  });

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const saveSystemSettings = () => {
    toast({
      title: "Settings saved",
      description: "System settings have been updated successfully.",
    });
  };

  const saveNotificationSettings = () => {
    toast({
      title: "Notifications updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const saveSecuritySettings = () => {
    toast({
      title: "Security updated",
      description: "Security settings have been applied.",
    });
  };

  const saveLowStockAlertSettings = () => {
    toast({
      title: "Low Stock Alerts configured",
      description: "Your low stock alert settings have been saved successfully.",
    });
  };

  const changePassword = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Password changed",
      description: "Your password has been updated successfully.",
    });

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowChangePassword(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('settings.title', 'Settings')}</h1>
          <p className="text-muted-foreground">{t('settings.subtitle', 'Manage your application preferences')}</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Company Information
                </CardTitle>
                <CardDescription>
                  Basic company details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={systemSettings.companyName}
                    onChange={(e) => setSystemSettings({...systemSettings, companyName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={systemSettings.companyEmail}
                    onChange={(e) => setSystemSettings({...systemSettings, companyEmail: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Phone</Label>
                  <Input
                    id="companyPhone"
                    value={systemSettings.companyPhone}
                    onChange={(e) => setSystemSettings({...systemSettings, companyPhone: e.target.value})}
                  />
                </div>
                <Button onClick={saveSystemSettings} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Company Info
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Preferences
                </CardTitle>
                <CardDescription>
                  Regional settings and appearance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={systemSettings.currency} onValueChange={(value) => setSystemSettings({...systemSettings, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={systemSettings.timezone} onValueChange={(value) => setSystemSettings({...systemSettings, timezone: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark themes
                    </p>
                  </div>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                  />
                </div>
                <Button onClick={saveSystemSettings} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Choose which notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Low Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    When inventory falls below minimum levels
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.lowStockAlerts}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, lowStockAlerts: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Payment Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Overdue invoice and payment notifications
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.paymentReminders}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, paymentReminders: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Software updates and maintenance notices
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.systemUpdates}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, systemUpdates: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Security Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Failed login attempts and security events
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.securityAlerts}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, securityAlerts: checked})}
                />
              </div>
              <Button onClick={saveNotificationSettings} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Notifications
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Low Stock Alert Configuration
              </CardTitle>
              <CardDescription>
                Fine-tune your low stock alert settings and thresholds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Low Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Activate monitoring for inventory levels
                  </p>
                </div>
                <Switch
                  checked={lowStockAlertSettings.enabled}
                  onCheckedChange={(checked) => setLowStockAlertSettings({...lowStockAlertSettings, enabled: checked})}
                />
              </div>

              {lowStockAlertSettings.enabled && (
                <>
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="criticalThreshold">
                        Critical Stock Threshold (% of minimum)
                      </Label>
                      <Input
                        id="criticalThreshold"
                        type="number"
                        min="0"
                        max="100"
                        value={lowStockAlertSettings.criticalThreshold}
                        onChange={(e) => setLowStockAlertSettings({...lowStockAlertSettings, criticalThreshold: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))})}
                      />
                      <p className="text-xs text-muted-foreground">
                        Alert when stock falls below this % of minimum required level
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="warningThreshold">
                        Warning Stock Threshold (% of minimum)
                      </Label>
                      <Input
                        id="warningThreshold"
                        type="number"
                        min="0"
                        max="100"
                        value={lowStockAlertSettings.warningThreshold}
                        onChange={(e) => setLowStockAlertSettings({...lowStockAlertSettings, warningThreshold: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))})}
                      />
                      <p className="text-xs text-muted-foreground">
                        Alert when stock approaches this % of minimum required level
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="checkFrequency">Check Frequency</Label>
                      <Select
                        value={lowStockAlertSettings.checkFrequency}
                        onValueChange={(value) => setLowStockAlertSettings({...lowStockAlertSettings, checkFrequency: value})}
                      >
                        <SelectTrigger id="checkFrequency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realtime">Real-time</SelectItem>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                      <Label>Notification Channels</Label>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm">Email Notification</Label>
                          <p className="text-xs text-muted-foreground">
                            Receive alerts via email
                          </p>
                        </div>
                        <Switch
                          checked={lowStockAlertSettings.emailNotification}
                          onCheckedChange={(checked) => setLowStockAlertSettings({...lowStockAlertSettings, emailNotification: checked})}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm">SMS Notification</Label>
                          <p className="text-xs text-muted-foreground">
                            Receive alerts via SMS
                          </p>
                        </div>
                        <Switch
                          checked={lowStockAlertSettings.smsNotification}
                          onCheckedChange={(checked) => setLowStockAlertSettings({...lowStockAlertSettings, smsNotification: checked})}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="space-y-0.5">
                        <Label className="text-sm">Auto-Reorder</Label>
                        <p className="text-xs text-muted-foreground">
                          Automatically create purchase orders when stock is low
                        </p>
                      </div>
                      <Switch
                        checked={lowStockAlertSettings.autoReorder}
                        onCheckedChange={(checked) => setLowStockAlertSettings({...lowStockAlertSettings, autoReorder: checked})}
                      />
                    </div>
                  </div>
                </>
              )}

              <Button onClick={saveLowStockAlertSettings} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Low Stock Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Configure login and access security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactorAuth: checked})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value) || 30})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => setSecuritySettings({...securitySettings, maxLoginAttempts: parseInt(e.target.value) || 5})}
                  />
                </div>
                <Button onClick={saveSecuritySettings} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Security
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your account password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Password Requirements</Label>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Minimum 6 characters
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      At least one uppercase letter
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      At least one number
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Change Password</Label>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowChangePassword(!showChangePassword)}
                    >
                      {showChangePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {showChangePassword && (
                    <div className="space-y-3">
                      <Input
                        type="password"
                        placeholder="Current password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      />
                      <Input
                        type="password"
                        placeholder="New password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      />
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      />
                      <Button onClick={changePassword} className="w-full" size="sm">
                        <Lock className="mr-2 h-4 w-4" />
                        Change Password
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                Your account details and profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-lg">
                    {user?.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{user?.name}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <p className="text-sm text-muted-foreground">{user?.role.replace('_', ' ')}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">User ID</Label>
                    <p className="font-medium">{user?.id || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Role</Label>
                    <p className="font-medium capitalize">{user?.role.replace('_', ' ') || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <p className="font-medium">Active</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
