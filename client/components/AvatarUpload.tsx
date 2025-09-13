import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/authStore";
import { API_BASE, joinApi, getErrorMessageFromResponse } from "@/lib/api";
import { Upload, Camera, X, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AvatarUploadProps {
  currentAvatar?: string;
  userName: string;
  onAvatarUpdate: (avatarUrl: string) => void;
  size?: "sm" | "md" | "lg";
}

export default function AvatarUpload({
  currentAvatar,
  userName,
  onAvatarUpdate,
  size = "md",
}: AvatarUploadProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentAvatar || null,
  );
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const accessToken = useAuthStore((s) => s.accessToken);

  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-20 w-20",
    lg: "h-32 w-32",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    if (!accessToken) {
      toast({
        title: "Not authenticated",
        description: "Please log in again.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    const toAbs = (url: unknown): string | null => {
      if (typeof url !== "string" || !url) return null;
      if (/^(https?:)?\/\//i.test(url) || url.startsWith("data:")) return url;
      const base = API_BASE.replace(/\/?api\/?$/, "");
      if (url.startsWith("/")) return `${base}${url}`;
      return `${API_BASE.replace(/\/+$/, "")}/${url}`;
    };

    const doUpload = async (method: "POST" | "PUT") => {
      const form = new FormData();
      // Backend expects a single file field named "avatar"
      form.append("avatar", selectedFile);

      const res = await fetch(joinApi("/users/avatar"), {
        method,
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form,
      });
      return res;
    };

    try {
      // Try PUT first (most backends expose PUT for avatar updates)
      let res = await doUpload("PUT");
      if (res.status === 405 || res.status === 404) {
        // Fallback to POST if PUT isn't supported
        res = await doUpload("POST");
      }

      if (!res.ok) {
        const msg = await getErrorMessageFromResponse(res);
        throw new Error(msg || "Upload failed");
      }

      let data: any = null;
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json"))
        data = await res.json().catch(() => null);
      else data = await res.text().catch(() => "");

      const candidate =
        (data && typeof data === "object" && (data.url || data.avatarUrl)) ||
        (data &&
          typeof data === "object" &&
          data.result &&
          (data.result.url || data.result.avatarUrl)) ||
        (data &&
          typeof data === "object" &&
          typeof data.result === "string" &&
          data.result) ||
        (typeof data === "string" ? data : null);

      const uploadedUrl = toAbs(candidate) || candidate || null;
      if (!uploadedUrl) throw new Error("Invalid response from server");

      onAvatarUpdate(uploadedUrl);
      setPreviewUrl(uploadedUrl);

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully",
      });

      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description:
          error?.message || "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    onAvatarUpdate("");
    setIsDialogOpen(false);

    toast({
      title: "Avatar removed",
      description: "Your profile picture has been removed",
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={currentAvatar} alt={userName} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {getInitials(userName)}
        </AvatarFallback>
      </Avatar>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Camera className="h-4 w-4 mr-2" />
            Change Avatar
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
            <DialogDescription>
              Upload a new avatar or remove your current one
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current/Preview Avatar */}
            <div className="flex justify-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={previewUrl || currentAvatar} alt={userName} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Upload Options */}
            <div className="space-y-3">
              <Button
                onClick={triggerFileInput}
                variant="outline"
                className="w-full"
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Image
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                capture="environment"
              />

              {currentAvatar && (
                <Button
                  onClick={handleRemoveAvatar}
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700"
                  disabled={uploading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove Avatar
                </Button>
              )}
            </div>

            {/* Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-1">
                <p>• Use a clear, professional photo</p>
                <p>• Square images work best (1:1 ratio)</p>
                <p>• Maximum file size: 5MB</p>
                <p>• Supported formats: JPG, PNG, GIF</p>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current mr-2" />
                  Uploading...
                </>
              ) : (
                "Update Avatar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
