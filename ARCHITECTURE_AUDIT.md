# 🔍 Архитектурный Аудит SubManager

## 📊 Найденные проблемы

### 1. **ДУБЛИРОВАНИЕ ФУНКЦИЙ** ⚠️

#### `getCurrencySymbol()` определена в 3 местах:

- `src/App.tsx` (строка 56)
- `src/components/dashboard/Analytics.tsx` (строка 25)
- `src/components/dashboard/SubscriptionItem.tsx` (строка 45)

**Проблема:** Одна и та же логика копируется в разные файлы.

**Решение:** Перенести в `src/lib/utils.ts` и импортировать везде.

```typescript
// src/lib/utils.ts - ДОЛЖНО БЫТЬ ЗДЕСЬ
export const getCurrencySymbol = (currency: string): string => {
  const map: Record<string, string> = { RUB: "₽", USD: "$", EUR: "€" };
  return map[currency] || currency;
};
```

---

### 2. **ЛОГИКА В КОМПОНЕНТАХ ВМЕСТО HOOKS** ❌

#### App.tsx (строки 25-48):

```typescript
const [isLoadingRates, setIsLoadingRates] = useState(true);
const [ratesError, setRatesError] = useState<string | null>(null);

useEffect(() => {
  const loadCurrencyRates = async () => {
    try {
      setIsLoadingRates(true);
      setRatesError(null);
      await loadRates();
    } catch (error) {
      // ...
    } finally {
      setIsLoadingRates(false);
    }
  };
  loadCurrencyRates();
}, [loadRates]);
```

**Проблема:** Логика загрузки курсов находится прямо в App.tsx вместо отдельного хука.

**Решение:** Создать custom hook:

```typescript
// src/hooks/useCurrencyRates.ts
export const useCurrencyRates = () => {
  const loadRates = useSubStore((state) => state.loadRates);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCurrencyRates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await loadRates();
      } catch (error) {
        const errorMsg =
          error instanceof Error
            ? error.message
            : "Не удалось загрузить курсы валют";
        setError(errorMsg);
        toast.error("Используются резервные курсы валют");
      } finally {
        setIsLoading(false);
      }
    };
    loadCurrencyRates();
  }, [loadRates]);

  return { isLoading, error };
};
```

Использование в App.tsx:

```typescript
const { isLoading, error } = useCurrencyRates();
```

---

### 3. **ВЫЧИСЛЕНИЯ В КОМПОНЕНТАХ** 🧮

#### App.tsx (строки 50-54):

```typescript
const totalCost = subscriptions.reduce((acc, curr) => {
  if (!curr.isActive) return acc;
  return acc + calculateCost(curr, baseCurrency, rates, viewMode);
}, 0);
```

**Проблема:** Расчет общей суммы находится в App.tsx, но это бизнес-логика.

**Решение:** Перенести в `src/lib/` или в hook:

```typescript
// src/lib/calculateTotalCost.ts
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
```

---

### 4. **СЛОЖНЫЙ ГЛАВНЫЙ КОМПОНЕНТ** 🏗️

#### App.tsx сейчас делает слишком много:

- ✅ Управляет состоянием загрузки курсов
- ✅ Рассчитывает общую сумму
- ✅ Отображает шапку с селектами
- ✅ Отображает аналитику
- ✅ Отображает форму добавления
- ✅ Отображает список подписок

**Решение:** Разделить на подкомпоненты:

```
App.tsx
├── Header.tsx (шапка с валютой, режимом, суммой)
├── Dashboard.tsx (основной контент)
│   ├── Analytics.tsx (уже есть)
│   ├── AddSubscriptionForm.tsx (уже есть)
│   └── SubscriptionList.tsx (новый компонент)
└── Toaster (нотификации)
```

---

### 5. **СЛИШКОМ МНОГО СЕЛЕКТОРОВ ZUSTAND** 📍

#### App.tsx (строки 14-23):

```typescript
const subscriptions = useSubStore((state) => state.subscriptions);
const deleteSubscription = useSubStore((state) => state.deleteSubscription);
const loadRates = useSubStore((state) => state.loadRates);
const baseCurrency = useSubStore((state) => state.baseCurrency);
const viewMode = useSubStore((state) => state.viewMode);
const toggleViewMode = useSubStore((state) => state.toggleViewMode);
const setBaseCurrency = useSubStore((state) => state.setBaseCurrency);
const rates = useSubStore((state) => state.rates);
```

**Проблема:** 8 селекторов - слишком много. Каждый вызов создает новый объект.

**Решение:** Создать selector-функции в store:

```typescript
// src/store/useSubStore.ts
export const useSubStoreSelectors = {
  useSubscriptions: () => useSubStore((state) => state.subscriptions),
  useDeleteSubscription: () => useSubStore((state) => state.deleteSubscription),
  useLoadRates: () => useSubStore((state) => state.loadRates),
  useBaseCurrency: () => useSubStore((state) => state.baseCurrency),
  useViewMode: () => useSubStore((state) => state.viewMode),
  useToggleViewMode: () => useSubStore((state) => state.toggleViewMode),
  useSetBaseCurrency: () => useSubStore((state) => state.setBaseCurrency),
  useRates: () => useSubStore((state) => state.rates),
};

// Использование:
const subscriptions = useSubStoreSelectors.useSubscriptions();
```

Или еще лучше - использовать shallow сравнение:

```typescript
import { shallow } from "zustand/react/shallow";

const {
  subscriptions,
  deleteSubscription,
  // ...
} = useSubStore(
  (state) => ({
    subscriptions: state.subscriptions,
    deleteSubscription: state.deleteSubscription,
    // ...
  }),
  shallow
);
```

---

## 📈 Рекомендуемая архитектура

```
src/
├── App.tsx                          # ТОЛЬКО шапка и разметка
├── main.tsx
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx              # NEW: Шапка с валютой
│   │   ├── Dashboard.tsx           # NEW: Основной контент
│   │   └── Footer.tsx              # NEW: если нужен
│   │
│   ├── dashboard/
│   │   ├── AddSubscriptionForm.tsx
│   │   ├── Analytics.tsx
│   │   ├── SubscriptionItem.tsx
│   │   └── SubscriptionList.tsx    # NEW: List из App.tsx
│   │
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       └── ThemeToggle.tsx
│
├── hooks/
│   ├── useCurrencyRates.ts         # NEW: Загрузка курсов
│   ├── useSubscriptions.ts         # NEW: Работа с подписками
│   └── useCalculations.ts          # NEW: Вычисления
│
├── store/
│   └── useSubStore.ts
│
├── lib/
│   ├── calculateCost.ts
│   ├── calculateTotalCost.ts       # NEW: Общая сумма
│   ├── currencyApi.ts
│   ├── dateUtils.ts
│   └── utils.ts                    # ← ADD getCurrencySymbol() здесь!
│
├── constants/
│   ├── popularSubs.ts
│   └── serviceLogos.ts
│
└── types/
    └── index.ts
```

---

## 🎯 Приоритет рефакторинга

### 🔴 КРИТИЧНОЕ (делать первым):

1. **Перенести `getCurrencySymbol()` в `utils.ts`**

   - Удалить дублирование
   - Время: ~5 минут

2. **Извлечь `useCurrencyRates()` hook**
   - Упростить App.tsx
   - Время: ~10 минут

### 🟡 ВАЖНОЕ:

3. **Создать `SubscriptionList.tsx` компонент**

   - Список из App.tsx отдельно
   - Время: ~15 минут

4. **Создать `calculateTotalCost()` функцию**

   - Бизнес-логика из App.tsx
   - Время: ~5 минут

5. **Создать `Header.tsx` компонент**
   - Шапка из App.tsx отдельно
   - Время: ~20 минут

### 🟢 УЛУЧШЕНИЯ:

6. **Использовать `shallow` в Zustand селекторах**

   - Оптимизация ре-рендеров
   - Время: ~10 минут

7. **Создать `Dashboard.tsx` контейнер**
   - Wrapper для основного контента
   - Время: ~10 минут

---

## 💰 Результаты рефакторинга

### ДО:

- App.tsx: 212 строк (слишком толстый)
- `getCurrencySymbol()`: скопирована в 3 места
- Логика загрузки в компоненте
- Сложно тестировать

### ПОСЛЕ:

- App.tsx: ~50 строк (только шапка и разметка)
- `getCurrencySymbol()`: одно место (utils.ts)
- Логика в hooks (легче тестировать)
- Компоненты маленькие и переиспользуемые

---

## 📋 Чек-лист действий

- [ ] 1. Перенести `getCurrencySymbol()` в `src/lib/utils.ts`
- [ ] 2. Обновить импорты в `App.tsx`, `Analytics.tsx`, `SubscriptionItem.tsx`
- [ ] 3. Создать `src/hooks/useCurrencyRates.ts`
- [ ] 4. Обновить `App.tsx` - использовать новый hook
- [ ] 5. Создать `src/lib/calculateTotalCost.ts`
- [ ] 6. Обновить `App.tsx` - использовать новую функцию
- [ ] 7. Создать `src/components/dashboard/SubscriptionList.tsx`
- [ ] 8. Обновить `App.tsx` - использовать SubscriptionList
- [ ] 9. Создать `src/components/layout/Header.tsx`
- [ ] 10. Обновить `App.tsx` - использовать Header
- [ ] 11. Протестировать все работает
- [ ] 12. Git commit и push

---

**После рефакторинга App.tsx будет выглядеть примерно так:**

```tsx
function App() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Header />
        <Analytics />
        <AddSubscriptionForm />
        <SubscriptionList />
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;
```

Чисто, понятно, и легко расширять! 🚀
