import { useEffect, useState } from "react";
import { useSubStore } from "../store/useSubStore";
import toast from "react-hot-toast";

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