import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AppLayout() {
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (
      (localStorage.getItem("fallout-theme") as "light" | "dark") ?? "dark"
    );
  });

  const location = useLocation();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("fallout-theme", theme);
  }, [theme]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink className="brand" to="/">
          <span className="brand-mark">F</span>
          SETTLEMENT MANAGER
        </NavLink>

        <button
          className="icon-button mobile-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          MENU
        </button>

        <nav
          className={`nav ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(false)}
        >
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/settlements">Catalogue</NavLink>

          {user ? (
            <>
              <NavLink to="/my-settlements">My Settlements</NavLink>
              <NavLink to="/profile">Profile</NavLink>
            </>
          ) : null}
        </nav>

        <div className="header-actions">
          <button
            className="theme-button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? "LIGHT" : "DARK"}
          </button>

          {user ? (
            <button className="theme-button" onClick={logout}>
              LOG OUT
            </button>
          ) : (
            <NavLink className="button" to="/login">
              LOG IN
            </NavLink>
          )}
        </div>
      </header>

      <main key={location.pathname} className="page-transition">
        <Outlet />
      </main>

      <footer className="footer">
        <span>FALLOUT SETTLEMENT MANAGER</span>
        <span>CATALOGUE INTEL // PERSONAL SETTLEMENT TRACKING</span>
      </footer>
    </div>
  );
}