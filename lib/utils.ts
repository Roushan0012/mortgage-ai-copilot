import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names safely with Tailwind CSS precedence.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as USD currency ($XXX,XXX).
 */
export function formatCurrency(amount: number, minimumFractionDigits = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a decimal or ratio as percentage (e.g. 0.065 -> 6.50% or 43 -> 43.0%).
 */
export function formatPercent(value: number, isDecimal = false, fractionDigits = 2): string {
  const normalized = isDecimal ? value * 100 : value;
  return `${normalized.toFixed(fractionDigits)}%`;
}

/**
 * Format ISO date string into human readable mortgage consultation format.
 */
export function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(date);
  } catch {
    return isoString;
  }
}

/**
 * Mask Social Security Number to GLBA / NPI compliant format (***-**-6789).
 */
export function maskSSN(ssn: string): string {
  const digits = ssn.replace(/\D/g, "");
  if (digits.length < 4) return "***-**-****";
  const lastFour = digits.slice(-4);
  return `***-**-${lastFour}`;
}

/**
 * Format seconds into mm:ss time display.
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Generate unique IDs for entities.
 */
export function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
}
