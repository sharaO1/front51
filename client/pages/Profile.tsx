import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";
import AvatarUpload from "@/components/AvatarUpload";
import RoleBadge from "@/components/ui/role-badge";
import { useTranslation } from "react-i18next";
import { LoadingButton } from "@/components/ui/loading-button";
import {
  User,
  Mail,
  Phone,
  Building,
  Edit,
  Save,
  X,
  Shield,
  Calendar,
  Badge as BadgeIcon,
} from "lucide-react";

export default function Profile() {
  const { user, updateUserAvatar } = useAuthStore();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real app, this would update the user in the backend
      toast({
        title: t("profile.toast.updated_title"),
        description: t("profile.toast.updated_desc"),
        variant: "default",
      });

      setIsEditing(false);
    } catch (error) {
      toast({
        title: t("profile.toast.error_title"),
        description: t("profile.toast.error_desc"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      phone: user?.phone || "",
    });
    setIsEditing(false);
  };

  const handleAvatarUpdate = (avatarUrl: string) => {
    updateUserAvatar(avatarUrl);
    toast({
      title: t("profile.toast.updated_title"),
      description: t("profile.toast.updated_desc"),
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <User className="h-16 w-16 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground text-lg">
            Please log in to view your profile
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          {t("profile.title")}
        </h1>
        <p className="text-muted-foreground text-lg mt-2">
          {t("profile.subtitle")}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1 shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <AvatarUpload
                  currentAvatar={user.avatar}
                  userName={user.name}
                  onAvatarUpdate={handleAvatarUpdate}
                  size="lg"
                />
                {/* Online status indicator */}
                <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse" />
              </div>
            </div>

            <CardTitle className="text-2xl font-bold text-gray-900">
              {user.name}
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              {user.email}
            </CardDescription>

            <div className="flex justify-center mt-4">
              <RoleBadge role={user.role} size="lg" />
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-0">
            {/* Quick Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Building className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    {t("profile.department")}
                  </p>
                  <p className="text-sm text-blue-700">
                    {user.department
                      ? t(`departments.${user.department}`, {
                          defaultValue: user.department,
                        })
                      : t("profile.not_specified")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <BadgeIcon className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    {t("profile.job_title")}
                  </p>
                  <p className="text-sm text-green-700">
                    {user.title || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Shield className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-purple-900">
                    {t("profile.account_status")}
                  </p>
                  <Badge className="bg-green-100 text-green-800 mt-1">
                    {t("profile.active")}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editable Information */}
        <Card className="lg:col-span-2 shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  {t("profile.personal_information")}
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  {t("profile.personal_information_desc")}
                </CardDescription>
              </div>

              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300 self-start sm:self-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t("profile.edit_profile")}
                </Button>
              ) : (
                <div className="flex gap-2 self-start sm:self-center">
                  <LoadingButton
                    onClick={handleSave}
                    loading={isLoading}
                    loadingText={t("profile.saving")}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {t("profile.save_changes")}
                  </LoadingButton>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={isLoading}
                    className="hover:bg-gray-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    {t("common.cancel")}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Editable Fields */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">
                  {t("profile.name")}
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      value={(formData.name || "").split(" ")[0] || ""}
                      onChange={(e) => {
                        const parts = (formData.name || "").split(" ");
                        const last = parts.slice(1).join(" ");
                        setFormData({
                          ...formData,
                          name: `${e.target.value} ${last}`.trim(),
                        });
                      }}
                      disabled={!isEditing}
                      className={`pl-10 h-11 ${
                        isEditing
                          ? "border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          : "bg-gray-50"
                      } transition-all duration-200`}
                      placeholder={t("profile.first_name_placeholder")}
                    />
                  </div>
                  <div className="relative">
                    <Input
                      id="lastName"
                      value={(formData.name || "")
                        .split(" ")
                        .slice(1)
                        .join(" ")}
                      onChange={(e) => {
                        const first = (formData.name || "").split(" ")[0] || "";
                        setFormData({
                          ...formData,
                          name: `${first} ${e.target.value}`.trim(),
                        });
                      }}
                      disabled={!isEditing}
                      className={`h-11 ${
                        isEditing
                          ? "border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          : "bg-gray-50"
                      } transition-all duration-200`}
                      placeholder={t("profile.last_name_placeholder")}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="phone"
                  className="text-sm font-semibold text-gray-700"
                >
                  {t("profile.phone_number")}
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    disabled={!isEditing}
                    className={`pl-10 h-11 ${
                      isEditing
                        ? "border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        : "bg-gray-50"
                    } transition-all duration-200`}
                    placeholder={t("profile.phone_placeholder")}
                  />
                </div>
              </div>
            </div>

            {/* Read-only Information */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t("profile.account_information")}
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">
                    {t("profile.email_address")}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      value={user.email}
                      disabled
                      className="pl-10 h-11 bg-gray-50 text-gray-600"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {t("profile.email_cannot_change")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">
                    {t("profile.user_id")}
                  </Label>
                  <Input
                    value={user.id}
                    disabled
                    className="h-11 bg-gray-50 text-gray-600 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    {t("profile.user_id_desc")}
                  </p>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <div className="flex items-start gap-3">
                  <Edit className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      {t("profile.editing_mode_active")}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      {t("profile.editing_mode_desc")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
