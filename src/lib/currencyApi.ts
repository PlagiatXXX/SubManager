type Rates = {
  [key: string]: {
    [key: string]: number;
  };
};

const API_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json';

export const fetchRates = async (): Promise<Rates> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Ошибка сети');
    const data = await response.json();
    return data; // Возвращаем весь объект с курсами
  } catch (error) {
    console.error('Не удалось загрузить курсы валют', error);
    // Возвращаем резерные курсы, чтобы приложение не падало, если API недоступен
    return {
      usd: { usd: 1, rub: 92.5, eur: 0.92 },
    };
  }
};