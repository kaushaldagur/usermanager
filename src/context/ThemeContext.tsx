import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const THEME_KEY = "usermanager_theme";

// Mirrors the canvas colors in styles.css, used for the mobile browser
// chrome (address bar / status bar) via <meta name="theme-color">.
const THEME_COLOR: Record<Theme, string> = {
  light: "#eef1f7",
  dark: "#121317",
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getPreferredTheme(): Theme {
  // An inline script in index.html already applies this same logic
  // synchronously before first paint (to avoid a flash of the wrong
  // theme). This re-reads the same source so React's state agrees with
  // what's already on screen.
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getPreferredTheme);

  useEffect(() => {
    // Persist the explicit choice — once a person picks a theme, it sticks
    // regardless of what the OS preference does afterwards.
    localStorage.setItem(THEME_KEY, theme);

    const root = document.documentElement;
    root.style.colorScheme = theme;
    root.classList.toggle("dark-mode", theme === "dark");

    // Keep the mobile address-bar color matching the active theme.
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", THEME_COLOR[theme]);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
