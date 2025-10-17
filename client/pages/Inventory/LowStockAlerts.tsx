import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
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
  AlertTriangle,
  AlertCircle,
  TrendingDown,
  Search,
  Filter,
  Download,
  RefreshCw,
  CheckCircle2,
  Trash2,
  ShoppingCart,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LowStockAlert {
  id: string;
  productId: string;
  productName: string;
  category: string;
  currentStock: number;
  minRequired: number;
  maxStock: number;
  unitPrice: number;
  status: "critical" | "warning" | "moderate";
  stockPercentage: number;
  daysToStockout?: number;
  reorderQuantity: number;
  supplier?: string;
  lastRestockDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface AlertSummary {
  total: number;
  critical: number;
  warning: number;
  moderate: number;
  totalProducts: number;
}

export default function LowStockAlerts() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [summary, setSummary] = useState<AlertSummary>({
    total: 0,
    critical: 0,
    warning: 0,
    moderate: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "critical" | "warning" | "moderate"
  >("all");
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(
    new Set()
  );

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/low-stock-alerts");
      if (!response.ok) throw new Error("Failed to fetch alerts");

      const data = await response.json();
      setAlerts(data.data || []);
      setSummary(data.summary || {});
      toast({
        title: "Alerts loaded",
        description: `Found ${data.data?.length || 0} low stock items`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load low stock alerts",
        variant: "destructive",
      });
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSearch =
        alert.productName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        alert.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || alert.status === statusFilter;

      const isNotDismissed = !dismissedAlerts.has(alert.id);

      return matchesSearch && matchesStatus && isNotDismissed;
    });
  }, [alerts, searchQuery, statusFilter, dismissedAlerts]);

  const handleAcknowledge = async (alertId: string) => {
    try {
      const response = await fetch(
        `/api/low-stock-alerts/${alertId}/acknowledge`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) throw new Error("Failed to acknowledge alert");

      toast({
        title: "Alert acknowledged",
        description: "You can restock this item.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to acknowledge alert",
        variant: "destructive",
      });
    }
  };

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts((prev) => {
      const newSet = new Set(prev);
      newSet.add(alertId);
      return newSet;
    });

    toast({
      title: "Alert dismissed",
      description: "This alert has been hidden from the list",
    });
  };

  const handleExportReport = () => {
    const csv =
      "Product Name,Category,Current Stock,Minimum Required,Status,Unit Price,Reorder Quantity\n" +
      filteredAlerts
        .map(
          (alert) =>
            `"${alert.productName}","${alert.category}",${alert.currentStock},${alert.minRequired},"${alert.status}",${alert.unitPrice},${alert.reorderQuantity}`
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `low-stock-alerts-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    toast({
      title: "Report exported",
      description: "Low stock alerts report downloaded successfully",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "moderate":
        return "bg-orange-100 text-orange-800 border-orange-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "critical":
        return <AlertTriangle className="h-4 w-4" />;
      case "warning":
        return <AlertCircle className="h-4 w-4" />;
      case "moderate":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("inventory.low_stock_alerts", "Low Stock Alerts")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t(
              "inventory.monitor_inventory_levels",
              "Monitor and manage products with low inventory levels"
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAlerts}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {t("common.refresh", "Refresh")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportReport}
            disabled={filteredAlerts.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {t("common.export", "Export")}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              {t("inventory.total_alerts", "Total Alerts")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("inventory.products_low_stock", "products with low stock")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              {t("inventory.critical", "Critical")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {summary.critical}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("inventory.immediate_action", "Immediate action needed")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              {t("inventory.warning", "Warning")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {summary.warning}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("inventory.plan_restock", "Plan restock soon")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <TrendingDown className="h-4 w-4 text-orange-500" />
              {t("inventory.moderate", "Moderate")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {summary.moderate}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("inventory.monitor_closely", "Monitor closely")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              {t("inventory.total_products", "Total Products")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("inventory.in_system", "In system")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t("common.filters", "Filters")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("common.search", "Search")}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t(
                    "inventory.search_products",
                    "Search products..."
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("inventory.alert_status", "Alert Status")}
              </label>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(
                    value as "all" | "critical" | "warning" | "moderate"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("common.all", "All")}
                  </SelectItem>
                  <SelectItem value="critical">
                    {t("inventory.critical", "Critical")}
                  </SelectItem>
                  <SelectItem value="warning">
                    {t("inventory.warning", "Warning")}
                  </SelectItem>
                  <SelectItem value="moderate">
                    {t("inventory.moderate", "Moderate")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t("inventory.alert_details", "Alert Details")}
          </CardTitle>
          <CardDescription>
            {filteredAlerts.length} {t("inventory.alerts", "alerts")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <div className="h-8 w-8 rounded-full border-4 border-primary border-r-transparent animate-spin mx-auto mb-2"></div>
                <p className="text-muted-foreground">
                  {t("common.loading", "Loading")}...
                </p>
              </div>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
              <p className="text-lg font-semibold">
                {t("inventory.no_alerts", "No low stock alerts")}
              </p>
              <p className="text-muted-foreground">
                {t(
                  "inventory.all_items_well_stocked",
                  "All items are well-stocked"
                )}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t("common.product", "Product")}
                    </TableHead>
                    <TableHead>
                      {t("inventory.category", "Category")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("inventory.current_stock", "Current Stock")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("inventory.minimum_required", "Minimum")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("inventory.reorder_qty", "Reorder Qty")}
                    </TableHead>
                    <TableHead>
                      {t("common.status", "Status")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("common.unit_price", "Unit Price")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("common.actions", "Actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.map((alert) => (
                    <TableRow key={alert.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {alert.productName}
                      </TableCell>
                      <TableCell className="text-sm">
                        {alert.category}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-semibold">
                            {alert.currentStock}
                          </span>
                          <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full transition-all",
                                alert.status === "critical"
                                  ? "bg-red-500"
                                  : alert.status === "warning"
                                    ? "bg-yellow-500"
                                    : "bg-orange-500"
                              )}
                              style={{
                                width: `${Math.min(
                                  (alert.currentStock /
                                    alert.minRequired) *
                                    100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {alert.minRequired}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {alert.reorderQuantity}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "gap-1 border",
                            getStatusColor(alert.status)
                          )}
                          variant="outline"
                        >
                          {getStatusIcon(alert.status)}
                          {t(
                            `inventory.${alert.status}`,
                            alert.status.charAt(0).toUpperCase() +
                              alert.status.slice(1)
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        ${alert.unitPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 h-8"
                            onClick={() => handleAcknowledge(alert.id)}
                            title={t(
                              "inventory.acknowledge_alert",
                              "Acknowledge alert"
                            )}
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 h-8"
                            onClick={() => handleDismiss(alert.id)}
                            title={t(
                              "inventory.dismiss_alert",
                              "Dismiss alert"
                            )}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
