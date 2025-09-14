import { useState, useEffect, useMemo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DetailCard from "@/components/DetailCard";
import { API_BASE, getErrorMessageFromResponse } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import {
  Plus,
  Search,
  DollarSign,
  Edit,
  Trash2,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Calculator,
  PieChart,
  BarChart3,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  Eye,
  Target,
  FileSpreadsheet,
  ChevronDown,
  Handshake,
  Clock,
  CheckCircle2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  date: string;
  paymentMethod: "cash" | "card" | "bank_transfer" | "check";
  status: "completed" | "pending" | "cancelled";
  performedBy?: string;
  tags: string[];
}

interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  status: "on_track" | "behind" | "achieved";
}

interface LoanRecord {
  id: string;
  type: "borrow" | "lend";
  amount: number;
  productName?: string;
  sku?: string;
  quantity?: number;
  partyType: "supplier" | "client" | "other";
  partyName: string;
  date: string;
  dueDate: string;
  status: "active" | "returned" | "overdue";
  notes?: string;
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "income",
    category: "Sales Revenue",
    description: "Invoice payment from Tech Solutions Ltd",
    amount: 14903.01,
    date: "2024-01-15",
    paymentMethod: "bank_transfer",
    status: "completed",
    performedBy: "System",
    tags: ["wholesale", "recurring"],
  },
  {
    id: "2",
    type: "expense",
    category: "Office Supplies",
    description: "Computer equipment purchase",
    amount: 2500.0,
    date: "2024-01-14",
    paymentMethod: "card",
    status: "completed",
    performedBy: "Procurement Team",
    tags: ["equipment", "office"],
  },
  {
    id: "3",
    type: "income",
    category: "Sales Revenue",
    description: "Retail sales - John Smith",
    amount: 975.42,
    date: "2024-01-20",
    paymentMethod: "card",
    status: "completed",
    performedBy: "Cashier #12",
    tags: ["retail"],
  },
  {
    id: "4",
    type: "expense",
    category: "Marketing",
    description: "Social media advertising campaign",
    amount: 1200.0,
    date: "2024-01-18",
    paymentMethod: "card",
    status: "pending",
    tags: ["marketing", "advertising"],
  },
  {
    id: "5",
    type: "expense",
    category: "Utilities",
    description: "Monthly electricity bill",
    amount: 450.75,
    date: "2024-01-10",
    paymentMethod: "bank_transfer",
    status: "completed",
    performedBy: "Accounting",
    tags: ["utilities", "recurring"],
  },
];

const mockGoals: FinancialGoal[] = [
  {
    id: "1",
    title: "Q1 Revenue Target",
    targetAmount: 150000,
    currentAmount: 87500,
    deadline: "2024-03-31",
    category: "Revenue",
    status: "on_track",
  },
  {
    id: "2",
    title: "Emergency Fund",
    targetAmount: 50000,
    currentAmount: 32000,
    deadline: "2024-06-30",
    category: "Savings",
    status: "behind",
  },
  {
    id: "3",
    title: "Equipment Upgrade Budget",
    targetAmount: 25000,
    currentAmount: 25000,
    deadline: "2024-02-15",
    category: "Capital",
    status: "achieved",
  },
];

const CASH_FLOW_BASE = [
  { monthIndex: 0, income: 1, expenses: 2, profit: 3 },
  { monthIndex: 1, income: 4, expenses: 5, profit: 6 },
  { monthIndex: 2, income: 8, expenses: 8, profit: 90 },
  { monthIndex: 3, income: 12, expenses: 11, profit: 12 },
  { monthIndex: 4, income: 160, expenses: 14, profit: 15 },
  { monthIndex: 5, income: 20, expenses: 17, profit: 18 },
  { monthIndex: 6, income: 24, expenses: 200, profit: 21 },
  { monthIndex: 7, income: 280, expenses: 23, profit: 24 },
  { monthIndex: 8, income: 32, expenses: 26, profit: 27 },
  { monthIndex: 9, income: 36, expenses: 290, profit: 30 },
  { monthIndex: 10, income: 40, expenses: 32, profit: 33 },
  { monthIndex: 11, income: 44, expenses: 35, profit: 360 },
];

const mockLoans: LoanRecord[] = [
  {
    id: "L1",
    type: "borrow",
    amount: 1200,
    partyType: "supplier",
    partyName: "HP Distribution",
    date: "2024-01-05T10:15:00",
    dueDate: "2024-01-20T09:00:00",
    status: "returned",
    notes: "Borrowed for enterprise demo",
  },
  {
    id: "L2",
    type: "lend",
    amount: 850,
    partyType: "client",
    partyName: "Acme Corp",
    date: "2024-01-12T13:45:20",
    dueDate: "2024-02-12T17:00:00",
    status: "active",
    notes: "Loaner while repair in progress",
  },
  {
    id: "L3",
    type: "borrow",
    amount: 3000,
    partyType: "supplier",
    partyName: "Apple Inc.",
    date: "2023-12-20T08:05:10",
    dueDate: "2024-01-05T12:00:00",
    status: "overdue",
    notes: "Awaiting shipment return",
  },
  {
    id: "L4",
    type: "lend",
    amount: 1400,
    partyType: "client",
    partyName: "Bright Tech LLC",
    date: "2024-01-18T16:20:00",
    dueDate: "2024-02-01T10:00:00",
    status: "active",
  },
  {
    id: "L5",
    type: "lend",
    amount: 275,
    partyType: "client",
    partyName: "John Doe",
    date: "2024-01-08T11:10:00",
    dueDate: "2024-01-22T11:00:00",
    status: "returned",
  },
  {
    id: "L6",
    type: "borrow",
    amount: 980,
    partyType: "supplier",
    partyName: "Cisco Partner",
    date: "2024-01-02T09:00:00",
    dueDate: "2024-01-30T09:00:00",
    status: "active",
  },
  {
    id: "L7",
    type: "lend",
    amount: 1100,
    partyType: "client",
    partyName: "Globex",
    date: "2023-12-28T14:30:00",
    dueDate: "2024-01-10T15:00:00",
    status: "overdue",
    notes: "Follow up with client",
  },
];

const expenseCategories = [
  { name: "Office Supplies", value: 15000, color: "#0088FE" },
  { name: "Marketing", value: 8000, color: "#00C49F" },
  { name: "Utilities", value: 5400, color: "#FFBB28" },
  { name: "Equipment", value: 12000, color: "#FF8042" },
  { name: "Travel", value: 3200, color: "#8884d8" },
];

export default function Finance() {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [goals, setGoals] = useState(mockGoals);
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  const [usersFilialMap, setUsersFilialMap] = useState<Record<string, string>>(
    {},
  );
  const [clientsMap, setClientsMap] = useState<Record<string, string>>({});
  const { t, i18n } = useTranslation();

  const cashFlowData = useMemo(
    () =>
      CASH_FLOW_BASE.map((item) => ({
        ...item,
        month: new Intl.DateTimeFormat(i18n.language || "en", {
          month: "short",
        }).format(new Date(2020, item.monthIndex, 1)),
      })),
    [i18n.language],
  );

  useEffect(() => {
    let mounted = true;
    const loadClients = async () => {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
        const res = await fetch(`${API_BASE}/clients`, { headers });
        const json = await res.json().catch(() => null as any);
        if (!res.ok || !json?.ok || !Array.isArray(json.result)) return;
        const map: Record<string, string> = {};
        json.result.forEach((c: any) => {
          map[c.id] =
            c.userName ||
            c.name ||
            c.user ||
            c.fullName ||
            c.displayName ||
            c.userName ||
            String(c.name || "");
        });
        if (mounted) setClientsMap(map);
      } catch (err) {
        // ignore
      }
    };

    const loadTransactions = async () => {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
        const res = await fetch(`${API_BASE}/transactions`, { headers });
        const json = await res.json().catch(() => null as any);
        if (!res.ok || !json?.ok || !Array.isArray(json.result)) {
          // keep mock data on failure
          return;
        }
        const mapped: Transaction[] = json.result.map((t: any) => ({
          id: t.id,
          type: t.type === "expense" ? "expense" : "income",
          category: t.category || "",
          description: t.description || "",
          amount: Number(t.amount || 0),
          date: t.createdAt ? String(t.createdAt).split("T")[0] : t.date || "",
          paymentMethod:
            (t.paymentMethod as Transaction["paymentMethod"]) || "cash",
          status: (t.status as Transaction["status"]) || "completed",
          performedBy: t.userId || t.performedBy || "",
          tags: Array.isArray(t.tags) ? t.tags : [],
        }));
        if (mounted) setTransactions(mapped);

        // resolve user names for performedBy
        const userIds = Array.from(
          new Set(json.result.map((t: any) => t.userId).filter(Boolean)),
        );
        const usersMapLocal: Record<string, string> = {};
        const usersFilialLocal: Record<string, string> = {};
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
                usersMapLocal[id] = (u.name ||
                  u.userName ||
                  `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
                  u.email ||
                  id) as string;
                const fid =
                  u.filialId ??
                  u.filialID ??
                  u.storeId ??
                  u.branchId ??
                  u.locationId;
                if (fid) usersFilialLocal[id] = String(fid);
              }
            } catch (err) {
              // ignore
            }
          }),
        );
        if (mounted) {
          setUsersMap(usersMapLocal);
          setUsersFilialMap(usersFilialLocal);
        }
      } catch (e) {
        console.error("Failed to load transactions", e);
      }
    };

    loadClients();
    loadTransactions();

    return () => {
      mounted = false;
    };
  }, [accessToken]);

  const formatDescription = (desc: string) => {
    if (!desc) return desc;
    // look for pattern 'with <ID>' or 'with: <ID>'
    const m = desc.match(/with[:\s]+([A-Za-z0-9_-]{6,})/i);
    if (m) {
      const id = m[1];
      const name = clientsMap[id];
      if (name) return desc.replace(id, name);
    }
    return desc;
  };

  const getPerformedByDisplay = (performedBy: string | undefined) => {
    if (!performedBy) return "";
    return usersMap[performedBy] || performedBy;
  };

  const translateCategory = (name: string) => {
    switch (name) {
      case "Sales Revenue":
        return t("finance.sales_revenue");
      case "Office Supplies":
        return t("finance.office_supplies");
      case "Marketing":
        return t("finance.marketing");
      case "Utilities":
        return t("finance.utilities");
      case "Equipment":
        return t("finance.equipment");
      case "Travel":
        return t("finance.travel");
      default:
        return name;
    }
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isEditTransactionOpen, setIsEditTransactionOpen] = useState(false);
  const [isViewTransactionOpen, setIsViewTransactionOpen] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isEditGoalOpen, setIsEditGoalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<FinancialGoal | null>(null);

  const [loans, setLoans] = useState<LoanRecord[]>(mockLoans);

  // Load borrow/lend records from backend
  useEffect(() => {
    let mounted = true;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

    const normalizeBorrow = (r: any): LoanRecord => {
      const toNum = (v: any) => {
        const n = typeof v === "string" ? parseFloat(v) : Number(v);
        return Number.isFinite(n) ? n : 0;
      };
      const type = String(r.type || "borrow").toLowerCase() === "lend" ? "lend" : "borrow";
      const partyTypeRaw = String(r.partyType || "other").toLowerCase();
      const partyType: LoanRecord["partyType"] = ["supplier", "client", "other"].includes(partyTypeRaw)
        ? (partyTypeRaw as any)
        : "other";
      const created = r.createdAt || r.date || new Date().toISOString();
      const due = r.returnDate || r.dueDate || "";
      const stRaw = String(r.status || "active").toLowerCase();
      let status: LoanRecord["status"] = stRaw === "returned" ? "returned" : stRaw === "overdue" ? "overdue" : "active";
      if (status === "active" && due) {
        const d = new Date(due);
        if (!Number.isNaN(d.getTime())) {
          const today = new Date();
          d.setHours(23,59,59,999);
          if (d.getTime() < today.getTime()) status = "overdue";
        }
      }
      return {
        id: String(r.id || r._id || crypto.randomUUID()),
        type,
        amount: toNum(r.amount),
        productName: r.productName || r.product || undefined,
        sku: r.sku || undefined,
        quantity: r.quantity ? Number(r.quantity) : undefined,
        partyType,
        partyName: r.partyName || r.userName || "",
        date: String(created),
        dueDate: String(due || ""),
        status,
        notes: r.notes || "",
      };
    };

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/borrow`, { headers });
        const data = await res.json().catch(() => null as any);
        const list: any[] = (data && (data.result || data.data || data)) || [];
        if (mounted && Array.isArray(list)) setLoans(list.map(normalizeBorrow));
      } catch (err) {
        // keep existing mockLoans on failure
        console.warn("Failed to load borrow/lend records", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [accessToken]);
  const [isAddLoanOpen, setIsAddLoanOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanRecord | null>(null);
  const [isEditLoanOpen, setIsEditLoanOpen] = useState(false);
  const [newLoan, setNewLoan] = useState<Partial<LoanRecord>>({
    type: "borrow",
    amount: 0,
    partyType: "supplier",
    partyName: "",
    date: new Date().toISOString(),
    dueDate: "",
    status: "active",
    notes: "",
  });

  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    type: "income",
    category: "",
    description: "",
    amount: 0,
    paymentMethod: "cash",
    performedBy: "",
    tags: [],
  });
  const [newGoal, setNewGoal] = useState<Partial<FinancialGoal>>({
    title: "",
    targetAmount: 0,
    currentAmount: 0,
    category: "",
    deadline: "",
  });
  const [timeFilter, setTimeFilter] = useState<
    "all" | "hour" | "day" | "week" | "month" | "year"
  >("all");
  const { toast } = useToast();

  const filteredTransactions = transactions
    .filter((transaction) => {
      const matchesSearch =
        transaction.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        typeFilter === "all" || transaction.type === typeFilter;
      const matchesCategory =
        categoryFilter === "all" || transaction.category === categoryFilter;
      const matchesTime = (() => {
        if (timeFilter === "all") return true;
        const txDate = new Date(transaction.date);
        if (Number.isNaN(txDate.getTime())) return false;
        const now = new Date();
        const diff = now.getTime() - txDate.getTime();
        const ranges: Record<string, number> = {
          hour: 60 * 60 * 1000,
          day: 24 * 60 * 60 * 1000,
          week: 7 * 24 * 60 * 60 * 1000,
          month: 30 * 24 * 60 * 60 * 1000,
          year: 365 * 24 * 60 * 60 * 1000,
        };
        return diff >= 0 && diff <= ranges[timeFilter];
      })();
      const matchesFilial = (() => {
        if (user?.role !== "manager" || !user?.filialId) return true;
        if (!transaction.performedBy) return false;
        const fid = usersFilialMap[transaction.performedBy];
        return fid ? String(fid) === String(user.filialId) : false;
      })();
      return (
        matchesSearch &&
        matchesType &&
        matchesCategory &&
        matchesTime &&
        matchesFilial
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalIncome = transactions
    .filter((t) => t.type === "income" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            {t("status.completed")}
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            {t("status.pending")}
          </Badge>
        );
      case "cancelled":
        return <Badge variant="destructive">{t("status.cancelled")}</Badge>;
      default:
        return <Badge variant="outline">{t("common.unknown")}</Badge>;
    }
  };

  const getLoanStatusBadge = (status: LoanRecord["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {t("status.active")}
          </Badge>
        );
      case "returned":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            {t("status.returned")}
          </Badge>
        );
      case "overdue":
        return <Badge variant="destructive">{t("status.overdue")}</Badge>;
    }
  };

  const getGoalStatusBadge = (status: string) => {
    switch (status) {
      case "on_track":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            {t("status.on_track")}
          </Badge>
        );
      case "behind":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            {t("status.behind")}
          </Badge>
        );
      case "achieved":
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            {t("status.achieved")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{t("common.unknown")}</Badge>;
    }
  };

  const clearNewTransaction = () => {
    setNewTransaction({
      type: "income",
      category: "",
      description: "",
      amount: 0,
      paymentMethod: "cash",
      performedBy: "",
      tags: [],
    });
  };

  const clearNewGoal = () => {
    setNewGoal({
      title: "",
      targetAmount: 0,
      currentAmount: 0,
      category: "",
      deadline: "",
    });
  };

  const addTransaction = () => {
    if (
      !newTransaction.category ||
      !newTransaction.description ||
      !newTransaction.amount
    ) {
      toast({
        title: t("common.error"),
        description: t("common.required_fields_error"),
        variant: "destructive",
      });
      return;
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      type: newTransaction.type as "income" | "expense",
      category: newTransaction.category!,
      description: newTransaction.description!,
      amount: newTransaction.amount!,
      date: new Date().toISOString().split("T")[0],
      paymentMethod: newTransaction.paymentMethod as any,
      status: "completed",
      performedBy: newTransaction.performedBy,
      tags: newTransaction.tags || [],
    };

    setTransactions([transaction, ...transactions]);
    clearNewTransaction();
    setIsAddTransactionOpen(false);

    toast({
      title: "Transaction added",
      description: `${transaction.type === "income" ? "Income" : "Expense"} of $${transaction.amount} has been recorded.`,
    });
  };

  const updateTransaction = async () => {
    if (
      !selectedTransaction ||
      !newTransaction.category ||
      !newTransaction.description
    ) {
      toast({
        title: t("common.error"),
        description: t("common.required_fields_error"),
        variant: "destructive",
      });
      return;
    }

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
      const url = `${API_BASE}/transactions/${encodeURIComponent(selectedTransaction.id)}`;
      const res = await fetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          category: newTransaction.category,
          description: newTransaction.description,
        }),
      });
      if (!res.ok) {
        const msg = await getErrorMessageFromResponse(res);
        throw new Error(msg);
      }

      const updatedTransaction: Transaction = {
        ...selectedTransaction,
        category: newTransaction.category!,
        description: newTransaction.description!,
      };
      setTransactions(
        transactions.map((t) =>
          t.id === selectedTransaction.id ? updatedTransaction : t,
        ),
      );
      clearNewTransaction();
      setIsEditTransactionOpen(false);
      setSelectedTransaction(null);

      toast({
        title: "Transaction updated",
        description: "Transaction has been updated successfully.",
      });
    } catch (e) {
      const message = (e as any)?.message || "Failed to update transaction";
      toast({
        title: "Update failed",
        description: String(message),
        variant: "destructive",
      });
    }
  };

  const deleteTransaction = (transactionId: string) => {
    const transaction = transactions.find((t) => t.id === transactionId);
    setTransactions(transactions.filter((t) => t.id !== transactionId));

    toast({
      title: "Transaction deleted",
      description: `Transaction "${transaction?.description}" has been removed.`,
    });
  };

  const openEditTransactionDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setNewTransaction({
      type: transaction.type,
      category: transaction.category,
      description: transaction.description,
      amount: transaction.amount,
      paymentMethod: transaction.paymentMethod,
      performedBy: transaction.performedBy,
      tags: transaction.tags,
    });
    setIsEditTransactionOpen(true);
  };

  const addGoal = () => {
    if (!newGoal.title || !newGoal.targetAmount || !newGoal.deadline) {
      toast({
        title: t("common.error"),
        description: t("common.required_fields_error"),
        variant: "destructive",
      });
      return;
    }

    const goal: FinancialGoal = {
      id: Date.now().toString(),
      title: newGoal.title!,
      targetAmount: newGoal.targetAmount!,
      currentAmount: newGoal.currentAmount || 0,
      deadline: newGoal.deadline!,
      category: newGoal.category || "General",
      status: "on_track",
    };

    setGoals([...goals, goal]);
    clearNewGoal();
    setIsAddGoalOpen(false);

    toast({
      title: "Goal created",
      description: `Financial goal "${goal.title}" has been created.`,
    });
  };

  const updateGoal = () => {
    if (
      !selectedGoal ||
      !newGoal.title ||
      !newGoal.targetAmount ||
      !newGoal.deadline
    ) {
      toast({
        title: t("common.error"),
        description: t("common.required_fields_error"),
        variant: "destructive",
      });
      return;
    }

    const updatedGoal: FinancialGoal = {
      ...selectedGoal,
      title: newGoal.title!,
      targetAmount: newGoal.targetAmount!,
      currentAmount: newGoal.currentAmount || selectedGoal.currentAmount,
      deadline: newGoal.deadline!,
      category: newGoal.category || "General",
    };

    setGoals(goals.map((g) => (g.id === selectedGoal.id ? updatedGoal : g)));
    clearNewGoal();
    setIsEditGoalOpen(false);
    setSelectedGoal(null);

    toast({
      title: "Goal updated",
      description: `Goal "${updatedGoal.title}" has been updated.`,
    });
  };

  const deleteGoal = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    setGoals(goals.filter((g) => g.id !== goalId));

    toast({
      title: "Goal deleted",
      description: `Goal "${goal?.title}" has been removed.`,
    });
  };

  const openEditGoalDialog = (goal: FinancialGoal) => {
    setSelectedGoal(goal);
    setNewGoal({
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      category: goal.category,
      deadline: goal.deadline,
    });
    setIsEditGoalOpen(true);
  };

  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string,
  ) => {
    const needsBOM = /csv/i.test(mimeType);
    const data = needsBOM ? "\uFEFF" + content : content;
    const blob = new Blob([data], { type: mimeType + ";charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const addLoan = () => {
    if (!newLoan.partyName || !newLoan.dueDate) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }
    const due = new Date(newLoan.dueDate as string).getTime();
    const today = new Date().setHours(0, 0, 0, 0);
    const status: LoanRecord["status"] = due < today ? "overdue" : "active";
    const loan: LoanRecord = {
      id: Date.now().toString(),
      type: newLoan.type as any,
      amount: Number(newLoan.amount) || 0,
      partyType: newLoan.partyType as any,
      partyName: newLoan.partyName!,
      date: (newLoan.date as string) || new Date().toISOString(),
      dueDate: newLoan.dueDate!,
      status,
      notes: newLoan.notes || "",
    };
    setLoans([loan, ...loans]);
    setIsAddLoanOpen(false);
    setNewLoan({
      type: "borrow",
      amount: 0,
      partyType: "supplier",
      partyName: "",
      date: new Date().toISOString(),
      dueDate: "",
      status: "active",
      notes: "",
    });
    toast({
      title: loan.type === "borrow" ? "Borrow recorded" : "Lend recorded",
      description: `Amount ${loan.type === "borrow" ? "borrowed" : "lent"} to ${loan.partyName}.`,
    });
  };

  const markLoanReturned = (loanId: string) => {
    setLoans(
      loans.map((l) => (l.id === loanId ? { ...l, status: "returned" } : l)),
    );
    toast({ title: "Marked as returned" });
  };

  const deleteLoan = (loanId: string) => {
    const loan = loans.find((l) => l.id === loanId);
    setLoans(loans.filter((l) => l.id !== loanId));
    toast({
      title: "Removed",
      description: `Record removed for ${loan?.partyName}.`,
    });
  };

  const openEditLoanDialog = (loan: LoanRecord) => {
    setSelectedLoan(loan);
    setNewLoan({
      id: loan.id,
      type: loan.type,
      amount: loan.amount,
      productName: loan.productName,
      sku: loan.sku,
      quantity: loan.quantity,
      partyType: loan.partyType,
      partyName: loan.partyName,
      date: loan.date?.split("T")[0] || loan.date,
      dueDate: loan.dueDate?.split("T")[0] || loan.dueDate,
      status: loan.status,
      notes: loan.notes || "",
    });
    setIsEditLoanOpen(true);
  };

  const updateLoan = () => {
    if (!selectedLoan) return;
    if (!newLoan.partyName || !newLoan.dueDate) {
      toast({
        title: t("common.error"),
        description: t("common.required_fields_error"),
        variant: "destructive",
      });
      return;
    }

    const updated: LoanRecord = {
      id: selectedLoan.id,
      type: (newLoan.type as any) || selectedLoan.type,
      amount: selectedLoan.amount,
      productName: newLoan.productName,
      sku: newLoan.sku,
      quantity: newLoan.quantity,
      partyType: (newLoan.partyType as any) || selectedLoan.partyType,
      partyName: newLoan.partyName!,
      date: (newLoan.date as string) || selectedLoan.date,
      dueDate: newLoan.dueDate!,
      status: (newLoan.status as any) || selectedLoan.status,
      notes: newLoan.notes || "",
    };

    setLoans(loans.map((l) => (l.id === selectedLoan.id ? updated : l)));
    setIsEditLoanOpen(false);
    setSelectedLoan(null);
    toast({ title: t("common.updated"), description: t("common.changes_saved", { defaultValue: "Changes saved" }) });
  };


  const exportFinanceReport = (format: "pdf" | "excel" | "csv") => {
    const reportData = {
      reportType: "Financial Report",
      generatedAt: new Date().toISOString(),
      summary: {
        totalIncome,
        totalExpenses,
        netProfit,
        profitMargin,
        pendingTransactions: transactions.filter((t) => t.status === "pending")
          .length,
      },
      transactions: filteredTransactions,
      goals,
      cashFlowData,
      expenseCategories,
    };

    switch (format) {
      case "pdf":
        downloadFile(
          generateFinancePDFContent(reportData),
          "financial-report.pdf",
          "application/pdf",
        );
        break;
      case "excel":
        downloadFile(
          generateFinanceExcelContent(reportData),
          "financial-report.xlsx",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
        break;
      case "csv":
        downloadFile(
          generateFinanceCSVContent(reportData),
          "financial-report.csv",
          "text/csv",
        );
        break;
    }

    toast({
      title: t("finance.toast.exported_title"),
      description: t("finance.toast.exported_desc", {
        format: format.toUpperCase(),
      }),
    });
  };

  const exportTransactions = () => {
    const headers = [
      t("common.date"),
      t("finance.transaction_type"),
      t("category", { defaultValue: "Category" }),
      t("common.description"),
      t("common.amount"),
      t("sales.payment_method"),
      t("common.status"),
      t("finance.performed_by"),
      "Tags",
    ];
    let csv = headers.join(",") + "\n";
    filteredTransactions.forEach((transaction) => {
      csv += `${transaction.date},${transaction.type},${transaction.category},"${transaction.description}",${transaction.amount},${transaction.paymentMethod.replace("_", " ")},${transaction.status},${transaction.performedBy || ""},"${transaction.tags.join(", ")}"\n`;
    });

    downloadFile(csv, "transactions.csv", "text/csv");
    toast({
      title: t("finance.toast.transactions_exported_title"),
      description: t("finance.toast.transactions_exported_desc"),
    });
  };

  const exportGoals = () => {
    const headers = [
      t("finance.goal_title"),
      t("finance.target_amount"),
      t("finance.current_amount"),
      "%",
      t("sales.due_date", { defaultValue: "Due Date" }),
      t("category", { defaultValue: "Category" }),
      t("common.status"),
    ];
    let csv = headers.join(",") + "\n";
    goals.forEach((goal) => {
      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      csv += `"${goal.title}",${goal.targetAmount},${goal.currentAmount},${progress.toFixed(1)},${goal.deadline},${goal.category},${goal.status}\n`;
    });

    downloadFile(csv, "financial-goals.csv", "text/csv");
    toast({
      title: t("finance.toast.goals_exported_title"),
      description: t("finance.toast.goals_exported_desc"),
    });
  };

  const generateFinancePDFContent = (data: any) => {
    return `
${t("finance.report_title", { defaultValue: "FINANCIAL REPORT" })}
================
${t("finance.generated_at", { defaultValue: "Generated" })}: ${new Date(data.generatedAt).toLocaleString()}

${t("finance.executive_summary", { defaultValue: "EXECUTIVE SUMMARY" })}
=================
${t("finance.total_income")}: $${data.summary.totalIncome.toLocaleString()}
${t("finance.total_expenses")}: $${data.summary.totalExpenses.toLocaleString()}
${t("finance.net_profit")}: $${data.summary.netProfit.toLocaleString()}
${t("finance.profit_margin")}: ${data.summary.profitMargin.toFixed(1)}%
${t("finance.pending_transactions")}: ${data.summary.pendingTransactions}

${t("finance.cash_flow_trend")}
==================
${data.cashFlowData.map((item: any) => `${item.month}: ${t("finance.income")} $${item.income.toLocaleString()}, ${t("finance.expenses")} $${item.expenses.toLocaleString()}, ${t("finance.profit")} $${item.profit.toLocaleString()}`).join("\n")}

${t("finance.expense_breakdown")}
=================
${data.expenseCategories.map((cat: any) => `${cat.name}: $${cat.value.toLocaleString()}`).join("\n")}

${t("finance.financial_goals")}
===============
${data.goals.map((goal: any) => `${goal.title}: $${goal.currentAmount.toLocaleString()}/$${goal.targetAmount.toLocaleString()} (${((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)}%) - ${goal.status}`).join("\n")}

${t("finance.recent_transactions", { defaultValue: "RECENT TRANSACTIONS" })}
===================
${data.transactions
  .slice(0, 20)
  .map(
    (t: any) =>
      `${t.date} - ${t.type.toUpperCase()}: ${t.description} - $${t.amount.toLocaleString()}`,
  )
  .join("\n")}
    `;
  };

  const generateFinanceExcelContent = (data: any) => {
    return generateFinanceCSVContent(data);
  };

  const generateFinanceCSVContent = (data: any) => {
    let csv = "";

    // Summary
    csv += "Financial Summary\n";
    csv += `Generated,${new Date(data.generatedAt).toLocaleString()}\n`;
    csv += "\n";
    csv += "Metric,Amount\n";
    csv += `Total Income,$${data.summary.totalIncome.toLocaleString()}\n`;
    csv += `Total Expenses,$${data.summary.totalExpenses.toLocaleString()}\n`;
    csv += `Net Profit,$${data.summary.netProfit.toLocaleString()}\n`;
    csv += `Profit Margin,${data.summary.profitMargin.toFixed(1)}%\n`;
    csv += `Pending Transactions,${data.summary.pendingTransactions}\n`;
    csv += "\n";

    // Cash Flow
    csv += "Monthly Cash Flow\n";
    csv += "Month,Income,Expenses,Profit\n";
    data.cashFlowData.forEach((item: any) => {
      csv += `${item.month},$${item.income.toLocaleString()},$${item.expenses.toLocaleString()},$${item.profit.toLocaleString()}\n`;
    });
    csv += "\n";

    // Expense Categories
    csv += "Expense Categories\n";
    csv += "Category,Amount\n";
    data.expenseCategories.forEach((cat: any) => {
      csv += `${cat.name},$${cat.value.toLocaleString()}\n`;
    });
    csv += "\n";

    // Financial Goals
    csv += "Financial Goals\n";
    csv +=
      "Title,Target Amount,Current Amount,Progress %,Deadline,Category,Status\n";
    data.goals.forEach((goal: any) => {
      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      csv += `"${goal.title}",$${goal.targetAmount.toLocaleString()},$${goal.currentAmount.toLocaleString()},${progress.toFixed(1)}%,${goal.deadline},${goal.category},${goal.status}\n`;
    });
    csv += "\n";

    // Transactions
    csv += "Transactions\n";
    csv +=
      "Date,Type,Category,Description,Amount,Payment Method,Status,Performed By,Tags\n";
    data.transactions.forEach((transaction: any) => {
      csv += `${transaction.date},${transaction.type},${transaction.category},"${transaction.description}",$${transaction.amount.toLocaleString()},${transaction.paymentMethod.replace("_", " ")},${transaction.status},${transaction.performedBy || ""},"${transaction.tags.join(", ")}"\n`;
    });

    return csv;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("finance.title")}
          </h1>
          <p className="text-muted-foreground">{t("finance.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                {t("dashboard.export_report")}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>
                {t("finance.export_financial_report")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-2 space-y-1">
                <div className="text-xs text-muted-foreground mb-2">
                  {t("finance.reports_analytics")}
                </div>
                <DropdownMenuItem
                  onClick={() => exportFinanceReport("pdf")}
                  className="cursor-pointer"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  <div className="flex-1">
                    <div className="font-medium">
                      {t("finance.export_pdf_title")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t("finance.export_pdf_desc")}
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => exportFinanceReport("excel")}
                  className="cursor-pointer"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  <div className="flex-1">
                    <div className="font-medium">
                      {t("finance.export_excel_title")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t("finance.export_excel_desc")}
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => exportFinanceReport("csv")}
                  className="cursor-pointer"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  <div className="flex-1">
                    <div className="font-medium">
                      {t("finance.export_csv_title")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t("finance.export_csv_desc")}
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => exportTransactions()}
                  className="cursor-pointer"
                >
                  <Download className="mr-2 h-4 w-4" />
                  <div className="flex-1">
                    <div className="font-medium">
                      {t("finance.export_transactions_title")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t("finance.export_transactions_desc")}
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => exportGoals()}
                  className="cursor-pointer"
                >
                  <Download className="mr-2 h-4 w-4" />
                  <div className="flex-1">
                    <div className="font-medium">
                      {t("finance.financial_goals")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t("finance.track_financial_objectives")}
                    </div>
                  </div>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog
            open={isAddTransactionOpen}
            onOpenChange={setIsAddTransactionOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("finance.add_transaction")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{t("finance.add_new_transaction")}</DialogTitle>
                <DialogDescription>
                  {t("finance.record_transaction")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">{t("finance.transaction_type")}</Label>
                  <Select
                    value={newTransaction.type}
                    onValueChange={(value) =>
                      setNewTransaction({
                        ...newTransaction,
                        type: value as any,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">
                        {t("finance.income")}
                      </SelectItem>
                      <SelectItem value="expense">
                        {t("finance.expense")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">{t("warehouse.category")}</Label>
                  <Input
                    id="category"
                    placeholder={t("finance.category_placeholder")}
                    value={newTransaction.category}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        category: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t("common.description")}</Label>
                  <Input
                    id="description"
                    placeholder={t("finance.transaction_description")}
                    value={newTransaction.description}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">{t("finance.amount_label")}</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={newTransaction.amount}
                      onChange={(e) =>
                        setNewTransaction({
                          ...newTransaction,
                          amount: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">
                      {t("sales.payment_method")}
                    </Label>
                    <Select
                      value={newTransaction.paymentMethod}
                      onValueChange={(value) =>
                        setNewTransaction({
                          ...newTransaction,
                          paymentMethod: value as any,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">{t("sales.cash")}</SelectItem>
                        <SelectItem value="card">{t("sales.card")}</SelectItem>
                        <SelectItem value="bank_transfer">
                          {t("sales.bank_transfer")}
                        </SelectItem>
                        <SelectItem value="check">
                          {t("finance.check")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="performedBy">
                    {t("finance.performed_by_optional")}
                  </Label>
                  <Input
                    id="performedBy"
                    placeholder="e.g., Cashier #12, Accounting"
                    value={newTransaction.performedBy || ""}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        performedBy: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={addTransaction}>
                    {t("finance.add_transaction")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      clearNewTransaction();
                      setIsAddTransactionOpen(false);
                    }}
                  >
                    {t("common.cancel")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("finance.total_income")}
            </CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +12.5% {t("dashboard.from_last_month")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("finance.total_expenses")}
            </CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${totalExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +5.2% {t("dashboard.from_last_month")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("finance.net_profit")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              ${netProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {profitMargin.toFixed(1)}% {t("finance.profit_margin")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("finance.pending_transactions")}
            </CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions.filter((t) => t.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("finance.awaiting_completion")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">
            {t("finance.transactions")}
          </TabsTrigger>
          <TabsTrigger value="debts">{t("finance.debts_lends")}</TabsTrigger>
          <TabsTrigger value="reports">
            {t("finance.reports_analytics")}
          </TabsTrigger>
          <TabsTrigger value="goals">
            {t("finance.financial_goals")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          {/* Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>{t("finance.transaction_history")}</CardTitle>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("finance.search_transactions")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[130px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder={t("common.type")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("finance.all_types")}
                    </SelectItem>
                    <SelectItem value="income">
                      {t("finance.income")}
                    </SelectItem>
                    <SelectItem value="expense">
                      {t("finance.expense")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder={t("warehouse.category")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("finance.all_categories")}
                    </SelectItem>
                    <SelectItem value="Sales Revenue">
                      {t("finance.sales_revenue")}
                    </SelectItem>
                    <SelectItem value="Office Supplies">
                      {t("finance.office_supplies")}
                    </SelectItem>
                    <SelectItem value="Marketing">
                      {t("finance.marketing")}
                    </SelectItem>
                    <SelectItem value="Utilities">
                      {t("finance.utilities")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-[150px]">
                    <Clock className="mr-2 h-4 w-4" />
                    <SelectValue placeholder={t("common.date_time")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("finance.all_time")}</SelectItem>
                    <SelectItem value="hour">
                      {t("finance.last_hour")}
                    </SelectItem>
                    <SelectItem value="day">{t("finance.last_day")}</SelectItem>
                    <SelectItem value="week">
                      {t("finance.last_week")}
                    </SelectItem>
                    <SelectItem value="month">
                      {t("finance.last_month")}
                    </SelectItem>
                    <SelectItem value="year">
                      {t("finance.last_year")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("common.date")}</TableHead>
                    <TableHead>{t("clients.type")}</TableHead>
                    <TableHead>{t("warehouse.category")}</TableHead>
                    <TableHead>{t("common.description")}</TableHead>
                    <TableHead>{t("common.amount")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead>{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            transaction.type === "income"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            transaction.type === "income"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {transaction.type === "income"
                            ? t("finance.income")
                            : t("finance.expense")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {translateCategory(transaction.category)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {formatDescription(transaction.description)}
                          </div>
                          {transaction.performedBy && (
                            <div className="text-sm text-muted-foreground">
                              {t("finance.performed_by")}:{" "}
                              {getPerformedByDisplay(transaction.performedBy)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell
                        className={`font-medium ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                      >
                        {transaction.type === "income" ? "+" : "-"}$
                        {transaction.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setIsViewTransactionOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              openEditTransactionDialog(transaction)
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debts" className="space-y-4">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>{t("finance.debts_title")}</CardTitle>
                <CardDescription>{t("finance.debts_subtitle")}</CardDescription>
              </div>
              <Dialog open={isAddLoanOpen} onOpenChange={setIsAddLoanOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t("finance.record_borrow_lend")}</DialogTitle>
                    <DialogDescription>
                      {t("finance.create_borrow_lend_desc")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t("clients.type")}</Label>
                      <Select
                        value={newLoan.type}
                        onValueChange={(v) =>
                          setNewLoan({ ...newLoan, type: v as any })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="borrow">
                            {t("finance.borrow_label")}
                          </SelectItem>
                          <SelectItem value="lend">
                            {t("finance.lend_label")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("warehouse.product")}</Label>
                      <Input
                        placeholder={t("warehouse.product_name")}
                        value={newLoan.productName}
                        onChange={(e) =>
                          setNewLoan({
                            ...newLoan,
                            productName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("warehouse.sku")}</Label>
                        <Input
                          placeholder="SKU"
                          value={newLoan.sku || ""}
                          onChange={(e) =>
                            setNewLoan({ ...newLoan, sku: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("warehouse.quantity")}</Label>
                        <Input
                          type="number"
                          min="1"
                          value={newLoan.quantity || 1}
                          onChange={(e) =>
                            setNewLoan({
                              ...newLoan,
                              quantity: parseInt(e.target.value) || 1,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("finance.party_type")}</Label>
                        <Select
                          value={newLoan.partyType}
                          onValueChange={(v) =>
                            setNewLoan({ ...newLoan, partyType: v as any })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="supplier">
                              {t("warehouse.supplier")}
                            </SelectItem>
                            <SelectItem value="client">
                              {t("sales.client")}
                            </SelectItem>
                            <SelectItem value="other">
                              {t("warehouse.other")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("finance.party_name")}</Label>
                        <Input
                          placeholder={t("finance.party_name_placeholder")}
                          value={newLoan.partyName || ""}
                          onChange={(e) =>
                            setNewLoan({
                              ...newLoan,
                              partyName: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("common.date")}</Label>
                        <Input
                          type="date"
                          value={newLoan.date || ""}
                          onChange={(e) =>
                            setNewLoan({ ...newLoan, date: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("sales.due_date")}</Label>
                        <Input
                          type="date"
                          value={newLoan.dueDate || ""}
                          onChange={(e) =>
                            setNewLoan({ ...newLoan, dueDate: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("warehouse.notes")}</Label>
                      <Textarea
                        placeholder={t(
                          "warehouse.additional_notes_placeholder",
                        )}
                        value={newLoan.notes || ""}
                        onChange={(e) =>
                          setNewLoan({ ...newLoan, notes: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={addLoan}>
                        {t("common.save")}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddLoanOpen(false)}
                      >
                        {t("common.cancel")}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("common.date")}</TableHead>
                    <TableHead>{t("clients.type")}</TableHead>
                    <TableHead>{t("common.amount")}</TableHead>
                    <TableHead>{t("finance.party")}</TableHead>
                    <TableHead>{t("sales.due_date")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead>{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell>
                        {new Intl.DateTimeFormat(i18n.language || "en", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        }).format(new Date(loan.date))}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            loan.type === "borrow" ? "secondary" : "default"
                          }
                          className={
                            loan.type === "borrow"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }
                        >
                          {loan.type === "borrow"
                            ? t("finance.borrow")
                            : t("finance.lend")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">${(loan.amount ?? 0).toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <div>{loan.partyName}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {loan.partyType}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {loan.dueDate}
                        </div>
                      </TableCell>
                      <TableCell>{getLoanStatusBadge(loan.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditLoanDialog(loan)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {loan.status !== "returned" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markLoanReturned(loan.id)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteLoan(loan.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {loans.length === 0 && (
                <div className="text-sm text-muted-foreground mt-2">
                  {t("finance.no_borrow_lend")}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {/* Reports & Analytics */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("finance.cash_flow_trend")}</CardTitle>
                <CardDescription>
                  {t("finance.monthly_income_expenses")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend
                      formatter={(v) =>
                        v === "income"
                          ? t("finance.income")
                          : v === "expenses"
                            ? t("finance.expenses")
                            : t("finance.profit")
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#22c55e"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="#ef4444"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("finance.expense_breakdown")}</CardTitle>
                <CardDescription>
                  {t("finance.expenses_by_category")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={expenseCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${translateCategory(name)}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expenseCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>{t("finance.monthly_performance")}</CardTitle>
              <CardDescription>
                {t("finance.income_expenses_profit")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend
                    formatter={(v) =>
                      v === "income"
                        ? t("finance.income")
                        : v === "expenses"
                          ? t("finance.expenses")
                          : t("finance.profit")
                    }
                  />
                  <Bar dataKey="income" fill="#22c55e" />
                  <Bar dataKey="expenses" fill="#ef4444" />
                  <Bar dataKey="profit" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          {/* Financial Goals */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                {t("finance.financial_goals")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("finance.track_financial_objectives")}
              </p>
            </div>
            <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("finance.create_financial_goal")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {t("finance.create_financial_goal")}
                  </DialogTitle>
                  <DialogDescription>
                    {t("finance.set_financial_target")}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="goalTitle">{t("finance.goal_title")}</Label>
                    <Input
                      id="goalTitle"
                      placeholder="e.g., Q2 Revenue Target"
                      value={newGoal.title}
                      onChange={(e) =>
                        setNewGoal({ ...newGoal, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="targetAmount">
                        {t("finance.target_amount")}
                      </Label>
                      <Input
                        id="targetAmount"
                        type="number"
                        placeholder="0.00"
                        value={newGoal.targetAmount}
                        onChange={(e) =>
                          setNewGoal({
                            ...newGoal,
                            targetAmount: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentAmount">
                        {t("finance.current_amount")}
                      </Label>
                      <Input
                        id="currentAmount"
                        type="number"
                        placeholder="0.00"
                        value={newGoal.currentAmount}
                        onChange={(e) =>
                          setNewGoal({
                            ...newGoal,
                            currentAmount: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deadline">
                        {t("dashboard.deadline")}
                      </Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={newGoal.deadline}
                        onChange={(e) =>
                          setNewGoal({ ...newGoal, deadline: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goalCategory">
                        {t("warehouse.category")}
                      </Label>
                      <Input
                        id="goalCategory"
                        placeholder="e.g., Revenue, Savings, Capital"
                        value={newGoal.category}
                        onChange={(e) =>
                          setNewGoal({ ...newGoal, category: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={addGoal}>
                      {t("finance.create_goal")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        clearNewGoal();
                        setIsAddGoalOpen(false);
                      }}
                    >
                      {t("common.cancel")}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{goal.title}</span>
                    {getGoalStatusBadge(goal.status)}
                  </CardTitle>
                  <CardDescription>{goal.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{t("finance.progress")}</span>
                        <span>
                          {Math.round(
                            (goal.currentAmount / goal.targetAmount) * 100,
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {t("dashboard.current")}
                        </p>
                        <p className="font-semibold">
                          ${goal.currentAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {t("finance.target")}
                        </p>
                        <p className="font-semibold">
                          ${goal.targetAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {t("dashboard.deadline")}: {goal.deadline}
                    </div>
                    <div className="flex gap-1 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEditGoalDialog(goal)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Transaction Dialog */}
      <Dialog
        open={isEditTransactionOpen}
        onOpenChange={setIsEditTransactionOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("finance.edit_transaction")}</DialogTitle>
            <DialogDescription>
              {t("finance.edit_transaction_note")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-type">{t("finance.transaction_type")}</Label>
              <Select
                disabled
                value={newTransaction.type}
                onValueChange={(value) =>
                  setNewTransaction({ ...newTransaction, type: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">{t("finance.income")}</SelectItem>
                  <SelectItem value="expense">
                    {t("finance.expense")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">{t("warehouse.category")}</Label>
              <Input
                id="edit-category"
                value={newTransaction.category}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    category: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">
                {t("common.description")}
              </Label>
              <Input
                id="edit-description"
                value={newTransaction.description}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-amount">{t("finance.amount_label")}</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  disabled
                  value={newTransaction.amount}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-paymentMethod">
                  {t("sales.payment_method")}
                </Label>
                <Select
                  disabled
                  value={newTransaction.paymentMethod}
                  onValueChange={(value) =>
                    setNewTransaction({
                      ...newTransaction,
                      paymentMethod: value as any,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">{t("sales.cash")}</SelectItem>
                    <SelectItem value="card">{t("sales.card")}</SelectItem>
                    <SelectItem value="bank_transfer">
                      {t("sales.bank_transfer")}
                    </SelectItem>
                    <SelectItem value="check">{t("finance.check")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="flex-1">
                    {t("finance.update_transaction")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t("finance.confirm_update_title")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("finance.confirm_update_desc")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction onClick={updateTransaction}>
                      {t("common.confirm")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                variant="outline"
                onClick={() => {
                  clearNewTransaction();
                  setIsEditTransactionOpen(false);
                  setSelectedTransaction(null);
                }}
              >
                {t("common.cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Borrow/Lend Dialog */}
      <Dialog open={isEditLoanOpen} onOpenChange={setIsEditLoanOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("common.edit")} {t("finance.borrow_lend")}
            </DialogTitle>
            <DialogDescription>{t("finance.create_borrow_lend_desc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("clients.type")}</Label>
                <Select
                  value={newLoan.type}
                  onValueChange={(v) => setNewLoan({ ...newLoan, type: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="borrow">{t("finance.borrow_label")}</SelectItem>
                    <SelectItem value="lend">{t("finance.lend_label")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("finance.amount_label")}</Label>
                <Input
                  disabled
                  value={`${Number(selectedLoan?.amount ?? newLoan.amount ?? 0).toFixed(2)}`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("warehouse.product")}</Label>
              <Input
                placeholder={t("warehouse.product_name")}
                value={newLoan.productName || ""}
                onChange={(e) => setNewLoan({ ...newLoan, productName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("warehouse.sku")}</Label>
                <Input
                  placeholder="SKU"
                  value={newLoan.sku || ""}
                  onChange={(e) => setNewLoan({ ...newLoan, sku: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("warehouse.quantity")}</Label>
                <Input
                  type="number"
                  min="1"
                  value={newLoan.quantity || 1}
                  onChange={(e) =>
                    setNewLoan({
                      ...newLoan,
                      quantity: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("finance.party_type")}</Label>
                <Select
                  value={newLoan.partyType}
                  onValueChange={(v) => setNewLoan({ ...newLoan, partyType: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supplier">{t("warehouse.supplier")}</SelectItem>
                    <SelectItem value="client">{t("sales.client")}</SelectItem>
                    <SelectItem value="other">{t("warehouse.other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("finance.party_name")}</Label>
                <Input
                  placeholder={t("finance.party_name_placeholder")}
                  value={newLoan.partyName || ""}
                  onChange={(e) => setNewLoan({ ...newLoan, partyName: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("common.date")}</Label>
                <Input
                  type="date"
                  value={(newLoan.date as string) || ""}
                  onChange={(e) => setNewLoan({ ...newLoan, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("sales.due_date")}</Label>
                <Input
                  type="date"
                  value={newLoan.dueDate || ""}
                  onChange={(e) => setNewLoan({ ...newLoan, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("common.status")}</Label>
                <Select
                  value={newLoan.status}
                  onValueChange={(v) => setNewLoan({ ...newLoan, status: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t("status.active")}</SelectItem>
                    <SelectItem value="returned">{t("status.returned")}</SelectItem>
                    <SelectItem value="overdue">{t("status.overdue")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("warehouse.notes")}</Label>
              <Textarea
                placeholder={t("warehouse.additional_notes_placeholder")}
                value={newLoan.notes || ""}
                onChange={(e) => setNewLoan({ ...newLoan, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={updateLoan}>
                {t("common.update", { defaultValue: "Update" })}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditLoanOpen(false);
                  setSelectedLoan(null);
                }}
              >
                {t("common.cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Transaction Dialog */}
      <Dialog
        open={isViewTransactionOpen}
        onOpenChange={setIsViewTransactionOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("finance.transaction_details")}</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <DetailCard
              title={formatDescription(selectedTransaction.description)}
              subtitle={`${selectedTransaction.category} • ${selectedTransaction.date}`}
              left={[
                {
                  label: t("sales.payment_method"),
                  value: (
                    <div className="capitalize">
                      {selectedTransaction.paymentMethod.replace("_", " ")}
                    </div>
                  ),
                },
                {
                  label: t("common.status"),
                  value: getStatusBadge(selectedTransaction.status),
                },
              ]}
              right={[
                {
                  label: t("finance.performed_by"),
                  value:
                    getPerformedByDisplay(selectedTransaction.performedBy) ||
                    "-",
                },
                {
                  label: "Tags",
                  value: (
                    <div className="flex gap-1 flex-wrap">
                      {selectedTransaction.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ),
                },
              ]}
              stats={[
                {
                  label: t("common.amount"),
                  value: `${selectedTransaction.type === "income" ? "+" : "-"}$${selectedTransaction.amount.toLocaleString()}`,
                },
              ]}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog open={isEditGoalOpen} onOpenChange={setIsEditGoalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("finance.edit_financial_goal")}</DialogTitle>
            <DialogDescription>
              {t("finance.update_goal_desc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-goalTitle">{t("finance.goal_title")}</Label>
              <Input
                id="edit-goalTitle"
                value={newGoal.title}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, title: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-targetAmount">
                  {t("finance.target_amount")}
                </Label>
                <Input
                  id="edit-targetAmount"
                  type="number"
                  value={newGoal.targetAmount}
                  onChange={(e) =>
                    setNewGoal({
                      ...newGoal,
                      targetAmount: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-currentAmount">
                  {t("finance.current_amount")}
                </Label>
                <Input
                  id="edit-currentAmount"
                  type="number"
                  value={newGoal.currentAmount}
                  onChange={(e) =>
                    setNewGoal({
                      ...newGoal,
                      currentAmount: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-deadline">{t("dashboard.deadline")}</Label>
                <Input
                  id="edit-deadline"
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, deadline: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-goalCategory">
                  {t("warehouse.category")}
                </Label>
                <Input
                  id="edit-goalCategory"
                  value={newGoal.category}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, category: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={updateGoal}>
                {t("finance.update_goal")}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  clearNewGoal();
                  setIsEditGoalOpen(false);
                  setSelectedGoal(null);
                }}
              >
                {t("common.cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
