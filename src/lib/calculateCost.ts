import type { Subscription } from '../types';

export const calculateCost = (
  sub: Subscription, 
  baseCurrency: string, 
  rates: Record<string, number>, 
  viewMode: 'monthly' | 'yearly'
): number => {
  // 1. Конвертация в базовую валюту (например, из USD в RUB)
  // API дает курсы относительно USD.
  // Сначала приводим к USD, потом к целевой валюте.
  
  const usdRate = rates[sub.currency.toLowerCase()] || 1;
  const priceInUSD = sub.price / usdRate; // Сколько это в долларах
  
  const targetRate = rates[baseCurrency.toLowerCase()] || 1;
  let priceInBase = priceInUSD * targetRate; // Сколько это в валюте пользователя

  // 2. Пересчет периода
  // Если пользователь хочет видеть итог за ГОД, а подписка месячная -> *12
  if (viewMode === 'yearly' && sub.cycle === 'monthly') {
    priceInBase *= 12;
  }
  
  // Если пользователь хочет видеть итог за МЕСЯЦ, а подписка годовая -> /12
  if (viewMode === 'monthly' && sub.cycle === 'yearly') {
    priceInBase /= 12;
  }

  return priceInBase;
};