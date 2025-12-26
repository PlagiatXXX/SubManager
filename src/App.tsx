import { useEffect, useState } from "react";
import { useSubStore } from "./store/useSubStore";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { Card } from "./components/ui/Card";
import { AddSubscriptionForm } from "./components/dashboard/AddSubscriptionForm";
import { SubscriptionItem } from "./components/dashboard/SubscriptionItem";
import { Analytics } from "./components/dashboard/Analytics";
import { ThemeToggle } from "./components/ui/ThemeToggle";
import { calculateCost } from "./lib/calculateCost";
import { AlertCircle, Loader2 } from "lucide-react";

function App() {
  const subscriptions = useSubStore((state) => state.subscriptions);
  const deleteSubscription = useSubStore((state) => state.deleteSubscription);
  const loadRates = useSubStore((state) => state.loadRates);
  const baseCurrency = useSubStore((state) => state.baseCurrency);
  const viewMode = useSubStore((state) => state.viewMode);
  const toggleViewMode = useSubStore((state) => state.toggleViewMode);
  const setBaseCurrency = useSubStore((state) => state.setBaseCurrency);
  const rates = useSubStore((state) => state.rates);

  const [isLoadingRates, setIsLoadingRates] = useState(true);
  const [ratesError, setRatesError] = useState<string | null>(null);

  // Загружаем курсы при запуске
  useEffect(() => {
    const loadCurrencyRates = async () => {
      try {
        setIsLoadingRates(true);
        setRatesError(null);
        await loadRates();
      } catch (error) {
        const errorMsg =
          error instanceof Error
            ? error.message
            : "Не удалось загрузить курсы валют";
        setRatesError(errorMsg);
        toast.error("Используются резервные курсы валют");
        console.error("Ошибка при загрузке курсов:", error);
      } finally {
        setIsLoadingRates(false);
      }
    };

    loadCurrencyRates();
  }, [loadRates]);

  // Рассчитаем общую сумму
  const totalCost = subscriptions.reduce((acc, curr) => {
    if (!curr.isActive) return acc;
    return acc + calculateCost(curr, baseCurrency, rates, viewMode);
  }, 0);

  // Символ валюты
  const getCurrencySymbol = (c: string) => {
    const map: Record<string, string> = { RUB: "₽", USD: "$", EUR: "€" };
    return map[c] || c;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-300 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Шапка */}
        <header
          className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
          role="banner"
        >
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              Менеджер подписок
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Управляйте своими подписками легко
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Кнопка темы */}
            <ThemeToggle />

            {/* Статус загрузки курсов */}
            {isLoadingRates && (
              <div
                className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400"
                title="Загрузка курсов валют..."
              >
                <Loader2
                  size={16}
                  className="animate-spin"
                  aria-hidden="true"
                />
                <span className="hidden sm:inline">Загрузка</span>
              </div>
            )}
            {ratesError && (
              <div
                className="flex items-center gap-1 text-sm text-yellow-600 dark:text-yellow-500"
                title={ratesError}
              >
                <AlertCircle size={16} aria-hidden="true" />
                <span className="hidden sm:inline">Резервные курсы</span>
              </div>
            )}

            {/* Выбор валюты */}
            <select
              value={baseCurrency}
              onChange={(e) =>
                setBaseCurrency(e.target.value as "RUB" | "USD" | "EUR")
              }
              aria-label="Выберите базовую валюту"
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="RUB">RUB (₽)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>

            {/* Бейдж с суммой */}
            <div className="bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 flex flex-col items-center min-w-35">
              <p className="text-[10px] uppercase font-medium opacity-80">
                {viewMode === "monthly" ? "Траты в месяц" : "Траты в год"}
              </p>
              <p className="text-2xl font-bold">
                {getCurrencySymbol(baseCurrency)}
                {totalCost.toFixed(0)}
              </p>
            </div>

            {/* Переключатель периода (Кнопка) */}
            <button
              onClick={toggleViewMode}
              aria-label={`Переключиться на просмотр ${
                viewMode === "monthly" ? "за год" : "за месяц"
              }`}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors focus:ring-2 focus:ring-indigo-500"
            >
              {viewMode === "monthly"
                ? "Показать за год ↗"
                : "Показать за месяц ↘"}
            </button>
          </div>
        </header>

        {/* Блок аналитики */}
        <Analytics />

        {/* Форма добавления */}
        <AddSubscriptionForm />

        {/* Список подписок */}
        <Card className="min-h-75">
          <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white flex items-center justify-between">
            <span>
              Активные подписки (
              {subscriptions.filter((s) => s.isActive).length})
            </span>
            <span className="text-xs font-normal text-slate-500 font-mono">
              Режим: {viewMode === "monthly" ? "Месяц" : "Год"}
            </span>
          </h2>

          {subscriptions.filter((s) => s.isActive).length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-12 text-center"
              role="status"
              aria-live="polite"
            >
              <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-full mb-4">
                <span className="text-2xl">📂</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Список пуст
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-sm">
                Добавьте первую подписку с помощью формы выше
              </p>
            </div>
          ) : (
            <div className="flex flex-col" role="list">
              {subscriptions
                .filter((s) => s.isActive)
                .map((sub) => (
                  <div key={sub.id} role="listitem">
                    <SubscriptionItem
                      subscription={sub}
                      onDelete={deleteSubscription}
                      // Прокидываем настройки в компонент
                      baseCurrency={baseCurrency}
                      viewMode={viewMode}
                      rates={rates}
                    />
                  </div>
                ))}
            </div>
          )}
        </Card>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          className: "dark:bg-slate-800 dark:text-white",
        }}
      />
    </div>
  );
}

export default App;
