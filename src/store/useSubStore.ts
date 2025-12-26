// src/store/useSubStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Subscription } from '../types';
import { fetchRates } from '../lib/currencyApi';

// Используем правильные английские значения, соответствующие типам
const initialData: Subscription[] = [
  {
    id: '1',
    name: 'Netflix',
    price: 500,
    currency: 'RUB',
    cycle: 'monthly',
    category: 'entertainment',
    nextPaymentDate: new Date().toISOString().split('T')[0],
    isActive: true,
  },
  {
    id: '2',
    name: 'Spotify',
    price: 2400,
    currency: 'RUB',
    cycle: 'yearly',
    category: 'entertainment',
    nextPaymentDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    isActive: true,
  },
];

interface SubscriptionStore {
  subscriptions: Subscription[];

   baseCurrency: 'RUB' | 'USD' | 'EUR'; // Валюта, в которой хотим видеть итог
  viewMode: 'monthly' | 'yearly';      // Показывать за месяц или за год
  rates: Record<string, number>;      // Курсы валют

  addSubscription: (sub: Subscription) => void;
  deleteSubscription: (id: string) => void;
  toggleSubscription: (id: string) => void;

  setBaseCurrency: (currency: 'RUB' | 'USD' | 'EUR') => void;
  toggleViewMode: () => void;
  loadRates: () => Promise<void>;
}

export const useSubStore = create(
  persist<SubscriptionStore>(
    (set) => ({
      subscriptions: initialData,
      baseCurrency: 'RUB',
      viewMode: 'monthly',
      rates: { usd: 1, rub: 1, eur: 1 }, 

      addSubscription: (sub) =>
        set((state) => ({ subscriptions: [...state.subscriptions, sub] })),

      deleteSubscription: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.filter((s) => s.id !== id),
        })),

      toggleSubscription: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((s) =>
            s.id === id ? { ...s, isActive: !s.isActive } : s
          ),
        })),

      setBaseCurrency: (currency) => set({ baseCurrency: currency }),
      
      toggleViewMode: () => set((state) => ({
        viewMode: state.viewMode === 'monthly' ? 'yearly' : 'monthly'
      })),

      loadRates: async () => {
        const ratesData = await fetchRates(); 
        // API возвращает структуру { usd: { usd: 1, rub: 92.5, eur: 0.92 } }
        // Нам нужна только часть с курсами
        const rates = ratesData.usd || { usd: 1, rub: 1, eur: 1 };
        set({ rates });
      },
    }),
    {
      name: 'sub-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
