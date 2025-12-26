import { Card } from "../ui/Card";
import { SubscriptionItem } from "./SubscriptionItem";
import type { Subscription } from "../../types";

interface SubscriptionListProps {
  subscriptions: Subscription[];
  baseCurrency: string;
  viewMode: "monthly" | "yearly";
  rates: Record<string, number>;
  onDelete: (id: string) => void;
}

export const SubscriptionList = ({
  subscriptions,
  baseCurrency,
  viewMode,
  rates,
  onDelete,
}: SubscriptionListProps) => {
  const activeSubscriptions = subscriptions.filter((s) => s.isActive);

  return (
    <Card className="min-h-75">
      <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white flex items-center justify-between">
        <span>Активные подписки ({activeSubscriptions.length})</span>
        <span className="text-xs font-normal text-slate-500 font-mono">
          Режим: {viewMode === "monthly" ? "Месяц" : "Год"}
        </span>
      </h2>

      {activeSubscriptions.length === 0 ? (
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
          {activeSubscriptions.map((sub) => (
            <div key={sub.id} role="listitem">
              <SubscriptionItem
                subscription={sub}
                onDelete={onDelete}
                baseCurrency={baseCurrency}
                viewMode={viewMode}
                rates={rates}
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
