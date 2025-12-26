import type { Subscription } from "../../types";
import { Button } from "../ui/Button";
import { Trash2, CreditCard } from "lucide-react";
import { getDaysUntil, formatDateToRussian } from "../../lib/dateUtils";
import { getCategoryLabel } from "../../lib/utils";
import SERVICE_LOGOS from "../../constants/serviceLogos";
import { calculateCost } from "../../lib/calculateCost";
import { getCurrencySymbol } from "../../lib/utils";

interface SubscriptionItemProps {
  subscription: Subscription;
  onDelete: (id: string) => void;
  baseCurrency: string;
  viewMode: "monthly" | "yearly";
  rates: Record<string, number>;
}

export const SubscriptionItem = ({
  subscription,
  onDelete,
  baseCurrency,
  viewMode,
  rates,
}: SubscriptionItemProps) => {
  const daysLeft = getDaysUntil(subscription.nextPaymentDate);
  const nextPaymentText = formatDateToRussian(subscription.nextPaymentDate);
  // Логика выделения цветом
  const isUrgent = daysLeft >= 0 && daysLeft <= 3;
  const isOverdue = daysLeft < 0;

  // Пытаемся найти картинку по имени
  const logoPath = SERVICE_LOGOS[subscription.name.toLowerCase()];

  // Если картинка есть, будем рендерить её. Если нет - покажем дефолтную иконку.
  const hasCustomLogo = !!logoPath;

  // Расчет отображаемой цены
  const displayPrice = calculateCost(
    subscription,
    baseCurrency,
    rates,
    viewMode
  );


  return (
    <div
      className="group 
      flex flex-col gap-4
      p-4 
      rounded-lg
      border border-slate-200 dark:border-slate-700
      bg-white dark:bg-slate-800 
      hover:shadow-md dark:hover:bg-slate-700/50 
      transition-all"
      role="article"
      aria-label={`Подписка ${subscription.name}`}
    >
      {/* ВЕРХНЯЯ ЧАСТЬ: Логотип, Название, Кнопка удаления */}
      <div className="flex items-center justify-between gap-4">
        {/* ЛОГОТИП И НАЗВАНИЕ */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* ИКОНКА / КАРТИНКА */}
          <div className="relative shrink-0">
            {/* 1. Если есть своя SVG-картинка */}
            {hasCustomLogo ? (
              <div
                className={`
                w-12 h-12 flex items-center justify-center 
                rounded-lg p-2 border
                ${
                  isOverdue
                    ? "border-red-200 dark:border-red-800"
                    : "border-slate-200 dark:border-slate-700"
                }
                bg-white dark:bg-white shadow-sm dark:shadow-md
              `}
              >
                <img
                  src={logoPath}
                  alt={subscription.name}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              /* 2. Если картинки нет - показываем иконку */
              <div
                className={`
                p-3 rounded-lg flex items-center justify-center
                ${
                  isOverdue
                    ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                }
              `}
              >
                <CreditCard size={20} />
              </div>
            )}

            {/* Индикатор просрочки (красная точка), если просрочено */}
            {isOverdue && (
              <div
                className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"
                aria-label="Просрочка платежа"
                title="Платеж просрочен"
              ></div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 truncate">
              {subscription.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="capitalize">
                {getCategoryLabel(subscription.category)}
              </span>
              {" • "}
              <span>
                {subscription.cycle === "monthly" ? "Ежемесячно" : "Ежегодно"}
                {viewMode === "yearly" &&
                  subscription.cycle === "monthly" &&
                  " (x12)"}
                {viewMode === "monthly" &&
                  subscription.cycle === "yearly" &&
                  " (/12)"}
              </span>
            </div>
          </div>
        </div>

        {/* КНОПКА УДАЛЕНИЯ - справа посередине */}
        <Button
          variant="danger"
          onClick={() => onDelete(subscription.id)}
          className="shrink-0 p-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 border border-red-300 dark:border-red-700 focus:ring-2 focus:ring-red-500"
          aria-label={`Удалить подписку ${subscription.name}`}
          title={`Удалить ${subscription.name}`}
        >
          <Trash2 size={18} aria-hidden="true" />
        </Button>
      </div>

      {/* НИЖНЯЯ ЧАСТЬ: Цена и дата платежа - ровно под названием */}
      <div className="flex items-center justify-between gap-4 ml-16">
        {/* Цена слева */}
        <div className="flex-1">
          {/* Основная цена (пересчитанная) */}
          <p className="font-bold text-lg text-slate-900 dark:text-white leading-none">
            {getCurrencySymbol(baseCurrency)}
            {displayPrice.toFixed(0)}
          </p>
          {/* Оригинальная цена (мелко, для сравнения) */}
          {baseCurrency !== subscription.currency && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              ≈ {subscription.price} {subscription.currency}
            </p>
          )}
        </div>

        {/* Дата платежа справа */}
        <div
          className={`flex flex-col items-end gap-1 ${
            isOverdue
              ? "text-red-600 dark:text-red-300 font-semibold"
              : isUrgent
              ? "text-orange-600 dark:text-orange-300"
              : "text-slate-600 dark:text-slate-300"
          }`}
          aria-live="polite"
          aria-label={
            isOverdue
              ? "Платеж просрочен"
              : isUrgent
              ? "Платеж в ближайшее время"
              : "Статус платежа"
          }
        >
          <span className="text-[10px] uppercase tracking-wider font-semibold">
            Оплата:
          </span>
          <span className="text-sm font-medium">{nextPaymentText}</span>
        </div>
      </div>
    </div>
  );
};
