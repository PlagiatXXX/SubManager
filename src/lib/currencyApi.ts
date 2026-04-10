export interface CurrencyRates {
  usd: number;
  rub: number;
  eur: number;
  [key: string]: number;
}

export interface ApiResponse {
  usd: CurrencyRates;
  [date: string]: CurrencyRates | string; // API sometimes includes date
}

const API_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json';

export const fetchRates = async (): Promise<ApiResponse> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Ошибка сети');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Не удалось загрузить курсы валют', error);
    return {
      usd: { usd: 1, rub: 92.5, eur: 0.92 },
    } as ApiResponse;
  }
};
