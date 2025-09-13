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
import DetailCard from "@/components/DetailCard";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  Users,
  Edit,
  Trash2,
  Filter,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  AlertTriangle,
  Eye,
  Send,
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  type: "retail" | "wholesale" | "distributor";
  creditLimit: number;
  currentDebt: number;
  status: "active" | "inactive" | "overdue";
  totalPurchases: number;
  lastPurchase: string;
  notes: string;
}

import { API_BASE } from "@/lib/api";

export default function Clients() {
  const { t } = useTranslation();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: "",
    email: "",
    phone: "",
    address: "",
    type: "retail",
    creditLimit: 1000,
    notes: "",
  });
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch(`${API_BASE}/clients`);
        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.message || "Failed to fetch clients");
        }

        const normalizedClients: Client[] = data.result.map((c: any) => ({
          id: c.id,
          name: c.userName,
          email: c.email,
          phone: c.phone,
          address: c.address || "",
          type: c.type.toLowerCase() as "retail" | "wholesale" | "distributor",
          creditLimit: c.creditLimit,
          currentDebt: c.currentDebt,
          status: c.status.toLowerCase() as "active" | "inactive" | "overdue",
          totalPurchases: c.totalPurchases,
          lastPurchase: c.lastPurchase || "",
          notes: c.notes || "",
        }));

        setClients(normalizedClients);
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm);
    const matchesType = typeFilter === "all" || client.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || client.status === statusFilter;
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
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "retail":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Retail
          </Badge>
        );
      case "wholesale":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200"
          >
            Wholesale
          </Badge>
        );
      case "distributor":
        return (
          <Badge
            variant="outline"
            className="bg-orange-50 text-orange-700 border-orange-200"
          >
            Distributor
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.email || !newClient.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/clients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: newClient.name,
          email: newClient.email,
          phone: newClient.phone,
          address: newClient.address || "",
          type: (newClient.type || "RETAIL").toUpperCase(),
          creditLimit: newClient.creditLimit || 1000,
          notes: newClient.notes || "",
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Failed to add client");
      }

      const result = data.result;
      const client: Client = {
        id: result.id,
        name: result.userName,
        email: result.email,
        phone: result.phone,
        address: result.address || "",
        type: result.type.toLowerCase() as
          | "retail"
          | "wholesale"
          | "distributor",
        creditLimit: result.creditLimit,
        currentDebt: result.currentDebt,
        status: result.status.toLowerCase() as "active" | "inactive",
        totalPurchases: result.totalPurchases,
        lastPurchase: result.lastPurchase || "",
        notes: result.notes || "",
      };

      setClients((prev) => [...prev, client]);
      setNewClient({
        name: "",
        email: "",
        phone: "",
        address: "",
        type: "retail",
        creditLimit: 1000,
        notes: "",
      });
      setIsAddDialogOpen(false);

      toast({
        title: "Client added",
        description: `${client.name} has been added successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleEditClient = async () => {
    if (!selectedClient) return;

    try {
      const response = await fetch(`${API_BASE}/clients/${selectedClient.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: selectedClient.name,
          email: selectedClient.email,
          phone: selectedClient.phone,
          address: selectedClient.address,
          type: selectedClient.type.toUpperCase(),
          creditLimit: selectedClient.creditLimit,
          notes: selectedClient.notes,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Failed to update client");
      }

      const result = data.result;
      const updatedClient: Client = {
        id: result.id,
        name: result.userName,
        email: result.email,
        phone: result.phone,
        address: result.address || "",
        type: result.type.toLowerCase() as
          | "retail"
          | "wholesale"
          | "distributor",
        creditLimit: result.creditLimit,
        currentDebt: result.currentDebt,
        status: result.status.toLowerCase() as "active" | "inactive",
        totalPurchases: result.totalPurchases,
        lastPurchase: result.lastPurchase || "",
        notes: result.notes || "",
      };

      setClients((prev) =>
        prev.map((c) => (c.id === updatedClient.id ? updatedClient : c)),
      );

      setIsEditDialogOpen(false);
      setSelectedClient(null);

      toast({
        title: "Client updated",
        description: `${updatedClient.name} has been updated successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      const response = await fetch(`${API_BASE}/clients/${clientId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok || !data.ok || !data.result) {
        throw new Error(data.message || "Failed to delete client");
      }

      setClients((prev) => prev.filter((c) => c.id !== clientId));

      toast({
        title: "Client deleted",
        description: "Client has been removed from the system.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const sendReminder = (client: Client) => {
    toast({
      title: "Reminder sent",
      description: `Payment reminder sent to ${client.name} via email and SMS.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("clients.title")}</h1>
          <p className="text-muted-foreground">{t("clients.subtitle")}</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("clients.add_client")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("clients.add_new_client")}</DialogTitle>
              <DialogDescription>{t("clients.create_client_profile")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("clients.company_name")} *</Label>
                <Input
                  id="name"
                  placeholder={t("clients.enter_client_name")}
                  value={newClient.name}
                  onChange={(e) =>
                    setNewClient({ ...newClient, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("common.email")} *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("clients.client_email")}
                  value={newClient.email}
                  onChange={(e) =>
                    setNewClient({ ...newClient, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t("clients.phone_number")} *</Label>
                <Input
                  id="phone"
                  placeholder={t("clients.phone_number")}
                  value={newClient.phone}
                  onChange={(e) =>
                    setNewClient({ ...newClient, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t("common.address")}</Label>
                <Textarea
                  id="address"
                  placeholder={t("clients.full_address")}
                  value={newClient.address}
                  onChange={(e) =>
                    setNewClient({ ...newClient, address: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">{t("clients.client_type")}</Label>
                  <Select
                    value={newClient.type}
                    onValueChange={(value) =>
                      setNewClient({ ...newClient, type: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">{t("clients.retail")}</SelectItem>
                      <SelectItem value="wholesale">{t("clients.wholesale")}</SelectItem>
                      <SelectItem value="distributor">{t("clients.distributor")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditLimit">{t("clients.credit_limit")}</Label>
                  <Input
                    id="creditLimit"
                    type="number"
                    placeholder="1000"
                    value={newClient.creditLimit}
                    onChange={(e) =>
                      setNewClient({
                        ...newClient,
                        creditLimit: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">{t("common.notes")}</Label>
                <Textarea
                  id="notes"
                  placeholder={t("clients.additional_notes")}
                  value={newClient.notes}
                  onChange={(e) =>
                    setNewClient({ ...newClient, notes: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleAddClient}>
                  {t("clients.add_client")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  {t("common.cancel")}
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
            <CardTitle className="text-sm font-medium">{t("clients.total_clients")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">
              {clients.filter((c) => c.status === "active").length} {t("status.active")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("clients.total_debt")}</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {clients
                .reduce((sum, c) => sum + c.currentDebt, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{t("clients.across_all_clients")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("clients.overdue_payments")}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.filter((c) => c.status === "overdue").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("clients.clients_need_followup")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.total_sales")}</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {clients
                .reduce((sum, c) => sum + c.totalPurchases, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{t("clients.all_time_revenue")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>{t("clients.client_directory")}</CardTitle>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("clients.search_clients")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder={t("clients.type")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("clients.all_types")}</SelectItem>
                <SelectItem value="retail">{t("clients.retail")}</SelectItem>
                <SelectItem value="wholesale">{t("clients.wholesale")}</SelectItem>
                <SelectItem value="distributor">{t("clients.distributor")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("common.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("clients.all_status")}</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("clients.client")}</TableHead>
                <TableHead>{t("clients.type")}</TableHead>
                <TableHead>{t("clients.contact")}</TableHead>
                <TableHead>{t("clients.debt")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {t("common.total")}: ${client.totalPurchases.toLocaleString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(client.type)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        {client.email}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {client.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        ${client.currentDebt.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t("clients.credit_limit")}: ${client.creditLimit.toLocaleString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(client.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedClient(client);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedClient(client);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {client.status === "overdue" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendReminder(client)}
                          className="text-orange-600"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClient(client.id)}
                        className="text-red-600"
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

      {/* View Client Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <DetailCard
              title={selectedClient.name}
              subtitle={`Complete information for ${selectedClient.name}`}
              left={[
                { label: "Type", value: getTypeBadge(selectedClient.type) },
                { label: "Email", value: selectedClient.email || "-" },
                { label: "Address", value: selectedClient.address || "-" },
                {
                  label: "Last Purchase",
                  value: selectedClient.lastPurchase || "Never",
                },
              ]}
              right={[
                { label: "Phone", value: selectedClient.phone || "-" },
                {
                  label: "Credit Limit",
                  value: `$${selectedClient.creditLimit.toLocaleString()}`,
                },
                {
                  label: "Current Debt",
                  value: `$${selectedClient.currentDebt.toLocaleString()}`,
                },
                {
                  label: "Total Purchases",
                  value: `$${selectedClient.totalPurchases.toLocaleString()}`,
                },
              ]}
              actions={
                <Button onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              }
            >
              <div>
                <div className="text-xs text-muted-foreground mb-1">Notes</div>
                <div className="text-sm">
                  {selectedClient.notes || "No notes"}
                </div>
              </div>
            </DetailCard>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>
              Update client information and settings.
            </DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="editName">Name / Company</Label>
                <Input
                  id="editName"
                  value={selectedClient.name}
                  onChange={(e) =>
                    setSelectedClient({
                      ...selectedClient,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPhone">Phone</Label>
                <Input
                  id="editPhone"
                  value={selectedClient.phone}
                  onChange={(e) =>
                    setSelectedClient({
                      ...selectedClient,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="editType">Type</Label>
                  <Select
                    value={selectedClient.type}
                    onValueChange={(value) =>
                      setSelectedClient({
                        ...selectedClient,
                        type: value as any,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">{t("clients.retail")}</SelectItem>
                      <SelectItem value="wholesale">{t("clients.wholesale")}</SelectItem>
                      <SelectItem value="distributor">{t("clients.distributor")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editStatus">Status</Label>
                  <Select
                    value={selectedClient.status}
                    onValueChange={(value) =>
                      setSelectedClient({
                        ...selectedClient,
                        status: value as any,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="editCreditLimit">Credit Limit</Label>
                  <Input
                    id="editCreditLimit"
                    type="number"
                    value={selectedClient.creditLimit}
                    onChange={(e) =>
                      setSelectedClient({
                        ...selectedClient,
                        creditLimit: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editDebt">Current Debt</Label>
                  <Input
                    id="editDebt"
                    type="number"
                    value={selectedClient.currentDebt}
                    onChange={(e) =>
                      setSelectedClient({
                        ...selectedClient,
                        currentDebt: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editNotes">Notes</Label>
                <Textarea
                  id="editNotes"
                  value={selectedClient.notes}
                  onChange={(e) =>
                    setSelectedClient({
                      ...selectedClient,
                      notes: e.target.value,
                    })
                  }
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleEditClient}>
                  Update Client
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
