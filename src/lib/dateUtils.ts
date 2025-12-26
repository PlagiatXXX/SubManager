import type { Cycle } from '../types';

export const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0, // Округляем до целого для красоты
  }).format(amount);
};

// Расчет даты следующего платежа
export const calculateNextPayment = (startDate: string, cycle: Cycle): string => {
  const date = new Date(startDate);
  
  if (cycle === 'monthly') {
    date.setMonth(date.getMonth() + 1);
  } else if (cycle === 'yearly') {
    date.setFullYear(date.getFullYear() + 1);
  }

  return date.toISOString().split('T')[0];
};

// Форматирование даты в ДД-ММ-ГГГГ
export const formatDateToRussian = (isoString: string): string => {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы в JS с 0
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
};

// Логика подсчета дней (оставляем, но она не так важна теперь для вывода)
export const getDaysUntil = (dateString: string): number => {
  const targetDate = new Date(dateString);
  const today = new Date();
  targetDate.setHours(0,0,0,0);
  today.setHours(0,0,0,0);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};