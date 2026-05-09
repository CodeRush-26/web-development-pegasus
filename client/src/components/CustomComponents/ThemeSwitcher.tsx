import { useContext } from "react";
import { ThemeContext } from "@/lib/theme-provider";
import { Sun, Moon } from "lucide-react";

export function ThemeSwitcher() {
  const context = useContext(ThemeContext);

  if (!context) return null;

  const { theme, toggleTheme } = context;

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--secondary)] transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-slate-700" />
      )}
    </button>
  );
}
