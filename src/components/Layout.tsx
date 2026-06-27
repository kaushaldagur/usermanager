import { Outlet, Link } from "react-router-dom";
import { UsersRound, X, Moon, Sun } from "lucide-react";
import { useUsers } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";
import { handlePointerMove, handlePointerLeave } from "../utils/pointerGlow";

export default function Layout() {
  const { notice, clearNotice } = useUsers();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-shell">
      {/* Title bar styled like a macOS window: traffic lights anchor the
          glass material in something instantly recognizable as "Apple". */}
      <header className="topbar" onMouseMove={handlePointerMove} onMouseLeave={handlePointerLeave}>
        <span className="traffic-lights" aria-hidden="true">
          <span className="red" />
          <span className="yellow" />
          <span className="green" />
        </span>
        <Link to="/" className="brand" aria-label="Go to users">
          <span className="brand-mark">
            <UsersRound size={16} aria-hidden="true" />
          </span>
          <strong>user-directory.app</strong>
        </Link>

        {/* Theme toggle button */}
        <button
          className="top-action theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          type="button"
        >
          {theme === "light" ? (
            <Moon size={17} aria-hidden="true" />
          ) : (
            <Sun size={17} aria-hidden="true" />
          )}
        </button>
      </header>

      {/* Dynamic-Island-style status pill, dropping in from the notch. */}
      <div className="notice-stage">
        {notice && (
          <div
            className={`notice ${notice.tone} notice-pill`}
            role="status"
            onMouseMove={handlePointerMove}
            onMouseLeave={handlePointerLeave}
          >
            <span className="notice-dot" aria-hidden="true" />
            <span>{notice.message}</span>
            <button type="button" onClick={clearNotice} aria-label="Dismiss">
              <X size={13} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <main className="page-wrap">
        <Outlet />
      </main>
    </div>
  );
}
