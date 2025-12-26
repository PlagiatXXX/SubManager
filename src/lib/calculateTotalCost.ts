import type { Subscription } from "../types";
import { calculateCost } from "./calculateCost";

export const calculateTotalCost = (
  subscriptions: Subscription[],
  baseCurrency: string,
  rates: Record<string, number>,
  viewMode: "monthly" | "yearly"
): number => {
  return subscriptions.reduce((acc, curr) => {
    if (!curr.isActive) return acc;
    return acc + calculateCost(curr, baseCurrency, rates, viewMode);
  }, 0);
};