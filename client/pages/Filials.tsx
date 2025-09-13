import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/authStore";
import { API_BASE } from "@/lib/api";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Building2,
  Store,
  Globe,
  Phone,
  Mail,
  User,
  Calendar,
} from "lucide-react";
import DetailCard from "@/components/DetailCard";
import { useTranslation } from "react-i18next";

interface Filial {
  id: string;
  name: string;
  type: "warehouse" | "retail" | "online" | string;
  address: string;
  city: string;
  country: string;
  phone?: string | null;
  email?: string | null;
  manager: string;
  status: "active" | "inactive" | "maintenance" | string;
  openingHours?: string | null;
  capacity?: number | null;
  currentStaff: number;
  createdAt: string;
  updatedAt: string;
}

interface FilialProduct {
  id: string;
  count: number;
  product: {
    id: string;
    name: string;
    sku?: string;
    location?: string;
    sellingPrice?: string | number;
  };
}

const mockFilials: Filial[] = [
  {
    id: "1",
    name: "Main Warehouse",
    type: "warehouse",
    address: "Central District, Building A",
    city: "Tashkent",
    country: "Uzbekistan",
    phone: "+998 71 123 4567",
    email: "warehouse@company.uz",
    manager: "John Smith",
    status: "active",
    openingHours: "24/7",
    capacity: 10000,
    currentStaff: 25,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-20",
  },
  {
    id: "2",
    name: "Downtown Retail Store",
    type: "retail",
    address: "Downtown Mall, Unit 15",
    city: "Tashkent",
    country: "Uzbekistan",
    phone: "+998 71 234 5678",
    email: "downtown@company.uz",
    manager: "Sarah Johnson",
    status: "active",
    openingHours: "09:00 - 21:00",
    capacity: 500,
    currentStaff: 8,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-18",
  },
  {
    id: "3",
    name: "North Branch",
    type: "retail",
    address: "North Plaza, Store 22",
    city: "Samarkand",
    country: "Uzbekistan",
    phone: "+998 66 345 6789",
    email: "north@company.uz",
    manager: "Mike Chen",
    status: "active",
    openingHours: "10:00 - 20:00",
    capacity: 300,
    currentStaff: 6,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-15",
  },
  {
    id: "4",
    name: "Online Fulfillment Center",
    type: "online",
    address: "Industrial Park, Zone C",
    city: "Tashkent",
    country: "Uzbekistan",
    phone: "+998 71 456 7890",
    email: "online@company.uz",
    manager: "Alex Wilson",
    status: "active",
    openingHours: "24/7",
    capacity: 5000,
    currentStaff: 15,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-19",
  },
  {
    id: "5",
    name: "Bukhara Branch",
    type: "retail",
    address: "Historic Center, Building 12",
    city: "Bukhara",
    country: "Uzbekistan",
    phone: "+998 65 567 8901",
    email: "bukhara@company.uz",
    manager: "Emma Davis",
    status: "maintenance",
    openingHours: "10:00 - 19:00",
    capacity: 250,
    currentStaff: 4,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-10",
  },
];

export default function Filials() {
  const [filials, setFilials] = useState<Filial[]>(mockFilials);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const accessToken = useAuthStore((s) => s.accessToken);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedFilial, setSelectedFilial] = useState<Filial | null>(null);
  const [editingFilial, setEditingFilial] = useState<Filial | null>(null);
  const [managerNames, setManagerNames] = useState<Record<string, string>>({});

  // Products that belong to the selected filial
  const [filialProducts, setFilialProducts] = useState<FilialProduct[]>([]);
  const [isFilialProductsLoading, setIsFilialProductsLoading] = useState(false);
  const [filialProductsError, setFilialProductsError] = useState<string | null>(
    null,
  );

  const [newFilial, setNewFilial] = useState<Partial<Filial>>({
    name: "",
    type: "retail",
    address: "",
    city: "",
    country: "Uzbekistan",
    phone: "",
    email: "",
    manager: "",
    status: "active",
    openingHours: "",
    capacity: 0,
    currentStaff: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!isViewDialogOpen || !selectedFilial?.id) {
        if (mounted) setFilialProducts([]);
        return;
      }

      try {
        setIsFilialProductsLoading(true);
        setFilialProductsError(null);
        const res = await fetch(`${API_BASE}/filials/${selectedFilial.id}`, {
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.ok || !Array.isArray(json.result)) {
          throw new Error(json?.error || "Failed to load filial products");
        }
        const mapped: FilialProduct[] = json.result.map((r: any) => ({
          id: r.id,
          count: Number(r.count || 0),
          product: {
            id: r.product?.id || "",
            name: r.product?.name || "",
            sku: r.product?.sku || "",
            location: r.product?.location || "",
            sellingPrice: r.product?.sellingPrice ?? "",
          },
        }));
        if (mounted) setFilialProducts(mapped);
      } catch (e: any) {
        if (mounted)
          setFilialProductsError(
            e?.message || "Failed to load filial products",
          );
      } finally {
        if (mounted) setIsFilialProductsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [isViewDialogOpen, selectedFilial?.id, accessToken]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}/filials`, {
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.ok || !Array.isArray(json.result)) {
          throw new Error(json?.error || "Failed to load filials");
        }
        const mapped: Filial[] = json.result.map((f: any) => {
          const managerNameCandidate =
            f.managerName ||
            f.manager_name ||
            (typeof f.manager === "object" &&
              (f.manager.fullName || f.manager.name)) ||
            f.managerFullName ||
            f.manager_full_name ||
            (f.managerUser && (f.managerUser.fullName || f.managerUser.name)) ||
            (f.managerProfile &&
              (f.managerProfile.fullName || f.managerProfile.name)) ||
            "";
          const managerFallbackId =
            f.managerId || f.manager_id || f.manager || "";
          const manager =
            (managerNameCandidate && String(managerNameCandidate)) ||
            String(managerFallbackId) ||
            "";
          return {
            id: f.id,
            name: f.name,
            type: f.type || "warehouse",
            address: f.address || "",
            city: f.city || "",
            country: f.country || "",
            phone: f.phone ?? null,
            email: f.email ?? null,
            manager,
            status: f.status || "active",
            openingHours: f.openingHours ?? null,
            capacity: typeof f.capacity === "number" ? f.capacity : null,
            currentStaff: 0,
            createdAt: f.createdAt || "",
            updatedAt: f.updatedAt || "",
          } as Filial;
        });
        if (mounted) setFilials(mapped);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load filials");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [accessToken]);

  const isIdLike = (v: string) =>
    typeof v === "string" &&
    !v.includes(" ") &&
    !/[.@]/.test(v) &&
    v.length >= 6;
  const getManagerDisplay = (v: string) => managerNames[v] || v;

  useEffect(() => {
    const ids = Array.from(
      new Set(
        filials
          .map((f) => f.manager)
          .filter((v) => isIdLike(v) && !managerNames[v]),
      ),
    );
    if (ids.length === 0) return;
    let cancelled = false;
    (async () => {
      for (const id of ids) {
        try {
          const res = await fetch(
            `${API_BASE}/users/${encodeURIComponent(id)}`,
            {
              headers: {
                ...(accessToken
                  ? { Authorization: `Bearer ${accessToken}` }
                  : {}),
                "Content-Type": "application/json",
              },
            },
          );
          const json = await res.json().catch(() => null);
          if (!cancelled && res.ok && json?.ok && json?.result) {
            const u = json.result as any;
            const name =
              [u.firstName, u.lastName].filter(Boolean).join(" ") ||
              u.username ||
              u.name ||
              u.email ||
              id;
            setManagerNames((prev) => ({ ...prev, [id]: String(name) }));
          }
        } catch {}
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filials, accessToken, managerNames]);

  const filteredFilials = filials.filter((filial) => {
    const matchesSearch =
      filial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      filial.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      filial.manager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || filial.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || filial.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Inactive
          </Badge>
        );
      case "maintenance":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Maintenance
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "warehouse":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            <Building2 className="w-3 h-3 mr-1" />
            Warehouse
          </Badge>
        );
      case "retail":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            <Store className="w-3 h-3 mr-1" />
            Retail
          </Badge>
        );
      case "online":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800">
            <Globe className="w-3 h-3 mr-1" />
            Online
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatPrice = (v: any) => {
    if (v === null || v === undefined || v === "") return "-";
    const n = Number(v);
    if (isNaN(n)) return String(v);
    return n.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const addFilial = () => {
    if (
      !newFilial.name ||
      !newFilial.address ||
      !newFilial.city ||
      !newFilial.manager
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const filial: Filial = {
      id: Date.now().toString(),
      name: newFilial.name!,
      type: newFilial.type as "warehouse" | "retail" | "online",
      address: newFilial.address!,
      city: newFilial.city!,
      country: newFilial.country || "Uzbekistan",
      phone: newFilial.phone,
      email: newFilial.email,
      manager: newFilial.manager!,
      status: newFilial.status as "active" | "inactive" | "maintenance",
      openingHours: newFilial.openingHours,
      capacity: newFilial.capacity || 0,
      currentStaff: newFilial.currentStaff || 0,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    setFilials([...filials, filial]);
    setNewFilial({
      name: "",
      type: "retail",
      address: "",
      city: "",
      country: "Uzbekistan",
      phone: "",
      email: "",
      manager: "",
      status: "active",
      openingHours: "",
      capacity: 0,
      currentStaff: 0,
    });
    setIsAddDialogOpen(false);

    toast({
      title: "Filial added",
      description: `${filial.name} has been added successfully.`,
    });
  };

  const editFilial = () => {
    if (
      !editingFilial ||
      !newFilial.name ||
      !newFilial.address ||
      !newFilial.city ||
      !newFilial.manager
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const updatedFilial: Filial = {
      ...editingFilial,
      name: newFilial.name!,
      type: newFilial.type as "warehouse" | "retail" | "online",
      address: newFilial.address!,
      city: newFilial.city!,
      country: newFilial.country || "Uzbekistan",
      phone: newFilial.phone,
      email: newFilial.email,
      manager: newFilial.manager!,
      status: newFilial.status as "active" | "inactive" | "maintenance",
      openingHours: newFilial.openingHours,
      capacity: newFilial.capacity || 0,
      currentStaff: newFilial.currentStaff || 0,
      updatedAt: new Date().toISOString().split("T")[0],
    };

    setFilials(
      filials.map((f) => (f.id === editingFilial.id ? updatedFilial : f)),
    );
    setNewFilial({
      name: "",
      type: "retail",
      address: "",
      city: "",
      country: "Uzbekistan",
      phone: "",
      email: "",
      manager: "",
      status: "active",
      openingHours: "",
      capacity: 0,
      currentStaff: 0,
    });
    setEditingFilial(null);
    setIsEditDialogOpen(false);

    toast({
      title: "Filial updated",
      description: `${updatedFilial.name} has been updated successfully.`,
    });
  };

  const deleteFilial = (filialId: string) => {
    const filial = filials.find((f) => f.id === filialId);
    if (!filial) return;

    setFilials(filials.filter((f) => f.id !== filialId));

    toast({
      title: "Filial deleted",
      description: `${filial.name} has been removed.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("filials.title")}
          </h1>
          <p className="text-muted-foreground">
            Manage your branches, warehouses, and store locations
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Filial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Filial</DialogTitle>
              <DialogDescription>
                Create a new branch, warehouse, or store location.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Downtown Store"
                    value={newFilial.name}
                    onChange={(e) =>
                      setNewFilial({ ...newFilial, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={newFilial.type}
                    onValueChange={(value) =>
                      setNewFilial({
                        ...newFilial,
                        type: value as "warehouse" | "retail" | "online",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warehouse">Warehouse</SelectItem>
                      <SelectItem value="retail">Retail Store</SelectItem>
                      <SelectItem value="online">Online Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  placeholder="Street address"
                  value={newFilial.address}
                  onChange={(e) =>
                    setNewFilial({ ...newFilial, address: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="Tashkent"
                    value={newFilial.city}
                    onChange={(e) =>
                      setNewFilial({ ...newFilial, city: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="Uzbekistan"
                    value={newFilial.country}
                    onChange={(e) =>
                      setNewFilial({ ...newFilial, country: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+998 71 123 4567"
                    value={newFilial.phone}
                    onChange={(e) =>
                      setNewFilial({ ...newFilial, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="store@company.uz"
                    value={newFilial.email}
                    onChange={(e) =>
                      setNewFilial({ ...newFilial, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager">Manager *</Label>
                <Input
                  id="manager"
                  placeholder="John Smith"
                  value={newFilial.manager}
                  onChange={(e) =>
                    setNewFilial({ ...newFilial, manager: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newFilial.status}
                    onValueChange={(value) =>
                      setNewFilial({
                        ...newFilial,
                        status: value as "active" | "inactive" | "maintenance",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="0"
                    placeholder="500"
                    value={newFilial.capacity}
                    onChange={(e) =>
                      setNewFilial({
                        ...newFilial,
                        capacity: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentStaff">Current Staff</Label>
                  <Input
                    id="currentStaff"
                    type="number"
                    min="0"
                    placeholder="5"
                    value={newFilial.currentStaff}
                    onChange={(e) =>
                      setNewFilial({
                        ...newFilial,
                        currentStaff: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="openingHours">Opening Hours</Label>
                <Input
                  id="openingHours"
                  placeholder="09:00 - 18:00"
                  value={newFilial.openingHours}
                  onChange={(e) =>
                    setNewFilial({ ...newFilial, openingHours: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={addFilial}>
                  Add Filial
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Filials</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filials.length}</div>
            <p className="text-xs text-muted-foreground">
              {filials.filter((f) => f.status === "active").length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retail Stores</CardTitle>
            <Store className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filials.filter((f) => f.type === "retail").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Customer-facing locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warehouses</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {filials.filter((f) => f.type === "warehouse").length}
            </div>
            <p className="text-xs text-muted-foreground">Storage facilities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <User className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {filials.reduce((sum, f) => sum + f.currentStaff, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all locations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filials List */}
      <Card>
        <CardHeader>
          <CardTitle>Filials & Branches</CardTitle>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search filials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="warehouse">Warehouse</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="text-sm text-muted-foreground">
              Loading filials...
            </div>
          )}
          {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name & Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFilials.map((filial) => (
                <TableRow key={filial.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{filial.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {filial.city}, {filial.country}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(filial.type)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {getManagerDisplay(filial.manager)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="font-medium">{filial.currentStaff}</span>
                      {filial.capacity > 0 && (
                        <span className="text-muted-foreground">
                          /{filial.capacity}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(filial.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      {filial.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span className="text-xs">{filial.phone}</span>
                        </div>
                      )}
                      {filial.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="text-xs">{filial.email}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFilial(filial);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingFilial(filial);
                          setNewFilial({
                            name: filial.name,
                            type: filial.type,
                            address: filial.address,
                            city: filial.city,
                            country: filial.country,
                            phone: filial.phone,
                            email: filial.email,
                            manager: filial.manager,
                            status: filial.status,
                            openingHours: filial.openingHours,
                            capacity: filial.capacity,
                            currentStaff: filial.currentStaff,
                          });
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteFilial(filial.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Filial Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Filial Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this location
            </DialogDescription>
          </DialogHeader>
          {selectedFilial && (
            <DetailCard
              title={selectedFilial.name}
              subtitle="Complete information about this location"
              left={[
                { label: "Type", value: getTypeBadge(selectedFilial.type) },
                {
                  label: "Address",
                  value: `${selectedFilial.address}, ${selectedFilial.city}, ${selectedFilial.country}`,
                },
              ]}
              right={[
                {
                  label: "Status",
                  value: getStatusBadge(selectedFilial.status),
                },
                {
                  label: "Contact",
                  value: (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Manager: {getManagerDisplay(selectedFilial.manager)}
                        </span>
                      </div>
                      {selectedFilial.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {selectedFilial.phone}
                          </span>
                        </div>
                      )}
                      {selectedFilial.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {selectedFilial.email}
                          </span>
                        </div>
                      )}
                    </div>
                  ),
                },
              ]}
              stats={[
                { label: "Current Staff", value: selectedFilial.currentStaff },
                { label: "Capacity", value: selectedFilial.capacity || "N/A" },
              ]}
            >
              <div>
                <div className="text-xs text-muted-foreground mb-2">
                  Products in this filial
                </div>
                {isFilialProductsLoading ? (
                  <div className="text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : filialProductsError ? (
                  <div className="text-sm text-destructive">
                    {filialProductsError}
                  </div>
                ) : filialProducts.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No products found in this filial.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Quantity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filialProducts.map((fp) => (
                          <TableRow key={fp.id}>
                            <TableCell>
                              <div className="font-medium">
                                {fp.product.name}
                              </div>
                            </TableCell>
                            <TableCell>{fp.product.sku}</TableCell>
                            <TableCell>
                              {formatPrice(fp.product.sellingPrice)}
                            </TableCell>
                            <TableCell>{fp.count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground border-t pt-3 mt-3">
                <div>📅 Created: {selectedFilial.createdAt}</div>
                <div>🔄 Updated: {selectedFilial.updatedAt}</div>
              </div>
            </DetailCard>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Filial Dialog - Similar structure to Add Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Filial</DialogTitle>
            <DialogDescription>Update filial information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Same form structure as Add Dialog but with edit functionality */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Name *</Label>
                <Input
                  id="editName"
                  placeholder="Downtown Store"
                  value={newFilial.name}
                  onChange={(e) =>
                    setNewFilial({ ...newFilial, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editType">Type *</Label>
                <Select
                  value={newFilial.type}
                  onValueChange={(value) =>
                    setNewFilial({
                      ...newFilial,
                      type: value as "warehouse" | "retail" | "online",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                    <SelectItem value="retail">Retail Store</SelectItem>
                    <SelectItem value="online">Online Center</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editAddress">Address *</Label>
              <Input
                id="editAddress"
                placeholder="Street address"
                value={newFilial.address}
                onChange={(e) =>
                  setNewFilial({ ...newFilial, address: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editCity">City *</Label>
                <Input
                  id="editCity"
                  placeholder="Tashkent"
                  value={newFilial.city}
                  onChange={(e) =>
                    setNewFilial({ ...newFilial, city: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editManager">Manager *</Label>
                <Input
                  id="editManager"
                  placeholder="John Smith"
                  value={newFilial.manager}
                  onChange={(e) =>
                    setNewFilial({ ...newFilial, manager: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={editFilial}>
                Update Filial
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
