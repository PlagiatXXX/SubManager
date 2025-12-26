import { useThemeStore } from "../../store/useThemeStore";
import { Sun, Moon } from "lucide-react";
import { useEffect } from "react";

export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useThemeStore();

  // Этот эффект добавляет/удаляет класс 'dark' у тега <html>
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-yellow-300 transition-colors hover:bg-slate-200 dark:hover:bg-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      aria-label={
        isDark
          ? "Переключиться на светлую тему"
          : "Переключиться на тёмную тему"
      }
      title={isDark ? "Светлая тема" : "Тёмная тема"}
    >
      {isDark ? (
        <Moon size={20} aria-hidden="true" />
      ) : (
        <Sun size={20} aria-hidden="true" />
      )}
    </button>
  );
};
