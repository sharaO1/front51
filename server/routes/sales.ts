import { RequestHandler } from "express";
import { SalesSummaryResponse } from "@shared/api";

// Demo dataset; in a real app, source from DB/services
const products = [
  { id: "p-iphone-15", name: "iPhone 15 Pro", unitsSold: 145, revenue: 174999, profit: 34999 },
  { id: "p-galaxy-s24", name: "Samsung Galaxy S24", unitsSold: 132, revenue: 118800, profit: 23760 },
  { id: "p-macbook-air-m3", name: "MacBook Air M3", unitsSold: 46, revenue: 517540, profit: 103508 },
  { id: "p-airpods-pro", name: "AirPods Pro (2nd Gen)", unitsSold: 210, revenue: 57990, profit: 17397 },
  { id: "p-kindle", name: "Kindle Paperwhite", unitsSold: 88, revenue: 11880, profit: 3564 },
];

export const handleSalesSummary: RequestHandler = (_req, res) => {
  const totals = products.reduce(
    (acc, p) => {
      acc.units += p.unitsSold;
      acc.revenue += p.revenue;
      acc.profit += p.profit;
      return acc;
    },
    { units: 0, revenue: 0, profit: 0 },
  );

  const response: SalesSummaryResponse = {
    ok: true,
    result: {
      products,
      totals,
    },
  };

  res.json(response);
};
