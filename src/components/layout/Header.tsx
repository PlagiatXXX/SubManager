import { ThemeToggle } from "../ui/ThemeToggle";
import { AlertCircle, Loader2, Bell, BellOff, Download, Upload } from "lucide-react";
import { getCurrencySymbol } from "../../lib/utils";
import { useNotifications } from "../../hooks/useNotifications";
import { useSubStore } from "../../store/useSubStore";
import toast from "react-hot-toast";

interface HeaderProps {
  isLoadingRates: boolean;
  ratesError: string | null;
  baseCurrency: string;
  onCurrencyChange: (currency: "RUB" | "USD" | "EUR") => void;
  totalCost: number;
  viewMode: "monthly" | "yearly";
  onToggleViewMode: () => void;
}

export const Header = ({
  isLoadingRates,
  ratesError,
  baseCurrency,
  onCurrencyChange,
  totalCost,
  viewMode,
  onToggleViewMode,
}: HeaderProps) => {
  const { notificationsEnabled, requestPermission, setNotificationsEnabled } = useNotifications();
  const subscriptions = useSubStore((state) => state.subscriptions);
  const addSubscription = useSubStore((state) => state.addSubscription);

  const handleToggleNotifications = () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      toast.success("Уведомления выключены");
    } else {
      requestPermission();
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(subscriptions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = 'subscriptions.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success("Данные экспортированы");
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
          // Простая валидация: проверяем наличие id и name у первого элемента
          if (json.length > 0 && (!json[0].id || !json[0].name)) {
            throw new Error("Неверный формат файла");
          }

          // В идеале здесь нужно очистить текущие или объединить
          // Для простоты - добавляем те, которых нет (по id или имени)
          json.forEach(sub => {
            if (!subscriptions.find(s => s.id === sub.id)) {
              addSubscription(sub);
            }
          });
          toast.success("Данные импортированы");
        }
      } catch (err) {
        toast.error("Ошибка при импорте: " + (err as Error).message);
      }
    };
    reader.readAsText(file);
    // Сброс input
    event.target.value = '';
  };

  return (
    <header className="mb-8 flex flex-col gap-4" role="banner">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Менеджер подписок
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Управляйте своими подписками легко
          </p>
        </div>

        <div className="flex gap-2">
           <button
            onClick={handleExport}
            title="Экспорт в JSON"
            className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Download size={20} />
          </button>

          <label title="Импорт из JSON" className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
            <Upload size={20} />
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {/* Верхняя строка: тема + статус + уведомления + валюта */}
      <div className="flex items-center gap-2 sm:gap-4 justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Кнопка темы */}
          <ThemeToggle />

          {/* Кнопка уведомлений */}
          <button
            onClick={handleToggleNotifications}
            className={`p-2 rounded-lg transition-colors ${
              notificationsEnabled
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            }`}
            title={notificationsEnabled ? "Уведомления включены" : "Включить уведомления"}
          >
            {notificationsEnabled ? <Bell size={20} /> : <BellOff size={20} />}
          </button>

          {/* Статус загрузки курсов */}
          {isLoadingRates && (
            <div
              className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400"
              title="Загрузка курсов валют..."
            >
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
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
        </div>

        {/* Выбор валюты */}
        <select
          value={baseCurrency}
          onChange={(e) =>
            onCurrencyChange(e.target.value as "RUB" | "USD" | "EUR")
          }
          aria-label="Выберите базовую валюту"
          className="px-2 sm:px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500"
        >
          <option value="RUB">RUB (₽)</option>
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
        </select>
      </div>

      {/* Нижняя строка: бейдж + кнопка (стакаются на мобильных) */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
        {/* Бейдж с суммой */}
        <div className="bg-indigo-600 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 flex flex-col items-center flex-1 sm:flex-none sm:min-w-35">
          <p className="text-[10px] uppercase font-medium opacity-80">
            {viewMode === "monthly" ? "Траты в месяц" : "Траты в год"}
          </p>
          <p className="text-xl sm:text-2xl font-bold">
            {getCurrencySymbol(baseCurrency)}
            {totalCost.toFixed(0)}
          </p>
        </div>

        {/* Переключатель периода (Кнопка) */}
        <button
          onClick={onToggleViewMode}
          aria-label={`Переключиться на просмотр ${
            viewMode === "monthly" ? "за год" : "за месяц"
          }`}
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors focus:ring-2 focus:ring-indigo-500 whitespace-nowrap"
        >
          {viewMode === "monthly" ? "Показать за год ↗" : "Показать за месяц ↘"}
        </button>
      </div>
    </header>
  );
};
