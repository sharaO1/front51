/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// Dashboard sales summary types
export interface SalesProduct {
  id: string;
  name: string;
  unitsSold: number;
  revenue: number; // total money received for this product
  profit: number; // profit earned for this product
}

export interface SalesSummaryResponse {
  ok: true;
  result: {
    products: SalesProduct[];
    totals: {
      units: number;
      revenue: number;
      profit: number;
    };
  };
}
