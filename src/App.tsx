import { useEffect, useRef } from "react";
import { useSubStore } from "./store/useSubStore";
import { Toaster } from "react-hot-toast";
import { AddSubscriptionForm } from "./components/dashboard/AddSubscriptionForm";
import { Analytics } from "./components/dashboard/Analytics";
import { SubscriptionList } from "./components/dashboard/SubscriptionList";
import { Header } from "./components/layout/Header";
import { calculateTotalCost } from "./lib/calculateTotalCost";
import { useCurrencyRates } from "./hooks/useCurrencyRates";
import { useNotifications } from "./hooks/useNotifications";

function App() {
  const subscriptions = useSubStore((state) => state.subscriptions);
  const deleteSubscription = useSubStore((state) => state.deleteSubscription);
  const baseCurrency = useSubStore((state) => state.baseCurrency);
  const viewMode = useSubStore((state) => state.viewMode);
  const toggleViewMode = useSubStore((state) => state.toggleViewMode);
  const setBaseCurrency = useSubStore((state) => state.setBaseCurrency);
  const rates = useSubStore((state) => state.rates);

  const formRef = useRef<HTMLDivElement>(null);

  const { isLoading: isLoadingRates, error: ratesError } = useCurrencyRates();
  // Initialize notifications
  useNotifications();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N or Meta+N to focus form
      if (e.key === "n" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        formRef.current?.scrollIntoView({ behavior: "smooth" });
        const input = formRef.current?.querySelector("input");
        if (input instanceof HTMLInputElement) input.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const totalCost = calculateTotalCost(
    subscriptions,
    baseCurrency,
    rates,
    viewMode
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-300 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Header
          isLoadingRates={isLoadingRates}
          ratesError={ratesError}
          baseCurrency={baseCurrency}
          onCurrencyChange={setBaseCurrency}
          totalCost={totalCost}
          viewMode={viewMode}
          onToggleViewMode={toggleViewMode}
        />

        <Analytics />

        <div ref={formRef}>
          <AddSubscriptionForm />
        </div>

        <SubscriptionList
          subscriptions={subscriptions}
          baseCurrency={baseCurrency}
          viewMode={viewMode}
          rates={rates}
          onDelete={deleteSubscription}
        />
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
