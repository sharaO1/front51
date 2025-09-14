import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Package,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import UserCredentials from "@/components/UserCredentials";
import { useAuthStore } from "@/stores/authStore";
import { API_BASE } from "@/lib/api";
import { SalesSummaryResponse } from "@shared/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import AIChat from "@/components/AIChat";

const salesData = [
  { name: "Jan", sales: 4000, profit: 2400 },
  { name: "Feb", sales: 3000, profit: 1398 },
  { name: "Mar", sales: 2000, profit: 9800 },
  { name: "Apr", sales: 2780, profit: 3908 },
  { name: "May", sales: 1890, profit: 4800 },
  { name: "Jun", sales: 2390, profit: 3800 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const openChat = searchParams.get("chat") === "open";

  // If chat was opened via URL, clean the param so refresh doesn't auto-open
  useEffect(() => {
    if (openChat) {
      navigate("/dashboard", { replace: true });
    }
  }, [openChat, navigate]);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const accessToken = useAuthStore((s) => s.accessToken);

  const [salesSummary, setSalesSummary] = useState<
    SalesSummaryResponse["result"] | null
  >(null);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesError, setSalesError] = useState<string | null>(null);

  // Real total revenue computed from Transaction History (income)
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);

  // Live counts for dashboard
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [newProductsThisMonth, setNewProductsThisMonth] = useState<
    number | null
  >(null);
  const [activeClients, setActiveClients] = useState<number | null>(null);
  const [newClientsThisWeek, setNewClientsThisWeek] = useState<number | null>(
    null,
  );
  const [lowStockDynamic, setLowStockDynamic] = useState<
    { name: string; stock: number; minRequired: number }[]
  >([]);
  const [categoryDist, setCategoryDist] = useState<
    { name: string; value: number; color: string }[]
  >([]);
  const [productIndex, setProductIndex] = useState<
    Record<string, { name: string; unitPrice?: number }>
  >({});
  const [derivedSales, setDerivedSales] = useState<{
    products: {
      id: string;
      name: string;
      unitsSold: number;
      revenue: number;
      profit: number;
    }[];
    totals: { units: number; revenue: number; profit: number };
  } | null>(null);

  const [salesTodayCount, setSalesTodayCount] = useState<number | null>(null);
  const [salesTodayChange, setSalesTodayChange] = useState<number | null>(null);

  // Cash Flow Trend (monthly income, expense, profit)
  const [cashFlowData, setCashFlowData] = useState<
    {
      month: string;
      totalIncome: number;
      totalExpense: number;
      totalProfit: number;
    }[]
  >([]);
  const [cashFlowLoading, setCashFlowLoading] = useState(false);
  const [cashFlowError, setCashFlowError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadCounts = async () => {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
        const [prodRes, clientsRes] = await Promise.all([
          fetch(`${API_BASE}/products`, { headers }),
          fetch(`${API_BASE}/clients`, { headers }),
        ]);
        const prodJson = await prodRes.json().catch(() => null as any);
        const clientsJson = await clientsRes.json().catch(() => null as any);

        const extractList = (j: any) => {
          if (!j) return [] as any[];
          if (Array.isArray(j)) return j;
          if (j.result && Array.isArray(j.result)) return j.result;
          if (j.data && Array.isArray(j.data)) return j.data;
          return [] as any[];
        };

        const products = extractList(prodJson);
        const clients = extractList(clientsJson);
        if (!mounted) return;

        const managerFilialId =
          user?.role === "manager" ? (user as any).filialId : null;

        // Scope products/clients to manager's filial if applicable
        const inFilial = (obj: any, fid: string) => {
          if (!fid) return true;
          const direct =
            obj?.filialId ??
            obj?.filialID ??
            obj?.storeId ??
            obj?.branchId ??
            obj?.locationId;
          if (direct) return String(direct) === String(fid);
          if (Array.isArray(obj?.filials)) {
            return obj.filials.some((f: any) => {
              const id = f?.filialId ?? f?.id ?? f?.storeId ?? f?.branchId;
              return id && String(id) === String(fid);
            });
          }
          return false;
        };

        const scopedProducts = managerFilialId
          ? products.filter((p: any) => inFilial(p, managerFilialId))
          : products;

        const index: Record<string, { name: string; unitPrice?: number }> = {};
        for (const p of scopedProducts) {
          const id = String(p.id ?? "");
          if (!id) continue;
          index[id] = {
            name: String(
              p.name || p.productName || p.title || p.title_en || "Unnamed",
            ),
            unitPrice:
              Number(
                p.unitPrice ??
                  p.price ??
                  p.sellingPrice ??
                  p.selling_price ??
                  0,
              ) || undefined,
          };
        }
        setProductIndex(index);
        const scopedClients = managerFilialId
          ? clients.filter((c: any) => inFilial(c, managerFilialId))
          : clients;

        setTotalProducts(scopedProducts.length);

        // build product categories distribution
        const categoryMap = new Map<string, number>();
        for (const p of scopedProducts) {
          const cat = String(
            p.category || p.categoryName || p.type || p.group || "Other",
          );
          categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
        }
        const palette = [
          "#0088FE",
          "#00C49F",
          "#FFBB28",
          "#FF8042",
          "#A78BFA",
          "#34D399",
          "#F472B6",
          "#F43F5E",
          "#06B6D4",
          "#84CC16",
        ];
        const computed = Array.from(categoryMap.entries()).map(
          ([name, value], i) => ({
            name,
            value,
            color: palette[i % palette.length],
          }),
        );
        setCategoryDist(computed);
        const monthAgo = Date.now() - 30 * 24 * 3600 * 1000;
        setNewProductsThisMonth(
          scopedProducts.filter((p: any) => {
            const created =
              p.createdAt || p.created_at || p.ph_created_at || p.created;
            if (!created) return false;
            const ts = new Date(String(created)).getTime();
            return !isNaN(ts) && ts >= monthAgo;
          }).length,
        );

        setActiveClients(scopedClients.length);
        const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
        setNewClientsThisWeek(
          scopedClients.filter((c: any) => {
            const created =
              c.createdAt || c.created_at || c.ph_created_at || c.created;
            if (!created) return false;
            const ts = new Date(String(created)).getTime();
            return !isNaN(ts) && ts >= weekAgo;
          }).length,
        );

        // compute low stock items with robust field extraction
        try {
          const getNumeric = (obj: any, paths: string[]) => {
            for (const p of paths) {
              const parts = p.split(".");
              let cur: any = obj;
              let ok = true;
              for (const part of parts) {
                if (cur == null) {
                  ok = false;
                  break;
                }
                cur = cur[part];
              }
              if (!ok) continue;
              if (cur == null) continue;
              const n = Number(cur);
              if (!isNaN(n)) return n;
            }
            return null;
          };

          const low = (scopedProducts || [])
            .map((p: any) => {
              const name =
                p.name || p.productName || p.title || p.title_en || "Unnamed";

              // possible stock fields or nested stores
              let stock: number | null = null;

              if (
                managerFilialId &&
                Array.isArray(p.filials) &&
                p.filials.length
              ) {
                const entry = p.filials.find((f: any) => {
                  const id = f?.filialId ?? f?.id ?? f?.storeId ?? f?.branchId;
                  return id && String(id) === String(managerFilialId);
                });
                if (entry) {
                  stock =
                    Number(entry.count ?? entry.quantity ?? entry.qty ?? 0) ||
                    0;
                }
              }

              if (stock == null) {
                const stockPaths = [
                  "count",
                  "quantity",
                  "qty",
                  "stock",
                  "stockQuantity",
                  "available",
                  "availableQuantity",
                  "inventory.quantity",
                  "inventory.qty",
                ];
                stock = getNumeric(p, stockPaths);

                // try sums from stores array
                if (
                  (stock === null || stock === 0) &&
                  Array.isArray(p.stores) &&
                  p.stores.length
                ) {
                  const sum = p.stores.reduce((s: number, item: any) => {
                    const v =
                      Number(
                        item.quantity ??
                          item.qty ??
                          item.stock ??
                          item.count ??
                          0,
                      ) || 0;
                    return s + v;
                  }, 0);
                  stock = sum;
                }

                // try sums from filials array (backend uses filials[].count)
                if (
                  (stock === null || stock === 0) &&
                  Array.isArray(p.filials) &&
                  p.filials.length
                ) {
                  const sum = p.filials.reduce((s: number, f: any) => {
                    const v = Number(f.count ?? f.quantity ?? f.qty ?? 0) || 0;
                    return s + v;
                  }, 0);
                  stock = sum;
                }

                // fallback to nested stock fields like stock.current
                if (
                  (stock === null || isNaN(stock)) &&
                  p.stock &&
                  typeof p.stock === "object"
                ) {
                  stock =
                    getNumeric(p.stock, [
                      "quantity",
                      "qty",
                      "current",
                      "available",
                    ]) ?? stock;
                }
              }

              if (stock == null || isNaN(stock)) stock = 0;

              // min/reorder fields
              let minRequired: number | null = null;
              const minPaths = [
                "minStock",
                "min_stock",
                "minimum",
                "reorderPoint",
                "reorder_point",
                "minRequired",
              ];
              minRequired = getNumeric(p, minPaths);
              if (
                minRequired == null &&
                p.settings &&
                typeof p.settings === "object"
              ) {
                minRequired = getNumeric(p.settings, [
                  "minStock",
                  "reorderPoint",
                ]);
              }
              if (minRequired == null) minRequired = 0;

              return {
                name,
                stock: Number(stock),
                minRequired: Number(minRequired),
              };
            })
            .filter((x: any) => x.minRequired > 0 && x.stock < x.minRequired)
            .slice(0, 5);
          setLowStockDynamic(low);
        } catch (e) {
          setLowStockDynamic([]);
        }
      } catch (e: any) {
        setTotalProducts(0);
        setNewProductsThisMonth(0);
        setActiveClients(0);
        setNewClientsThisWeek(0);
        setLowStockDynamic([]);
        toast({
          title: "Warning",
          description: "Failed to load dashboard counts",
        });
      }
    };
    loadCounts();
    return () => {
      mounted = false;
    };
  }, []);

  // Derive "Sales by Product" from Sales management (paid invoices)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
        const res = await fetch(`${API_BASE}/Sales`, { headers });
        const data = await res.json().catch(() => null as any);
        const list: any[] = (data && (data.result || data.data || data)) || [];
        if (!Array.isArray(list)) return;

        const normalizeStatus = (r: any) => {
          const raw = String(r?.status || "").toLowerCase();
          const cancelled =
            !!r?.cancellationReason ||
            raw === "cancelled" ||
            raw === "canceled";
          if (cancelled) return "cancelled";
          return ["draft", "sent", "paid", "overdue", "cancelled"].includes(raw)
            ? raw
            : "draft";
        };

        const map = new Map<
          string,
          {
            id: string;
            name: string;
            unitsSold: number;
            revenue: number;
            profit: number;
          }
        >();
        for (const r of list) {
          if (normalizeStatus(r) !== "paid") continue;
          const items = Array.isArray(r.items) ? r.items : [];
          for (const it of items) {
            const pid = String(it.productId || it.productID || it.id || "");
            if (!pid) continue;
            const qty = Number(it.quantity || 0) || 0;
            const total = (() => {
              const t = Number(it.total);
              if (!isNaN(t) && t !== 0) return t;
              const up =
                Number(it.unitPrice ?? productIndex[pid]?.unitPrice ?? 0) || 0;
              return qty * up;
            })();
            if (!map.has(pid)) {
              const name =
                productIndex[pid]?.name || String(it.productName || pid);
              map.set(pid, {
                id: pid,
                name,
                unitsSold: 0,
                revenue: 0,
                profit: 0,
              });
            }
            const entry = map.get(pid)!;
            entry.unitsSold += qty;
            entry.revenue += total;
            // profit unknown without cost; keep 0
          }
        }
        const productsAgg = Array.from(map.values()).sort(
          (a, b) => b.revenue - a.revenue,
        );
        const totals = productsAgg.reduce(
          (acc, p) => ({
            units: acc.units + p.unitsSold,
            revenue: acc.revenue + p.revenue,
            profit: acc.profit + p.profit,
          }),
          { units: 0, revenue: 0, profit: 0 },
        );
        if (mounted) setDerivedSales({ products: productsAgg, totals });
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [accessToken, productIndex]);

  // Load daily sales (paid invoices today) and change vs. yesterday
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
        const res = await fetch(`${API_BASE}/Sales`, { headers });
        const data = await res.json().catch(() => null as any);
        const list = (data && (data.result || data.data || data)) || [];
        if (!Array.isArray(list)) {
          if (mounted) {
            setSalesTodayCount(0);
            setSalesTodayChange(0);
          }
          return;
        }

        const normalizeStatus = (r: any) => {
          const raw = String(r?.status || "").toLowerCase();
          const cancelled =
            !!r?.cancellationReason ||
            raw === "cancelled" ||
            raw === "canceled";
          if (cancelled) return "cancelled";
          return ["draft", "sent", "paid", "overdue", "cancelled"].includes(raw)
            ? raw
            : "draft";
        };
        const getDate = (r: any) =>
          new Date(
            r?.createdAt ||
              r?.date ||
              r?.created_at ||
              r?.createdAtUtc ||
              Date.now(),
          );
        const isSameDay = (a: Date, b: Date) =>
          a.toDateString() === b.toDateString();

        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const paidToday = list.filter(
          (r: any) =>
            normalizeStatus(r) === "paid" && isSameDay(getDate(r), today),
        ).length;
        const paidYesterday = list.filter(
          (r: any) =>
            normalizeStatus(r) === "paid" && isSameDay(getDate(r), yesterday),
        ).length;

        const change =
          paidYesterday === 0
            ? paidToday > 0
              ? 100
              : 0
            : ((paidToday - paidYesterday) / paidYesterday) * 100;

        if (mounted) {
          setSalesTodayCount(paidToday);
          setSalesTodayChange(Math.round(change));
        }
      } catch (e) {
        if (mounted) {
          setSalesTodayCount(0);
          setSalesTodayChange(0);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [accessToken]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setSalesLoading(true);
        setSalesError(null);
        const res = await fetch(`${API_BASE}/dashboard/sales-summary`);
        const json = (await res.json()) as
          | SalesSummaryResponse
          | { ok?: false; error?: string };
        if (!res.ok || !(json as any)?.ok)
          throw new Error(
            (json as any)?.error || "Failed to load sales summary",
          );
        if (isMounted) setSalesSummary((json as SalesSummaryResponse).result);
      } catch (e: any) {
        if (isMounted) setSalesError(e?.message || "Failed to load");
      } finally {
        if (isMounted) setSalesLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute real total revenue from transactions (income)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
        const res = await fetch(`${API_BASE}/transactions`, { headers });
        const json = await res.json().catch(() => null as any);
        if (!res.ok || !json?.ok || !Array.isArray(json.result)) return;

        const tx: any[] = json.result;

        // If manager, scope by filial using performedBy -> user -> filialId mapping
        let scoped = tx as any[];
        const managerFilialId =
          user?.role === "manager" ? (user as any).filialId : null;
        if (managerFilialId) {
          const userIds = Array.from(
            new Set(tx.map((t: any) => t.userId).filter(Boolean)),
          );
          const usersFilial: Record<string, string> = {};
          await Promise.all(
            userIds.map(async (id: string) => {
              try {
                const uRes = await fetch(
                  `${API_BASE}/users/${encodeURIComponent(id)}`,
                  { headers },
                );
                const uJson = await uRes.json().catch(() => null as any);
                if (uRes.ok && uJson?.ok && uJson.result) {
                  const u = uJson.result;
                  const fid =
                    u.filialId ??
                    u.filialID ??
                    u.storeId ??
                    u.branchId ??
                    u.locationId;
                  if (fid) usersFilial[id] = String(fid);
                }
              } catch {}
            }),
          );
          scoped = tx.filter((t: any) => {
            const uid = t.userId || t.performedBy;
            if (!uid) return false;
            const fid = usersFilial[uid];
            return fid ? String(fid) === String(managerFilialId) : false;
          });
        }

        const revenue = scoped
          .filter(
            (t: any) =>
              (t.type === "income" || t.kind === "income") &&
              (t.status ?? "completed") === "completed",
          )
          .reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0);
        if (!cancelled) setTotalRevenue(revenue);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken, user]);

  // Load Financial Management - Cash Flow Trend
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setCashFlowLoading(true);
        setCashFlowError(null);
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
        const res = await fetch(`${API_BASE}/transactions/analytics`, {
          headers,
        });
        const json = await res.json().catch(() => null as any);
        if (!res.ok || !json?.ok || !Array.isArray(json.result)) {
          throw new Error(
            (json && (json.error || json.message)) ||
              "Failed to load cash flow analytics",
          );
        }
        // Transform months like "8" -> "Aug"
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const data = (json.result as any[]).map((r) => ({
          month: (() => {
            const m = Number(r.month);
            return !isNaN(m) && m >= 1 && m <= 12
              ? monthNames[m - 1]
              : String(r.month);
          })(),
          totalIncome: Number(r.totalIncome) || 0,
          totalExpense: Number(r.totalExpense) || 0,
          totalProfit:
            Number(
              r.totalProfit ?? Number(r.totalIncome) - Number(r.totalExpense),
            ) || 0,
        }));
        if (mounted) setCashFlowData(data);
      } catch (e: any) {
        if (mounted)
          setCashFlowError(e?.message || "Failed to load cash flow analytics");
      } finally {
        if (mounted) setCashFlowLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [accessToken]);

  const exportReport = (format: "pdf" | "excel" | "csv") => {
    // Generate comprehensive report data
    const reportData = {
      reportType: "Dashboard Overview",
      generatedAt: new Date().toISOString(),
      dateRange: `Last ${dateFilter} days`,
      summary: {
        totalRevenue: 45231.89,
        totalProducts: totalProducts || 2350,
        activeClients: activeClients || 573,
        salesToday: salesTodayCount ?? 0,
        growthMetrics: {
          revenueGrowth: 20.1,
          productGrowth: 180,
          clientGrowth: 25,
          salesGrowth: 12,
        },
      },
      salesData: salesData,
      productCategories: productCategories,
      recentActivities: filteredActivities,
      lowStockItems: lowStockItems,
      quickStats: [
        {
          metric: "Total Sales",
          thisMonth: 45231,
          lastMonth: 38942,
          change: 16.1,
        },
        { metric: "New Clients", thisMonth: 25, lastMonth: 18, change: 38.9 },
        {
          metric: "Products Sold",
          thisMonth: 1247,
          lastMonth: 1156,
          change: 7.9,
        },
        {
          metric: "Average Order",
          thisMonth: 186.42,
          lastMonth: 172.33,
          change: 8.2,
        },
      ],
    };

    // PDF only
    if (format === "pdf") {
      downloadFile(
        generatePDFContent(reportData),
        "dashboard-report.pdf",
        "application/pdf",
      );
    }

    toast({
      title: t("dashboard.export_report"),
      description: "PDF downloaded.",
    });
  };

  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string,
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const generatePDFContent = (data: any) => {
    const nf = (n: number) =>
      new Intl.NumberFormat(i18n.language || "en").format(n || 0);
    return `
${t("dashboard.title").toUpperCase()}
${t("finance.generated_at")}: ${new Date(data.generatedAt).toLocaleString()}
${t("common.period", { defaultValue: "Period" })}: ${data.dateRange}

${t("finance.executive_summary")}
===============
${t("dashboard.total_revenue")}: $${nf(data.summary.totalRevenue)}
${t("dashboard.products")}: ${nf(data.summary.totalProducts)}
${t("dashboard.active_clients")}: ${nf(data.summary.activeClients)}
${t("dashboard.sales_today")}: ${nf(data.summary.salesToday)}

${t("dashboard.recent_activity")}
=================
${data.recentActivities.map((activity: any) => `${activity.time} - ${activity.description}${activity.amount ? ` ($${nf(activity.amount)})` : ""}`).join("\n")}
    `;
  };

  const generateExcelContent = (data: any) => {
    // Simplified Excel content (in real app, use proper Excel generation)
    const csvContent = generateCSVContent(data);
    return csvContent; // For demo, return CSV format
  };

  const generateCSVContent = (data: any) => {
    let csv = "";

    // Summary section
    csv += "Dashboard Report Summary\n";
    csv += `Generated,${new Date(data.generatedAt).toLocaleString()}\n`;
    csv += `Period,${data.dateRange}\n`;
    csv += "\n";

    csv += "Metric,Value,Growth\n";
    csv += `Total Revenue,$${data.summary.totalRevenue.toLocaleString()},+${data.summary.growthMetrics.revenueGrowth}%\n`;
    csv += `Total Products,${data.summary.totalProducts.toLocaleString()},+${data.summary.growthMetrics.productGrowth}\n`;
    csv += `Active Clients,${data.summary.activeClients.toLocaleString()},+${data.summary.growthMetrics.clientGrowth}\n`;
    csv += `Sales Today,${data.summary.salesToday},+${data.summary.growthMetrics.salesGrowth}%\n`;
    csv += "\n";

    // Sales data
    csv += "Monthly Sales Data\n";
    csv += "Month,Sales,Profit\n";
    data.salesData.forEach((item: any) => {
      csv += `${item.name},$${item.sales.toLocaleString()},$${item.profit.toLocaleString()}\n`;
    });
    csv += "\n";

    // Product categories
    csv += "Product Categories\n";
    csv += "Category,Count\n";
    data.productCategories.forEach((cat: any) => {
      csv += `${cat.name},${cat.value}\n`;
    });
    csv += "\n";

    // Low stock items
    csv += "Low Stock Alerts\n";
    csv += "Product,Current Stock,Minimum Required\n";
    data.lowStockItems.forEach((item: any) => {
      csv += `${item.name},${item.stock},${item.minRequired}\n`;
    });
    csv += "\n";

    // Quick stats
    csv += "Monthly Comparison\n";
    csv += "Metric,This Month,Last Month,Change %\n";
    data.quickStats.forEach((stat: any) => {
      csv += `${stat.metric},${stat.thisMonth},${stat.lastMonth},+${stat.change}%\n`;
    });

    return csv;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {t("dashboard.title")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("dashboard.subtitle")}
          </p>
        </div>
      </div>

      {/* Enhanced KPI Cards with Glassmorphism */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden group border-0 bg-gradient-to-br from-white via-white to-green-50/30 backdrop-blur-xl shadow-business-lg hover:shadow-business-xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
            <CardTitle className="text-sm font-semibold text-gray-700 tracking-tight">
              {t("dashboard.total_revenue")}
            </CardTitle>
            <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl group-hover:from-green-200 group-hover:to-emerald-200 transition-all duration-300 group-hover:scale-110 shadow-sm">
              <DollarSign className="h-5 w-5 text-green-600 group-hover:text-green-700 transition-colors" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 relative z-10">
            <div className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              {typeof totalRevenue === "number"
                ? `$${totalRevenue.toLocaleString()}`
                : salesSummary
                  ? `$${salesSummary.totals.revenue.toLocaleString()}`
                  : "—"}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-600">
                  +20.1%
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {t("dashboard.from_last_month")}
              </span>
            </div>
            <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-4/5 animate-pulse" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group border-0 bg-gradient-to-br from-white via-white to-blue-50/30 backdrop-blur-xl shadow-business-lg hover:shadow-business-xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
            <CardTitle className="text-sm font-semibold text-gray-700 tracking-tight">
              {t("dashboard.products")}
            </CardTitle>
            <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl group-hover:from-blue-200 group-hover:to-cyan-200 transition-all duration-300 group-hover:scale-110 shadow-sm">
              <Package className="h-5 w-5 text-blue-600 group-hover:text-blue-700 transition-colors" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 relative z-10">
            <div className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              {typeof totalProducts === "number"
                ? totalProducts.toLocaleString()
                : "—"}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-600">
                  {typeof newProductsThisMonth === "number"
                    ? `+${newProductsThisMonth}`
                    : "—"}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {t("dashboard.new_this_month")}
              </span>
            </div>
            <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full w-3/5 animate-pulse" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group border-0 bg-gradient-to-br from-white via-white to-purple-50/30 backdrop-blur-xl shadow-business-lg hover:shadow-business-xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
            <CardTitle className="text-sm font-semibold text-gray-700 tracking-tight">
              {t("dashboard.active_clients")}
            </CardTitle>
            <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-300 group-hover:scale-110 shadow-sm">
              <Users className="h-5 w-5 text-purple-600 group-hover:text-purple-700 transition-colors" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 relative z-10">
            <div className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              {typeof activeClients === "number"
                ? activeClients.toLocaleString()
                : "—"}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-600">
                  {typeof newClientsThisWeek === "number"
                    ? `+${newClientsThisWeek}`
                    : "—"}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {t("dashboard.new_this_week")}
              </span>
            </div>
            <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-4/6 animate-pulse" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group border-0 bg-gradient-to-br from-white via-white to-orange-50/30 backdrop-blur-xl shadow-business-lg hover:shadow-business-xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
            <CardTitle className="text-sm font-semibold text-gray-700 tracking-tight">
              {t("dashboard.sales_today")}
            </CardTitle>
            <div className="p-3 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl group-hover:from-orange-200 group-hover:to-red-200 transition-all duration-300 group-hover:scale-110 shadow-sm">
              <ShoppingCart className="h-5 w-5 text-orange-600 group-hover:text-orange-700 transition-colors" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 relative z-10">
            <div className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              {typeof salesTodayCount === "number"
                ? salesTodayCount.toLocaleString()
                : "—"}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-semibold text-orange-600">
                  {typeof salesTodayChange === "number"
                    ? `${salesTodayChange >= 0 ? "+" : ""}${salesTodayChange}%`
                    : "—"}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {t("dashboard.from_yesterday")}
              </span>
            </div>
            <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full w-2/3 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Trend */}
      <Card className="relative overflow-hidden group border-0 bg-gradient-to-br from-white via-white to-emerald-50/20 backdrop-blur-xl shadow-business-lg hover:shadow-business-xl transition-all duration-500 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/3 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardHeader className="pb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 tracking-tight">
                {t("finance.cash_flow_trend") || "Cash Flow Trend"}
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                {t("finance.income_expenses_profit")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {cashFlowLoading && (
            <div className="text-sm text-muted-foreground">
              Loading cash flow…
            </div>
          )}
          {cashFlowError && (
            <div className="text-sm text-red-600">{cashFlowError}</div>
          )}
          {!cashFlowLoading && !cashFlowError && (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={cashFlowData}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalIncome"
                  name={t("finance.income")}
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="totalExpense"
                  name={t("finance.expenses")}
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="totalProfit"
                  name={t("finance.profit")}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        {/* Enhanced Sales Chart */}
        <Card className="col-span-4 relative overflow-hidden group border-0 bg-gradient-to-br from-white via-white to-blue-50/20 backdrop-blur-xl shadow-business-lg hover:shadow-business-xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="pb-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 tracking-tight">
                  {t("dashboard.sales_overview")}
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  {t("dashboard.monthly_sales_profit")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#8884d8" />
                <Bar dataKey="profit" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Enhanced Product Categories */}
        <Card className="col-span-3 relative overflow-hidden group border-0 bg-gradient-to-br from-white via-white to-green-50/20 backdrop-blur-xl shadow-business-lg hover:shadow-business-xl transition-all duration-500 hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/3 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="pb-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 tracking-tight">
                  {t("dashboard.product_categories")}
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  {t("dashboard.distribution_by_category")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryDist}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        {/* Low Stock Alert */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              {t("dashboard.inventory_alerts")}
            </CardTitle>
            <CardDescription>
              {t("dashboard.products_requiring_attention")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockDynamic.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("dashboard.current")}: {item.stock} |{" "}
                      {t("dashboard.required")}: {item.minRequired}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            item.stock / item.minRequired < 0.3
                              ? "bg-red-500"
                              : item.stock / item.minRequired < 0.6
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min((item.stock / item.minRequired) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {Math.round((item.stock / item.minRequired) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="ghost"
                className="w-full"
                size="sm"
                onClick={() => (window.location.href = "/warehouse")}
              >
                {t("dashboard.view_all_inventory")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales by Product */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.sales_by_product")}</CardTitle>
          <CardDescription>
            {t("dashboard.units_revenue_profit")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {salesLoading && (
            <div className="text-sm text-muted-foreground">
              Loading sales...
            </div>
          )}
          {salesError && (
            <div className="text-sm text-red-600">{salesError}</div>
          )}
          {(derivedSales || salesSummary) && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="p-3 rounded-lg border bg-white">
                  <div className="text-xs text-muted-foreground">
                    {t("dashboard.products_sold")}
                  </div>
                  <div className="text-xl font-semibold">
                    {(
                      derivedSales?.totals.units ??
                      salesSummary?.totals.units ??
                      0
                    ).toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded-lg border bg-white">
                  <div className="text-xs text-muted-foreground">
                    {t("finance.sales_revenue")}
                  </div>
                  <div className="text-xl font-semibold">
                    $
                    {(
                      (derivedSales?.totals.revenue ??
                        salesSummary?.totals.revenue) ||
                      0
                    ).toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded-lg border bg-white">
                  <div className="text-xs text-muted-foreground">
                    {t("finance.profit")}
                  </div>
                  <div className="text-xl font-semibold">
                    $
                    {(
                      (derivedSales?.totals.profit ??
                        salesSummary?.totals.profit) ||
                      0
                    ).toLocaleString()}
                  </div>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t("warehouse.product_name") || "Product"}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("dashboard.products_sold")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("finance.sales_revenue")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("finance.profit")}
                    </TableHead>
                    <TableHead className="text-right">Margin %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(derivedSales?.products || salesSummary?.products || []).map(
                    (p) => {
                      const margin = p.revenue
                        ? (p.profit / p.revenue) * 100
                        : 0;
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">
                            {p.name}
                          </TableCell>
                          <TableCell className="text-right">
                            {p.unitsSold.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            ${p.revenue.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            ${p.profit.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {margin.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      );
                    },
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.quick_statistics")}</CardTitle>
          <CardDescription>{t("dashboard.kpi_at_glance")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("dashboard.metric")}</TableHead>
                <TableHead>{t("dashboard.this_month")}</TableHead>
                <TableHead>{t("dashboard.last_month")}</TableHead>
                <TableHead>{t("dashboard.change")}</TableHead>
                <TableHead>{t("dashboard.trend")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  {t("dashboard.total_sales")}
                </TableCell>
                <TableCell>$45,231</TableCell>
                <TableCell>$38,942</TableCell>
                <TableCell className="text-green-600">+16.1%</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 text-sm">
                      {t("dashboard.up")}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  {t("dashboard.new_clients")}
                </TableCell>
                <TableCell>25</TableCell>
                <TableCell>18</TableCell>
                <TableCell className="text-green-600">+38.9%</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 text-sm">
                      {t("dashboard.up")}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  {t("dashboard.products_sold")}
                </TableCell>
                <TableCell>1,247</TableCell>
                <TableCell>1,156</TableCell>
                <TableCell className="text-green-600">+7.9%</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 text-sm">
                      {t("dashboard.up")}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  {t("dashboard.average_order")}
                </TableCell>
                <TableCell>$186.42</TableCell>
                <TableCell>$172.33</TableCell>
                <TableCell className="text-green-600">+8.2%</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 text-sm">
                      {t("dashboard.up")}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Accounts Section - Only show for demo purposes */}

      {user?.email?.includes("example.com") && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              👥 Available User Accounts
            </CardTitle>
            <CardDescription>
              Try different user accounts to see how permissions and interface
              change based on roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserCredentials />
          </CardContent>
        </Card>
      )}

      {/* Floating chat panel, opened via URL param */}
      <AIChat variant="floating" defaultOpen={openChat} showTrigger={false} />

      {/* Corner AI button opens full-screen chat page */}
      <Button
        onClick={() => navigate("/chat")}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg transition-transform hover:scale-110 z-40"
        aria-label="Open AI Chat"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    </div>
  );
}
