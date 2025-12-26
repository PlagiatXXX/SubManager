// src/components/dashboard/AddSubscriptionForm.tsx
import { useState } from "react";
import { useSubStore } from "../../store/useSubStore";
import type { Currency, Cycle, Category, Subscription } from "../../types";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Plus, Check, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { POPULAR_SUBSCRIPTIONS } from "../../constants/popularSubs";
import { calculateNextPayment } from "../../lib/dateUtils";

interface FormErrors {
  name?: string;
  price?: string;
  startDate?: string;
}

export const AddSubscriptionForm = () => {
  const addSubscription = useSubStore((state) => state.addSubscription);
  const subscriptions = useSubStore((state) => state.subscriptions);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    currency: "RUB" as Currency,
    cycle: "monthly" as Cycle,
    category: "other" as Category,
    startDate: new Date().toISOString().split("T")[0],
  });

  // Состояние для ошибок
  const [errors, setErrors] = useState<FormErrors>({});

  // Состояние для модального окна дубликата
  const [duplicateModal, setDuplicateModal] = useState(false);
  const [pendingSubscription, setPendingSubscription] =
    useState<Subscription | null>(null);

  // Состояние для фокуса и фильтрации
  const [isNameFocused, setIsNameFocused] = useState(false);

  // Фильтрация списка на основе ввода (только начало названия)
  const filteredSuggestions = POPULAR_SUBSCRIPTIONS.filter(
    (sub) =>
      sub.name.toLowerCase().startsWith(formData.name.toLowerCase()) &&
      formData.name.length > 0 // Показываем только если что-то ввели
  );

  // Обработчик выбора подсказки
  const handleSelectSuggestion = (
    suggestion: (typeof POPULAR_SUBSCRIPTIONS)[0]
  ) => {
    setFormData({
      ...formData,
      name: suggestion.name,
      currency: suggestion.currency,
      category: suggestion.category,
    });
    setIsNameFocused(false); // Закрываем список
    setErrors({}); // Очищаем ошибки при выборе
  };

  // Функция валидации
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Валидация названия
    if (!formData.name.trim()) {
      newErrors.name = "Введите название сервиса";
    } else if (formData.name.length < 2) {
      newErrors.name = "Название должно быть минимум 2 символа";
    }

    // Валидация цены
    if (!formData.price) {
      newErrors.price = "Введите цену";
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price < 0) {
        newErrors.price = "Цена должна быть положительным числом";
      } else if (price === 0) {
        newErrors.price = "Цена не может быть нулевой";
      }
    }

    // Валидация даты
    if (!formData.startDate) {
      newErrors.startDate = "Выберите дату начала";
    } else {
      const date = new Date(formData.startDate);
      if (date > new Date()) {
        newErrors.startDate = "Дата не может быть в будущем";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Валидируем форму
    if (!validateForm()) {
      toast.error("Пожалуйста, исправьте ошибки в форме");
      return;
    }

    try {
      const nextPaymentDate = calculateNextPayment(
        formData.startDate,
        formData.cycle
      );

      const newSub = {
        id: crypto.randomUUID(),
        ...formData,
        price: parseFloat(formData.price),
        nextPaymentDate: nextPaymentDate,
        isActive: true,
      };

      // Проверяем наличие дубликата (по названию, игнорируя заглавность)
      const isDuplicate = subscriptions.some(
        (sub) => sub.name.toLowerCase() === formData.name.toLowerCase()
      );

      if (isDuplicate) {
        // Показываем модальное окно
        setPendingSubscription(newSub);
        setDuplicateModal(true);
        return;
      }

      // Добавляем подписку если дубликата нет
      addSubscription(newSub);
      toast.success(`${formData.name} добавлена в список подписок!`);
      resetForm();
    } catch (error) {
      toast.error("Ошибка при добавлении подписки");
      console.error(error);
    }
  };

  // Функция добавления при подтверждении дубликата
  const handleAddDuplicate = () => {
    if (pendingSubscription) {
      addSubscription(pendingSubscription);
      toast.success(`${pendingSubscription.name} добавлена в список подписок!`);
      resetForm();
      setDuplicateModal(false);
      setPendingSubscription(null);
    }
  };

  // Функция отмены и очистки формы
  const handleCancelDuplicate = () => {
    setDuplicateModal(false);
    setPendingSubscription(null);
    setFormData({
      name: "",
      price: "",
      category: "other",
      currency: "RUB",
      cycle: "monthly",
      startDate: new Date().toISOString().split("T")[0],
    });
    setErrors({});
  };

  // Функция для очистки формы
  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      category: "other",
      currency: "RUB",
      cycle: "monthly",
      startDate: new Date().toISOString().split("T")[0],
    });
    setErrors({});
  };

  const handleBlurName = () => {
    // Небольшая задержка, чтобы успел сработать клик по подсказке
    setTimeout(() => setIsNameFocused(false), 200);
  };

  const inputClass =
    "w-full h-10 px-3 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 cursor-pointer";

  return (
    <Card className="mb-8 border-blue-200 bg-blue-50/30 dark:bg-slate-800 dark:border-slate-700">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
        <Plus size={20} className="text-blue-600 dark:text-blue-400" />
        Добавить новую подписку
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          {/* Название */}
          <div className="lg:col-span-2 relative z-20">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Название сервиса
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Например, Netflix"
                aria-label="Название сервиса"
                className={`${inputClass} font-medium ${
                  errors.name ? "border-red-500 dark:border-red-400" : ""
                }`}
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                onFocus={() => setIsNameFocused(true)}
                onBlur={handleBlurName}
                autoComplete="off"
              />
              {errors.name && (
                <div className="flex items-center gap-1 mt-1 text-red-600 dark:text-red-400 text-xs">
                  <AlertCircle size={14} />
                  <span>{errors.name}</span>
                </div>
              )}
              {/* Выпадающий список (Атозаполнение) */}
              {isNameFocused && filteredSuggestions.length > 0 && (
                <ul
                  className="absolute w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md shadow-lg max-h-60 overflow-y-auto z-50"
                  role="listbox"
                >
                  {filteredSuggestions.map((suggestion) => (
                    <li
                      key={suggestion.name}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="px-3 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700 flex justify-between items-center group"
                      role="option"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {suggestion.name}
                        </span>
                      </div>
                      <Check
                        size={14}
                        className="text-blue-600 opacity-0 group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Цена */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Цена
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="15.00"
              aria-label="Цена подписки"
              className={`${inputClass} ${
                errors.price ? "border-red-500 dark:border-red-400" : ""
              }`}
              value={formData.price}
              onChange={(e) => {
                setFormData({ ...formData, price: e.target.value });
                if (errors.price) setErrors({ ...errors, price: undefined });
              }}
            />
            {errors.price && (
              <div className="flex items-center gap-1 mt-1 text-red-600 dark:text-red-400 text-xs">
                <AlertCircle size={14} />
                <span>{errors.price}</span>
              </div>
            )}
          </div>

          {/* Валюта */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Валюта
            </label>
            <select
              aria-label="Выберите валюту"
              className={inputClass}
              value={formData.currency}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  currency: e.target.value as Currency,
                })
              }
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="RUB">RUB (₽)</option>
            </select>
          </div>

          {/* Цикл */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Цикл
            </label>
            <select
              aria-label="Выберите цикл платежа"
              className={inputClass}
              value={formData.cycle}
              onChange={(e) =>
                setFormData({ ...formData, cycle: e.target.value as Cycle })
              }
            >
              <option value="monthly">Месяц</option>
              <option value="yearly">Год</option>
            </select>
          </div>

          {/* Дата начала */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Начало
            </label>
            <input
              type="date"
              aria-label="Дата начала подписки"
              className={`${inputClass} ${
                errors.startDate ? "border-red-500 dark:border-red-400" : ""
              }`}
              value={formData.startDate}
              onChange={(e) => {
                setFormData({ ...formData, startDate: e.target.value });
                if (errors.startDate)
                  setErrors({ ...errors, startDate: undefined });
              }}
            />
            {errors.startDate && (
              <div className="flex items-center gap-1 mt-1 text-red-600 dark:text-red-400 text-xs">
                <AlertCircle size={14} />
                <span>{errors.startDate}</span>
              </div>
            )}
          </div>

          {/* КАТЕГОРИЯ */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Категория
            </label>
            <select
              aria-label="Выберите категорию"
              className={inputClass}
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as Category,
                })
              }
            >
              <option value="entertainment">Развлечение</option>
              <option value="work">Работа</option>
              <option value="utilities">Утилиты</option>
              <option value="other">Другое</option>
            </select>
          </div>

          {/* Кнопка */}
          <div className="lg:col-span-1">
            <Button
              type="submit"
              className="w-full h-10 dark:bg-blue-600 dark:hover:bg-blue-700 cursor-pointer"
              aria-label="Добавить новую подписку"
              title="Добавить новую подписку"
            >
              Добавить
            </Button>
          </div>
        </div>

        {/* Подсказка помощи - видна на всех устройствах */}
        <div className="text-xs text-slate-500 dark:text-slate-400 text-center py-2">
          Заполните все поля и нажмите «Добавить», чтобы создать новую подписку
        </div>
      </form>

      {/* Модальное окно для подтверждения дубликата */}
      {duplicateModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          role="dialog"
          aria-labelledby="duplicate-title"
          aria-modal="true"
        >
          <Card className="w-96 max-w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle size={24} className="text-orange-500" />
              <h2
                id="duplicate-title"
                className="text-lg font-bold text-slate-800 dark:text-white"
              >
                Подписка уже добавлена
              </h2>
            </div>

            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Подписка на <strong>{pendingSubscription?.name}</strong> уже
              существует в вашем списке. Вы уверены, что хотите добавить её ещё
              раз?
            </p>

            <div className="flex gap-3">
              <Button
                onClick={handleAddDuplicate}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                aria-label="Добавить подписку несмотря на дубликат"
              >
                Все равно добавить
              </Button>
              <Button
                onClick={handleCancelDuplicate}
                className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white"
                aria-label="Отменить добавление и очистить форму"
              >
                Убрать
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
};
