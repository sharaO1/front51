import { useEffect, useState } from "react";
import { useRBACStore } from "@/stores/rbacStore";
import { Role, ROLE_PERMISSIONS } from "@shared/rbac";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import RoleBadge, { RoleSelector } from "@/components/ui/role-badge";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { joinApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  AlertCircle,
  Building,
  Building2,
} from "lucide-react";

interface UserCreateDialogProps {
  trigger?: React.ReactNode;
  onUserCreated?: () => void;
}

export default function UserCreateDialog({
  trigger,
  onUserCreated,
}: UserCreateDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const accessToken = useAuthStore((s) => s.accessToken);
  const [filialOptions, setFilialOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [loadingFilials, setLoadingFilials] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee" as Role,
    department: "",
    filialId: "",
    notes: "",
  });

  const { currentUser, isHigherRole } = useRBACStore();
  const { toast } = useToast();
  const { t } = useTranslation();

  const availableRoles: Role[] = currentUser
    ? ([
        "super_admin",
        "admin",
        "manager",
        "team_lead",
        "employee",
        "intern",
        "viewer",
      ].filter((role) => isHigherRole(role as Role)) as Role[])
    : [];

  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password }));
    toast({
      title: t("admin.users.toast.password_generated_title"),
      description: t("admin.users.toast.password_generated_desc"),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !firstName ||
      !lastName ||
      !formData.email ||
      !formData.password ||
      !formData.filialId
    ) {
      toast({
        title: t("admin.users.toast.error"),
        description: t("admin.users.create.validation.required_fields"),
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: t("admin.users.toast.error"),
        description: t("admin.users.create.validation.password_min"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { useAuthStore } = await import("@/stores/authStore");
      const { accessToken } = useAuthStore.getState();
      if (!accessToken) {
        toast({
          title: t("admin.users.toast.not_authenticated_title"),
          description: t("admin.users.toast.not_authenticated_desc"),
          variant: "destructive",
        });
        return;
      }

      const toBackendRole = (role: Role) => role.toUpperCase();

      const res = await fetch(joinApi("/users"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName,
          lastName,
          department: formData.department || undefined,
          filialId: formData.filialId,
          role: toBackendRole(formData.role),
        }),
      });

      const raw = await res.text();
      let json: any = null;
      try {
        json = raw ? JSON.parse(raw) : null;
      } catch {}

      if (!res.ok || (json && json.ok === false)) {
        const msg =
          (json && (json.message || json.error || json.reason)) ||
          res.statusText ||
          "Failed to create user.";
        throw new Error(msg);
      }

      const fullName = `${firstName} ${lastName}`.trim();
      toast({
        title: t("admin.users.toast.created_success_title"),
        description: t("admin.users.toast.created_success_desc", { name: fullName, role: t(`roles.labels.${formData.role}`) }),
      });

      setFormData({
        name: "",
        email: "",
        password: "",
        role: "employee",
        department: "",
        filialId: "",
        notes: "",
      });
      setFirstName("");
      setLastName("");
      setIsOpen(false);
      onUserCreated?.();
    } catch (error: any) {
      toast({
        title: t("admin.users.toast.error"),
        description: error?.message || t("admin.users.toast.create_failed_fallback"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "employee",
      department: "",
      filialId: "",
      notes: "",
    });
    setFirstName("");
    setLastName("");
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    const loadFilials = async () => {
      try {
        setLoadingFilials(true);
        const res = await fetch(joinApi("/filials"), {
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        });
        const json = await res.json().catch(() => null);
        if (res.ok && json?.ok && Array.isArray(json.result)) {
          const mapped = json.result.map((f: any) => ({
            id: String(f.id),
            name: String(f.name || f.title || f.filialName || f.id),
          }));
          if (mounted) setFilialOptions(mapped);
        } else {
          if (mounted) setFilialOptions([]);
        }
      } catch {
        if (mounted) setFilialOptions([]);
      } finally {
        if (mounted) setLoadingFilials(false);
      }
    };
    loadFilials();
    return () => {
      mounted = false;
    };
  }, [isOpen, accessToken]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to the system with specific role and permissions
          </DialogDescription>
        </DialogHeader>

        <form
          id="user-create-form"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="flex items-center gap-2">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="john@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password *
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Enter secure password"
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={generatePassword}
                  className="whitespace-nowrap"
                >
                  Generate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum 6 characters. Use the generate button for a secure
                password.
              </p>
            </div>
          </div>

          {/* Role and Permissions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Role and Access</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>User Role</Label>
                <RoleSelector
                  currentRole={formData.role}
                  onRoleChange={(role) =>
                    setFormData((prev) => ({ ...prev, role }))
                  }
                  allowedRoles={availableRoles}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Role determines what the user can access and modify
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Department
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, department: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filial" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Work Location (Filial) *
              </Label>
              <Select
                value={formData.filialId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, filialId: value }))
                }
                disabled={loadingFilials}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingFilials
                        ? "Loading filials..."
                        : "Select work location"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filialOptions.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose the primary location where this user will work
              </p>
            </div>

            {/* Role Preview */}
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Role Permissions Preview</h4>
              <div className="text-sm text-muted-foreground">
                <RoleBadge role={formData.role} className="mb-2" />
                <p>
                  {ROLE_PERMISSIONS[formData.role]?.length || 0} permissions
                  across{" "}
                  {new Set(
                    ROLE_PERMISSIONS[formData.role]?.map((p) => p.resource),
                  ).size || 0}{" "}
                  resources
                </p>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Any additional information about this user..."
              rows={3}
            />
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <strong>Security Notice:</strong> The user will receive these
              credentials and be able to log in immediately. Make sure to share
              the password securely.
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="user-create-form"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create User
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
