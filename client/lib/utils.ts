import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import i18n from "./i18n";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  value: number | null | undefined,
  opts?: {
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    locale?: string;
  },
): string {
  const amount = Number(value || 0);
  const {
    currency = "USD",
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    locale,
  } = opts || {};

  const lng =
    locale ||
    (typeof i18n?.language === "string" && i18n.language) ||
    (typeof navigator !== "undefined" ? navigator.language : "en");

  try {
    return new Intl.NumberFormat(lng, {
      style: "currency",
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount);
  } catch {
    return `$${amount.toLocaleString()}`;
  }
}
