import { useSubStore } from "../../store/useSubStore";
import { Card } from "../ui/Card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { Category } from "../../types";
import { CATEGORY_LABELS } from "../../lib/utils";
import { calculateCost } from "../../lib/calculateCost";
import { getCurrencySymbol } from "../../lib/utils";

interface TooltipPayload {
  name: string;
  value: number;
}

interface TooltipContentProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

// Цвета для категорий
const COLORS: Record<Category, string> = {
  entertainment: "#3b82f6",
  work: "#10b981",
  utilities: "#f59e0b",
  other: "#64748b",
};

// Кастомный компонент для Tooltip с поддержкой валют - не используется, но полезен как reference
// interface CustomTooltipProps extends TooltipProps<number, string> {
//   currency?: string;
// }
// const CustomTooltip = ({ active, payload, currency = "RUB" }: CustomTooltipProps) => { ... }

export const Analytics = () => {
  const subscriptions = useSubStore((state) => state.subscriptions);
  const baseCurrency = useSubStore((state) => state.baseCurrency);
  const viewMode = useSubStore((state) => state.viewMode);
  const rates = useSubStore((state) => state.rates);

  // Расчёт расходов по категориям с учётом всех параметров
  const data = subscriptions.reduce((acc, curr) => {
    // Пропускаем неактивные подписки
    if (!curr.isActive) return acc;

    const category = curr.category;
    if (!acc[category]) {
      acc[category] = { name: category, value: 0 };
    }

    // Используем правильный расчёт с конвертацией и учётом периода
    const cost = calculateCost(curr, baseCurrency, rates, viewMode);
    acc[category].value += cost;

    return acc;
  }, {} as Record<string, { name: Category; value: number }>);

  const chartData = Object.values(data);

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
      role="region"
      aria-label="Аналитика подписок"
    >
      <Card>
        <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">
          Расходы по категориям
        </h3>
        {subscriptions.filter((s) => s.isActive).length === 0 ? (
          <div className="h-64 w-full flex items-center justify-center">
            <p className="text-center text-gray-500 dark:text-slate-400">
              Нет активных подписок для отображения
            </p>
          </div>
        ) : (
          <div
            className="h-64 w-full"
            role="img"
            aria-label="Диаграмма расходов по категориям"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  aria-label="Доля расходов по категориям"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.name] || "#ccc"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={((props: TooltipContentProps) => {
                    const { active, payload } = props;
                    if (!active || !payload || !payload.length) return null;

                    return (
                      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                          {CATEGORY_LABELS[payload[0].name as Category] ||
                            payload[0].name}
                        </p>
                        <p className="text-lg font-bold text-slate-800 dark:text-white">
                          {getCurrencySymbol(baseCurrency)}
                          {(payload[0].value as number).toFixed(2)}
                        </p>
                      </div>
                    );
                  }) as any}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <div className="grid grid-rows-2 gap-6">
        <Card
          className="flex flex-col justify-center items-center text-center p-4 bg-linear-to-br from-blue-50 to-white dark:from-slate-800 dark:to-slate-900"
          role="status"
        >
          <p className="text-sm text-slate-600 dark:text-slate-400 uppercase font-semibold tracking-wide">
            Активных подписок
          </p>
          <p
            className="text-4xl font-extrabold text-blue-600 mt-2 dark:text-blue-400"
            aria-live="polite"
          >
            {subscriptions.filter((s) => s.isActive).length}
          </p>
        </Card>

        <Card
          className="flex flex-col justify-center items-center text-center p-4 bg-linear-to-br from-emerald-50 to-white dark:from-slate-800 dark:to-slate-900"
          role="status"
        >
          <p className="text-sm text-slate-600 dark:text-slate-400 uppercase font-semibold tracking-wide">
            Самая дорогая
          </p>
          <p
            className="text-xl font-bold text-slate-800 mt-2 dark:text-white"
            aria-live="polite"
          >
            {subscriptions.filter((s) => s.isActive).length > 0
              ? subscriptions
                  .filter((s) => s.isActive)
                  .reduce((prev, current) => {
                    const prevCost = calculateCost(
                      prev,
                      baseCurrency,
                      rates,
                      viewMode
                    );
                    const currCost = calculateCost(
                      current,
                      baseCurrency,
                      rates,
                      viewMode
                    );
                    return prevCost > currCost ? prev : current;
                  }).name
              : "—"}
          </p>
        </Card>
      </div>
    </div>
  );
};
