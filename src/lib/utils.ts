import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Category } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CATEGORY_LABELS: Record<Category, string> = {
  entertainment: 'Развлечение',
  work: 'Работа',
  utilities: 'Утилиты',
  other: 'Другое',
};

export const getCategoryLabel = (category: Category): string => {
  return CATEGORY_LABELS[category] || category;
};