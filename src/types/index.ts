export type Currency = 'RUB' | 'USD' | 'EUR';
export type Cycle = 'monthly' | 'yearly';
export type Category = 'entertainment' | 'work' | 'utilities' | 'other';

export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: Currency;
  cycle: Cycle;
  category: Category;
  nextPaymentDate: string; // ISO формат даты (YYYY-MM-DD)
  isActive: boolean;
}