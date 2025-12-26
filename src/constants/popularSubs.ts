import type { Category, Currency } from '../types';

export interface PopularSub {
  name: string;
  currency: Currency;
  category: Category;
}

export const POPULAR_SUBSCRIPTIONS: PopularSub[] = [
  { name: 'Youtube', currency: 'RUB', category: 'entertainment' },
  { name: 'Boosty', currency: 'RUB', category: 'entertainment' },
  { name: 'YouTube Premium', currency: 'RUB', category: 'entertainment' },
  { name: 'Spotify', currency: 'RUB', category: 'entertainment' },
  { name: 'ЛитРес', currency: 'RUB', category: 'entertainment' },
  { name: 'Ростелеком', currency: 'RUB', category: 'utilities' },
  { name: 'Яндекс Плюс', currency: 'RUB', category: 'utilities' },
  { name: 'KION', currency: 'RUB', category: 'entertainment' },
  { name: 'СберПрайм', currency: 'RUB', category: 'entertainment' },
  { name: 'Okko', currency: 'RUB', category: 'entertainment' },
  { name: 'IVI', currency: 'RUB', category: 'entertainment' },
  { name: 'VK Плюс', currency: 'RUB', category: 'entertainment' },
  { name: 'VK', currency: 'RUB', category: 'entertainment' },
  { name: 'Telegram Premium', currency: 'RUB', category: 'other' },
  { name: 'Telegram', currency: 'RUB', category: 'other' },
  { name: 'GitHub', currency: 'RUB', category: 'work' },
  { name: 'Trello', currency: 'RUB', category: 'work' },
  { name: 'ChatGPT Plus', currency: 'RUB', category: 'work' },
  { name: 'ChatGPT', currency: 'RUB', category: 'work' },
  { name: 'Figma', currency: 'RUB', category: 'work' },
  { name: 'Slack', currency: 'RUB', category: 'work' },
  { name: 'Adobe Creative Cloud', currency: 'RUB', category: 'work' },
  { name: 'Adobe', currency: 'RUB', category: 'work' },
  { name: 'Microsoft 365', currency: 'RUB', category: 'work' },
];