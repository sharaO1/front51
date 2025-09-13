import { RequestHandler } from "express";

const products = [
  { id: "p-1", name: "Air Conditioner", unitPrice: 499.99, category: "Appliances", stock: 12 },
  { id: "p-2", name: "iPhone 13 Pro", unitPrice: 999.0, category: "Smartphones", stock: 5 },
  { id: "p-3", name: "Samsung S24Ultra 512/16", unitPrice: 1199.0, category: "Smartphones", stock: 7 },
  { id: "p-4", name: "AirPods Pro", unitPrice: 199.0, category: "Accessories", stock: 30 },
  { id: "p-5", name: "Dell XPS 13", unitPrice: 1099.0, category: "Laptops", stock: 4 },
];

export const handleProducts: RequestHandler = (_req, res) => {
  res.json({ ok: true, result: products });
};
