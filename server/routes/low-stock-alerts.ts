import { RequestHandler } from "express";

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

const mockProducts = [
  {
    id: "p-1",
    name: "Air Conditioner",
    unitPrice: 499.99,
    category: "Appliances",
    stock: 12,
    minStock: 20,
    maxStock: 100,
  },
  {
    id: "p-2",
    name: "iPhone 13 Pro",
    unitPrice: 999.0,
    category: "Smartphones",
    stock: 5,
    minStock: 15,
    maxStock: 50,
  },
  {
    id: "p-3",
    name: "Samsung S24Ultra 512/16",
    unitPrice: 1199.0,
    category: "Smartphones",
    stock: 7,
    minStock: 10,
    maxStock: 40,
  },
  {
    id: "p-4",
    name: "AirPods Pro",
    unitPrice: 199.0,
    category: "Accessories",
    stock: 30,
    minStock: 20,
    maxStock: 100,
  },
  {
    id: "p-5",
    name: "Dell XPS 13",
    unitPrice: 1099.0,
    category: "Laptops",
    stock: 4,
    minStock: 8,
    maxStock: 30,
  },
];

export const handleLowStockAlerts: RequestHandler = (_req, res) => {
  const alerts: LowStockAlert[] = mockProducts
    .filter((product) => product.stock < product.minStock)
    .map((product) => {
      const stockPercentage = (product.stock / product.minStock) * 100;
      let status: "critical" | "warning" | "moderate";

      if (stockPercentage < 25) {
        status = "critical";
      } else if (stockPercentage < 50) {
        status = "warning";
      } else {
        status = "moderate";
      }

      return {
        id: `alert-${product.id}`,
        productId: product.id,
        productName: product.name,
        category: product.category,
        currentStock: product.stock,
        minRequired: product.minStock,
        maxStock: product.maxStock,
        unitPrice: product.unitPrice,
        status,
        stockPercentage: Math.round(stockPercentage),
        reorderQuantity: product.maxStock - product.stock,
        supplier: "Supplier " + product.id,
        lastRestockDate: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        )
          .toISOString()
          .split("T")[0],
        createdAt: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

  res.json({
    success: true,
    data: alerts,
    summary: {
      total: alerts.length,
      critical: alerts.filter((a) => a.status === "critical").length,
      warning: alerts.filter((a) => a.status === "warning").length,
      moderate: alerts.filter((a) => a.status === "moderate").length,
      totalProducts: mockProducts.length,
    },
  });
};

export const handleAcknowledgeAlert: RequestHandler = (req, res) => {
  const { alertId } = req.params;

  res.json({
    success: true,
    message: `Alert ${alertId} acknowledged successfully`,
  });
};

export const handleDismissAlert: RequestHandler = (req, res) => {
  const { alertId } = req.params;

  res.json({
    success: true,
    message: `Alert ${alertId} dismissed successfully`,
  });
};
