import { useEffect, useCallback } from 'react';
import { useSubStore } from '../store/useSubStore';
import { getDaysUntil } from '../lib/dateUtils';
import toast from 'react-hot-toast';

export const useNotifications = () => {
  const subscriptions = useSubStore((state) => state.subscriptions);
  const notificationsEnabled = useSubStore((state) => state.notificationsEnabled);
  const setNotificationsEnabled = useSubStore((state) => state.setNotificationsEnabled);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('Ваш браузер не поддерживает уведомления');
      return false;
    }

    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        toast.success('Уведомления включены');
        return true;
      }
    }

    toast.error('Доступ к уведомлениям запрещен');
    setNotificationsEnabled(false);
    return false;
  }, [setNotificationsEnabled]);

  const checkAndNotify = useCallback(() => {
    if (!notificationsEnabled || Notification.permission !== 'granted') return;

    subscriptions.forEach((sub) => {
      if (!sub.isActive) return;

      const daysLeft = getDaysUntil(sub.nextPaymentDate);

      // Уведомляем за 1 день до платежа или в день платежа
      if (daysLeft === 1 || daysLeft === 0) {
        const title = daysLeft === 0 ? 'Оплата сегодня!' : 'Оплата завтра';
        const body = `Подписка ${sub.name}: к оплате ${sub.price} ${sub.currency}`;

        new Notification(title, {
          body,
          icon: '/SubManager/images/icon.svg',
        });
      }
    });
  }, [notificationsEnabled, subscriptions]);

  useEffect(() => {
    // Проверяем уведомления при загрузке и при изменении списка подписок
    if (notificationsEnabled) {
      checkAndNotify();
    }
  }, [notificationsEnabled, checkAndNotify]);

  return { notificationsEnabled, requestPermission, setNotificationsEnabled };
};
