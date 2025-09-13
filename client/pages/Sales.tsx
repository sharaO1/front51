import { useState, useEffect } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  Search,
  ShoppingCart,
  Edit,
  Trash2,
  Filter,
  Eye,
  Download,
  Receipt,
  Calculator,
  Minus,
  DollarSign,
  X,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { API_BASE } from "@/lib/api";
import { useTranslation } from "react-i18next";

interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
  type: "retail" | "wholesale" | "distributor";
}

interface Product {
  id: string;
  name: string;
  unitPrice: number;
  category: string;
}

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  status: "active" | "inactive" | "terminated" | "on_leave";
  avatar?: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientType: "retail" | "wholesale" | "distributor";
  employeeId?: string;
  employeeName?: string;
  employeeAvatar?: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  paymentMethod: "cash" | "card" | "bank_transfer" | "credit";
  notes: string;
  borrow?: boolean;
  returnDate?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledDate?: string;
}

// Clients and products will be loaded from the backend API

const mockEmployees: Employee[] = [
  {
    id: "1",
    employeeId: "EMP001",
    firstName: "Sarah",
    lastName: "Chen",
    email: "sarah.chen@businesspro.com",
    department: "Sales",
    position: "Sales Manager",
    status: "active",
    avatar:
      "https://images.pexels.com/photos/25651531/pexels-photo-25651531.jpeg",
  },
  {
    id: "2",
    employeeId: "EMP002",
    firstName: "Michael",
    lastName: "Rodriguez",
    email: "michael.rodriguez@businesspro.com",
    department: "Sales",
    position: "Sales Representative",
    status: "active",
    avatar:
      "https://images.pexels.com/photos/3613388/pexels-photo-3613388.jpeg",
  },
  {
    id: "4",
    employeeId: "EMP004",
    firstName: "Jennifer",
    lastName: "Patel",
    email: "jennifer.patel@businesspro.com",
    department: "Sales",
    position: "Sales Representative",
    status: "active",
    avatar:
      "https://images.pexels.com/photos/7640433/pexels-photo-7640433.jpeg",
  },
];

const mockInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-001",
    clientId: "1",
    clientName: "Tech Solutions Ltd",
    clientEmail: "contact@techsolutions.com",
    clientType: "wholesale",
    employeeId: "1",
    employeeName: "Sarah Chen",
    employeeAvatar:
      "https://images.pexels.com/photos/25651531/pexels-photo-25651531.jpeg",
    date: "2024-01-15",
    dueDate: "2024-02-15",
    items: [
      {
        id: "1",
        productId: "1",
        productName: "iPhone 15 Pro",
        quantity: 10,
        unitPrice: 899,
        discount: 10,
        total: 8091,
      },
      {
        id: "2",
        productId: "2",
        productName: "MacBook Air M3",
        quantity: 5,
        unitPrice: 1299,
        discount: 5,
        total: 6170.25,
      },
    ],
    subtotal: 14261.25,
    taxRate: 8.5,
    taxAmount: 1212.21,
    discountAmount: 570.45,
    total: 14903.01,
    status: "paid",
    paymentMethod: "bank_transfer",
    notes: "Wholesale order with volume discount applied",
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-002",
    clientId: "2",
    clientName: "John Smith",
    clientEmail: "john.smith@email.com",
    clientType: "retail",
    employeeId: "2",
    employeeName: "Michael Rodriguez",
    employeeAvatar:
      "https://images.pexels.com/photos/3613388/pexels-photo-3613388.jpeg",
    date: "2024-01-20",
    dueDate: "2024-01-25",
    items: [
      {
        id: "1",
        productId: "3",
        productName: "Samsung Galaxy S24",
        quantity: 1,
        unitPrice: 899,
        discount: 0,
        total: 899,
      },
    ],
    subtotal: 899,
    taxRate: 8.5,
    taxAmount: 76.42,
    discountAmount: 0,
    total: 975.42,
    status: "sent",
    paymentMethod: "card",
    notes: "Retail purchase",
  },
];

export default function Sales() {
  const [invoices, setInvoices] = useState(mockInvoices);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceToCancel, setInvoiceToCancel] = useState<Invoice | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [useExistingClient, setUseExistingClient] = useState(true);
  const [forBorrow, setForBorrow] = useState(false);

  // Default return date for borrowed items: 7 days from today
  const defaultReturnDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const [borrowReturnDate, setBorrowReturnDate] =
    useState<string>(defaultReturnDate);

  // Real clients/products will be loaded from backend
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({
    clientId: "",
    clientName: "",
    clientEmail: "",
    clientType: "retail",
    employeeId: "",
    employeeName: "",
    items: [],
    taxRate: 0,
    discountAmount: 0,
    paymentMethod: "cash",
    notes: "",
  });
  const [currentItem, setCurrentItem] = useState<Partial<InvoiceItem>>({
    productId: "",
    productName: "",
    quantity: 1,
    unitPrice: 0,
    discount: 0,
  });
  const { toast } = useToast();
  const { t } = useTranslation();

  const clearCurrentItem = () => {
    setCurrentItem({
      productId: "",
      productName: "",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
    });
  };

  const clearNewInvoice = () => {
    setNewInvoice({
      clientId: "",
      clientName: "",
      clientEmail: "",
      clientType: "retail",
      employeeId: "",
      employeeName: "",
      items: [],
      taxRate: 0,
      discountAmount: 0,
      paymentMethod: "cash",
      notes: "",
    });
    clearCurrentItem();
    setUseExistingClient(true);
    setForBorrow(false);
    setBorrowReturnDate(defaultReturnDate);
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.employeeName &&
        invoice.employeeName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;

    // Date filtering logic
    let matchesDate = true;
    if (dateFilter !== "all") {
      const invoiceDate = new Date(invoice.date);
      const today = new Date();

      switch (dateFilter) {
        case "today":
          matchesDate = invoiceDate.toDateString() === today.toDateString();
          break;
        case "yesterday":
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          matchesDate = invoiceDate.toDateString() === yesterday.toDateString();
          break;
        case "this_week":
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          matchesDate = invoiceDate >= weekStart && invoiceDate <= today;
          break;
        case "this_month":
          matchesDate =
            invoiceDate.getMonth() === today.getMonth() &&
            invoiceDate.getFullYear() === today.getFullYear();
          break;
        case "last_month":
          const lastMonth = new Date(today);
          lastMonth.setMonth(today.getMonth() - 1);
          matchesDate =
            invoiceDate.getMonth() === lastMonth.getMonth() &&
            invoiceDate.getFullYear() === lastMonth.getFullYear();
          break;
        case "custom":
          if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Include the entire end date
            matchesDate = invoiceDate >= start && invoiceDate <= end;
          }
          break;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            {t("status.draft")}
          </Badge>
        );
      case "sent":
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            {t("status.sent")}
          </Badge>
        );
      case "paid":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            {t("status.paid")}
          </Badge>
        );
      case "overdue":
        return <Badge variant="destructive">{t("status.overdue")}</Badge>;
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            {t("status.cancelled")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{t("common.unknown")}</Badge>;
    }
  };

  const calculateItemTotal = (item: Partial<InvoiceItem>) => {
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;
    const discount = item.discount || 0;
    const subtotal = quantity * unitPrice;
    const discountAmount = (subtotal * discount) / 100;
    return subtotal - discountAmount;
  };

  const calculateInvoiceTotal = (
    items: InvoiceItem[],
    taxRate: number = 0,
    discountAmount: number = 0,
  ) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount - discountAmount;
    return { subtotal, taxAmount, total };
  };

  const addItemToInvoice = () => {
    if (!currentItem.productId || !currentItem.quantity) {
      toast({
        title: "Error",
        description: "Please select a product and enter quantity",
        variant: "destructive",
      });
      return;
    }

    const product = products.find((p) => p.id === currentItem.productId);
    if (!product) {
      toast({
        title: "Error",
        description: "Selected product not found",
        variant: "destructive",
      });
      return;
    }

    const item: InvoiceItem = {
      id: Date.now().toString(),
      productId: currentItem.productId!,
      productName: currentItem.productName!,
      quantity: currentItem.quantity!,
      unitPrice: currentItem.unitPrice!,
      discount: currentItem.discount || 0,
      total: calculateItemTotal(currentItem),
    };

    const updatedItems = [...(newInvoice.items || []), item];
    const { subtotal, taxAmount, total } = calculateInvoiceTotal(
      updatedItems,
      newInvoice.taxRate,
      newInvoice.discountAmount,
    );

    setNewInvoice({
      ...newInvoice,
      items: updatedItems,
      subtotal,
      taxAmount,
      total,
    });

    clearCurrentItem();

    toast({
      title: "Product added",
      description: `${item.productName} has been added to the invoice.`,
    });
  };

  const removeItemFromInvoice = (itemId: string) => {
    const item = newInvoice.items?.find((i) => i.id === itemId);
    const updatedItems = (newInvoice.items || []).filter(
      (item) => item.id !== itemId,
    );
    const { subtotal, taxAmount, total } = calculateInvoiceTotal(
      updatedItems,
      newInvoice.taxRate,
      newInvoice.discountAmount,
    );

    setNewInvoice({
      ...newInvoice,
      items: updatedItems,
      subtotal,
      taxAmount,
      total,
    });

    toast({
      title: "Product removed",
      description: `${item?.productName} has been removed from the invoice.`,
    });
  };

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const count = invoices.length + 1;
    return `INV-${year}-${count.toString().padStart(3, "0")}`;
  };

  const createInvoice = () => {
    // If this invoice is for borrow, client is required
    if (forBorrow) {
      if (
        useExistingClient &&
        (!newInvoice.clientId || newInvoice.clientId === "")
      ) {
        toast({
          title: "Error",
          description: "Please select a client for borrowed items",
          variant: "destructive",
        });
        return;
      }
      if (
        !useExistingClient &&
        (!newInvoice.clientName || newInvoice.clientName.trim() === "")
      ) {
        toast({
          title: "Error",
          description: "Please enter client name for borrowed items",
          variant: "destructive",
        });
        return;
      }

      if (!borrowReturnDate || borrowReturnDate.trim() === "") {
        toast({
          title: "Error",
          description: "Please select a return date for borrowed items",
          variant: "destructive",
        });
        return;
      }
    }

    if (!newInvoice.items?.length) {
      toast({
        title: "Error",
        description: "Please add at least one item to the invoice",
        variant: "destructive",
      });
      return;
    }

    const invoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: generateInvoiceNumber(),
      clientId: newInvoice.clientId || "",
      clientName: newInvoice.clientName || "",
      clientEmail: newInvoice.clientEmail || "",
      clientType: newInvoice.clientType || "retail",
      employeeId: newInvoice.employeeId,
      employeeName: newInvoice.employeeName,
      date: new Date().toISOString().split("T")[0],
      dueDate: "",
      items: newInvoice.items!,
      subtotal: newInvoice.subtotal ?? 0,
      taxRate: newInvoice.taxRate ?? 0,
      taxAmount: newInvoice.taxAmount ?? 0,
      discountAmount: newInvoice.discountAmount || 0,
      total: newInvoice.total || 0,
      status: "draft",
      paymentMethod: newInvoice.paymentMethod || "cash",
      notes: newInvoice.notes || "",
      borrow: forBorrow,
      returnDate: forBorrow ? borrowReturnDate : undefined,
    };

    setInvoices([invoice, ...invoices]);
    clearNewInvoice();
    setIsCreateDialogOpen(false);

    toast({
      title: "Invoice created",
      description: `Invoice ${invoice.invoiceNumber} has been created successfully.`,
    });
  };

  const openCancelDialog = (invoice: Invoice) => {
    setInvoiceToCancel(invoice);
    setCancellationReason("");
    setIsCancelDialogOpen(true);
  };

  const cancelInvoice = () => {
    if (!invoiceToCancel || !cancellationReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a cancellation reason",
        variant: "destructive",
      });
      return;
    }

    const updatedInvoice = {
      ...invoiceToCancel,
      status: "cancelled" as any,
      cancellationReason: cancellationReason.trim(),
      cancelledBy: "Current User", // In a real app, this would be the actual user
      cancelledDate: new Date().toISOString().split("T")[0],
    };

    setInvoices(
      invoices.map((inv) =>
        inv.id === invoiceToCancel.id ? updatedInvoice : inv,
      ),
    );

    setIsCancelDialogOpen(false);
    setInvoiceToCancel(null);
    setCancellationReason("");

    toast({
      title: "Invoice cancelled",
      description: `Invoice ${invoiceToCancel.invoiceNumber} has been cancelled with reason: ${cancellationReason.trim()}`,
    });
  };

  const updateInvoiceStatus = (invoiceId: string, newStatus: string) => {
    setInvoices(
      invoices.map((inv) =>
        inv.id === invoiceId ? { ...inv, status: newStatus as any } : inv,
      ),
    );

    toast({
      title: "Status updated",
      description: `Invoice status changed to ${newStatus}.`,
    });
  };

  const getSalesEmployees = () => {
    return mockEmployees.filter(
      (emp) => emp.department === "Sales" && emp.status === "active",
    );
  };

  // Load clients and products from backend (best-effort; fall back to empty arrays)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/clients`);
        const data = await res.json().catch(() => null);
        if (mounted && res.ok && data && data.result) {
          const normalized = data.result.map((c: any) => ({
            id: c.id,
            name: c.userName || c.name || "",
            email: c.email || "",
            type: (c.type || "retail").toLowerCase(),
          }));
          setClients(normalized);
        }
      } catch (e) {
        console.warn("Failed to load clients", e);
      }

      try {
        const res = await fetch(`${API_BASE}/products`);
        const data = await res.json().catch(() => null);
        if (mounted && res.ok && data && data.result) {
          const normalized = data.result.map((p: any) => {
            const rawPriceCandidates = [
              p.unitPrice,
              p.price,
              p.sellingPrice,
              p.selling_price,
              p.retailPrice,
              p.sellPrice,
              p.salePrice,
              p.cost,
              p.value,
              p.amount,
              // nested patterns
              p?.price?.amount,
              p?.sellingPrice?.amount,
              p?.selling_price?.amount,
            ];
            let parsedPrice = 0;
            for (const cand of rawPriceCandidates) {
              if (cand === undefined || cand === null) continue;
              const num =
                typeof cand === "string"
                  ? parseFloat(cand.replace(/[^0-9.-]+/g, ""))
                  : Number(cand);
              if (!Number.isNaN(num) && num !== 0) {
                parsedPrice = num;
                break;
              }
              // prefer a zero if that's the only numeric value found
              if (!Number.isNaN(num) && parsedPrice === 0) parsedPrice = num;
            }

            return {
              id: p.id,
              name: p.name || p.title || "",
              unitPrice: parsedPrice,
              category: p.category || "",
            };
          });
          setProducts(normalized);
        }
      } catch (e) {
        console.warn("Failed to load products", e);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("sales.title")}</h1>
          <p className="text-muted-foreground">{t("sales.subtitle")}</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("sales.new_invoice")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("sales.create_new_invoice")}</DialogTitle>
              <DialogDescription>
                {t("sales.generate_invoice")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Client Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="existing-client"
                    name="client-type"
                    checked={useExistingClient}
                    onChange={() => setUseExistingClient(true)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="existing-client">{t("sales.select_existing_client")}</Label>
                  <input
                    type="radio"
                    id="new-client"
                    name="client-type"
                    checked={!useExistingClient}
                    onChange={() => setUseExistingClient(false)}
                    className="h-4 w-4 ml-4"
                  />
                  <Label htmlFor="new-client">{t("sales.enter_new_client")}</Label>

                  <label className="ml-4 flex items-center space-x-2 text-sm">
                    <input
                      id="for-borrow"
                      type="checkbox"
                      checked={forBorrow}
                      onChange={(e) => setForBorrow(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span>{t("sales.for_borrow")}</span>
                  </label>
                </div>

                {useExistingClient ? (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client">
                        {forBorrow ? "Select Client *" : "Select Client"}
                      </Label>
                      <Select
                        value={newInvoice.clientId || ""}
                        onValueChange={(value) => {
                          const selectedClient = clients.find(
                            (c) => c.id === value,
                          );
                          if (selectedClient) {
                            setNewInvoice({
                              ...newInvoice,
                              clientId: selectedClient.id,
                              clientName: selectedClient.name,
                              clientEmail: selectedClient.email || "",
                              clientType: selectedClient.type || "retail",
                            });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {client.name}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {client.email} • {client.type}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="clientName">
                        {forBorrow ? "Client Name *" : "Client Name"}
                      </Label>
                      <Input
                        id="clientName"
                        placeholder="Enter client name"
                        value={newInvoice.clientName || ""}
                        onChange={(e) =>
                          setNewInvoice({
                            ...newInvoice,
                            clientName: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Return date for borrowed items */}
                {forBorrow && (
                  <div className="mt-3 w-1/3">
                    <Label htmlFor="return-date">Return Date *</Label>
                    <Input
                      id="return-date"
                      type="date"
                      value={borrowReturnDate}
                      onChange={(e) => setBorrowReturnDate(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Employee and Payment Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={newInvoice.paymentMethod}
                    onValueChange={(value) =>
                      setNewInvoice({
                        ...newInvoice,
                        paymentMethod: value as any,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="bank_transfer">
                        Bank Transfer
                      </SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Add Item Section */}
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Invoice Item
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product">Select Product *</Label>
                    <Select
                      value={currentItem.productId || ""}
                      onValueChange={(value) => {
                        const selectedProduct = products.find(
                          (p) => p.id === value,
                        );
                        if (selectedProduct) {
                          setCurrentItem({
                            ...currentItem,
                            productId: selectedProduct.id,
                            productName: selectedProduct.name,
                            unitPrice: selectedProduct.unitPrice,
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => {
                          const price = Number(product.unitPrice) || 0;
                          return (
                            <SelectItem key={product.id} value={product.id}>
                              <div className="flex flex-col">
                                <span className="font-medium capitalize">
                                  {product.name}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {`$${price.toFixed(2)}`}
                                  {product.category ? (
                                    <span className="ml-2">
                                      • {product.category}
                                    </span>
                                  ) : null}
                                </span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={currentItem.quantity}
                      onChange={(e) =>
                        setCurrentItem({
                          ...currentItem,
                          quantity: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={currentItem.discount}
                      onChange={(e) =>
                        setCurrentItem({
                          ...currentItem,
                          discount: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total</Label>
                    <div className="h-10 px-3 py-2 border rounded-md bg-muted flex items-center font-medium">
                      ${calculateItemTotal(currentItem).toFixed(2)}
                    </div>
                  </div>
                </div>
                {currentItem.productId && (
                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <strong>Product:</strong> {currentItem.productName}
                      </div>
                      <div>
                        <strong>Unit Price:</strong> $
                        {currentItem.unitPrice?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={addItemToInvoice}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("sales.add_item")}
                  </Button>
                  <Button variant="outline" onClick={clearCurrentItem}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel Item
                  </Button>
                </div>
              </div>

              {/* Invoice Items */}
              {newInvoice.items && newInvoice.items.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Invoice Items</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("sales.product_name")}</TableHead>
                        <TableHead>{t("sales.qty")}</TableHead>
                        <TableHead>{t("sales.unit_price")}</TableHead>
                        <TableHead>{t("sales.discount")}</TableHead>
                        <TableHead>{t("common.total")}</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {newInvoice.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                          <TableCell>{item.discount}%</TableCell>
                          <TableCell>${item.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeItemFromInvoice(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Invoice Totals */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="taxRate">Tax Rate (%)</Label>
                        <Input
                          id="taxRate"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={newInvoice.taxRate}
                          onChange={(e) => {
                            const taxRate = parseFloat(e.target.value) || 0;
                            const { subtotal, taxAmount, total } =
                              calculateInvoiceTotal(
                                newInvoice.items!,
                                taxRate,
                                newInvoice.discountAmount,
                              );
                            setNewInvoice({
                              ...newInvoice,
                              taxRate,
                              taxAmount,
                              total,
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discountAmount">
                          Additional Discount ($)
                        </Label>
                        <Input
                          id="discountAmount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={newInvoice.discountAmount}
                          onChange={(e) => {
                            const discountAmount =
                              parseFloat(e.target.value) || 0;
                            const { subtotal, taxAmount, total } =
                              calculateInvoiceTotal(
                                newInvoice.items!,
                                newInvoice.taxRate,
                                discountAmount,
                              );
                            setNewInvoice({
                              ...newInvoice,
                              discountAmount,
                              total,
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Final Total</Label>
                        <div className="h-10 px-3 py-2 border rounded-md bg-primary/10 flex items-center font-semibold">
                          ${(newInvoice.total || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>
                        Subtotal: ${(newInvoice.subtotal || 0).toFixed(2)}
                      </div>
                      <div>
                        Tax ({newInvoice.taxRate}%): $
                        {(newInvoice.taxAmount || 0).toFixed(2)}
                      </div>
                      <div>
                        Discount: -$
                        {(newInvoice.discountAmount || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes for the invoice"
                  value={newInvoice.notes}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" onClick={createInvoice}>
                  <Receipt className="mr-2 h-4 w-4" />
                  Create Invoice
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    clearNewInvoice();
                    setIsCreateDialogOpen(false);
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel Invoice
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
            <CardTitle className="text-sm font-medium">{t("sales.total_invoices")}</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter((i) => i.status === "paid").length} paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("sales.total_revenue")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {invoices
                .filter((i) => i.status === "paid")
                .reduce((sum, i) => sum + i.total, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{t("sales.from_paid_invoices")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("sales.pending_amount")}</CardTitle>
            <Calculator className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {invoices
                .filter((i) => i.status === "sent")
                .reduce((sum, i) => sum + i.total, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{t("sales.awaiting_payment")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("status.cancelled")}</CardTitle>
            <X className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices.filter((i) => i.status === "cancelled").length}
            </div>
            <p className="text-xs text-muted-foreground">{t("sales.cancelled_invoices")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>{t("sales.sales_invoices")}</CardTitle>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("sales.search_invoices")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder={t("common.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("employees.all_status")}</SelectItem>
                  <SelectItem value="draft">{t("status.draft")}</SelectItem>
                  <SelectItem value="sent">{t("status.sent")}</SelectItem>
                  <SelectItem value="paid">{t("status.paid")}</SelectItem>
                  <SelectItem value="overdue">{t("status.overdue")}</SelectItem>
                  <SelectItem value="cancelled">{t("status.cancelled")}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[150px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder={t("sales.date_range")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("sales.all_dates")}</SelectItem>
                  <SelectItem value="today">{t("sales.today")}</SelectItem>
                  <SelectItem value="yesterday">{t("sales.yesterday")}</SelectItem>
                  <SelectItem value="this_week">{t("sales.this_week")}</SelectItem>
                  <SelectItem value="this_month">{t("sales.this_month")}</SelectItem>
                  <SelectItem value="last_month">{t("sales.last_month")}</SelectItem>
                  <SelectItem value="custom">{t("sales.custom_range")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Range */}
            {dateFilter === "custom" && (
              <div className="flex gap-4 items-center p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Label htmlFor="startDate" className="text-sm font-medium">{t("sales.from")}:</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-auto"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="endDate" className="text-sm font-medium">{t("sales.to")}:</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-auto"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDateFilter("all");
                    setStartDate("");
                    setEndDate("");
                  }}
>
                  {t("common.clear")}
                </Button>
              </div>
            )}

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {t("sales.showing_invoices", { count: filteredInvoices.length, total: invoices.length })}
                {dateFilter !== "all" && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {dateFilter === "custom" && startDate && endDate
                      ? `${startDate} ${t("sales.to")} ${endDate}`
                      : t(`sales.${dateFilter}`)}
                  </span>
                )}
              </span>
              <span>
                {t("sales.total_value")}: $
                {filteredInvoices
                  .reduce((sum, inv) => sum + inv.total, 0)
                  .toLocaleString()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("sales.invoice_number")}</TableHead>
                <TableHead>{t("sales.client")}</TableHead>
                <TableHead>{t("employees.employee")}</TableHead>
                <TableHead>{t("common.date")}</TableHead>
                <TableHead>{t("common.amount")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    {invoice.invoiceNumber}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{invoice.clientName}</div>
                      <div className="text-sm text-muted-foreground">
                        {invoice.clientEmail}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {invoice.employeeName ? (
                        <>
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={invoice.employeeAvatar}
                              alt={invoice.employeeName}
                            />
                            <AvatarFallback className="text-xs">
                              {invoice.employeeName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {invoice.employeeName}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {t("sales.no_employee")}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{invoice.date}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      ${invoice.total.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t(`sales.${invoice.paymentMethod}`)}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Invoice downloaded",
                            description:
                              "Invoice PDF has been generated and downloaded.",
                          });
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {invoice.status === "draft" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateInvoiceStatus(invoice.id, "sent")
                            }
                          >
                            {t("sales.send")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openCancelDialog(invoice)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {invoice.status === "sent" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateInvoiceStatus(invoice.id, "paid")
                            }
                            className="text-green-600"
                          >
                            {t("sales.mark_paid")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openCancelDialog(invoice)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Invoice Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              {t("sales.invoice_details")}: {selectedInvoice?.invoiceNumber}
            </DialogTitle>
            <DialogDescription>
              {t("sales.complete_invoice_info")}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-2 gap-6 p-4 bg-muted rounded-lg">
                <div>
                  <h3 className="font-semibold mb-2">{t("sales.invoice_information")}</h3>
                  <div className="space-y-1 text-sm">
                    <div>{t("sales.invoice_number")}: {selectedInvoice.invoiceNumber}</div>
                    <div>{t("common.date")}: {selectedInvoice.date}</div>
                    <div>{t("common.status")}: {getStatusBadge(selectedInvoice.status)}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{t("sales.client_information")}</h3>
                  <div className="space-y-1 text-sm">
                    <div>{selectedInvoice.clientName}</div>
                    <div>{selectedInvoice.clientEmail}</div>
                    <div className="capitalize">
                      {t(`clients.${selectedInvoice.clientType}`)}
                    </div>
                    <div className="capitalize">
                      {t("sales.payment")}: {t(`sales.${selectedInvoice.paymentMethod}`)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Employee Information */}
              {selectedInvoice.employeeName && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold mb-2">{t("employees.sales_team")}</h3>
                  <div className="text-sm">{selectedInvoice.employeeName}</div>
                </div>
              )}

              {/* Invoice Items */}
              <div>
                <h3 className="font-semibold mb-4">Invoice Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("sales.product_name")}</TableHead>
                      <TableHead>{t("sales.qty")}</TableHead>
                      <TableHead>{t("sales.unit_price")}</TableHead>
                      <TableHead>{t("sales.discount")}</TableHead>
                      <TableHead>{t("common.total")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell>{item.discount}%</TableCell>
                        <TableCell>${item.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Invoice Totals */}
              <div className="border rounded-lg p-4 space-y-2 bg-muted">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({selectedInvoice.taxRate}%):</span>
                  <span>${selectedInvoice.taxAmount.toFixed(2)}</span>
                </div>
                {selectedInvoice.discountAmount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount:</span>
                    <span>-${selectedInvoice.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${selectedInvoice.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div>
                  <h3 className="font-semibold mb-2">{t("common.notes")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedInvoice.notes}
                  </p>
                </div>
              )}

              {/* Cancellation Information */}
              {selectedInvoice.status === "cancelled" &&
                selectedInvoice.cancellationReason && (
                  <div className="border rounded-lg p-4 bg-red-50">
                    <h3 className="font-semibold mb-2 text-red-800">{t("sales.cancellation_details")}</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">{t("sales.reason")}:</span>
                        <p className="text-red-700 mt-1">
                          {selectedInvoice.cancellationReason}
                        </p>
                      </div>
                      {selectedInvoice.cancelledBy && (
                        <div>
                          <span className="font-medium">{t("sales.cancelled_by")}:</span>{" "}
                          {selectedInvoice.cancelledBy}
                        </div>
                      )}
                      {selectedInvoice.cancelledDate && (
                        <div>
                          <span className="font-medium">{t("sales.cancelled_on")}:</span>{" "}
                          {selectedInvoice.cancelledDate}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    // Generate PDF download functionality
                    const downloadPDF = () => {
                      // Create PDF content
                      const pdfContent = `
INVOICE ${selectedInvoice.invoiceNumber}
========================================

Client Information:
------------------
Name: ${selectedInvoice.clientName}
Email: ${selectedInvoice.clientEmail}
Type: ${selectedInvoice.clientType}
Payment Method: ${selectedInvoice.paymentMethod.replace("_", " ")}

Invoice Details:
---------------
Date: ${selectedInvoice.date}
Status: ${selectedInvoice.status}
${selectedInvoice.employeeName ? `Sales Employee: ${selectedInvoice.employeeName}` : ""}

Items:
------
${selectedInvoice.items
  .map(
    (item, index) =>
      `${index + 1}. ${item.productName}
   Quantity: ${item.quantity}
   Unit Price: $${item.unitPrice.toFixed(2)}
   Discount: ${item.discount}%
   Total: $${item.total.toFixed(2)}`,
  )
  .join("\n\n")}

Summary:
--------
Subtotal: $${selectedInvoice.subtotal.toFixed(2)}
Tax (${selectedInvoice.taxRate}%): $${selectedInvoice.taxAmount.toFixed(2)}
${selectedInvoice.discountAmount > 0 ? `Discount: -$${selectedInvoice.discountAmount.toFixed(2)}` : ""}
TOTAL: $${selectedInvoice.total.toFixed(2)}

${selectedInvoice.notes ? `Notes: ${selectedInvoice.notes}` : ""}

Generated on: ${new Date().toLocaleString()}
                      `;

                      // Create and download file
                      const blob = new Blob([pdfContent], {
                        type: "text/plain",
                      });
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `invoice-${selectedInvoice.invoiceNumber}.txt`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);
                    };

                    downloadPDF();

                    toast({
                      title: t("sales.toast.invoice_downloaded_title"),
                      description: t("sales.toast.invoice_downloaded_desc_number", { number: selectedInvoice.invoiceNumber }),
                    });
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {t("sales.download_pdf")}
                </Button>
                {selectedInvoice.status !== "cancelled" &&
                  selectedInvoice.status !== "paid" && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        openCancelDialog(selectedInvoice);
                        setIsViewDialogOpen(false);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  )}
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Invoice Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              {t("sales.cancel_invoice")}
            </DialogTitle>
            <DialogDescription>{t("sales.cancel_invoice_desc", { number: invoiceToCancel?.invoiceNumber })}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cancellationReason">{t("sales.cancellation_reason_required")}</Label>
              <Textarea
                id="cancellationReason"
                placeholder={t("sales.cancellation_reason_placeholder")}
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={cancelInvoice}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel Invoice
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCancelDialogOpen(false);
                  setInvoiceToCancel(null);
                  setCancellationReason("");
                }}
              >
                {t("sales.keep_invoice")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
