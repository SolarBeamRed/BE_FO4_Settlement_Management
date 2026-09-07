import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => (localStorage.getItem("fallout-theme") as "light" | "dark") ?? "dark");
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem("fallout-theme", theme); }, [theme]);
  return <div className="app-shell"><header className="topbar"><NavLink className="brand" to="/"><span className="brand-mark">F</span>SETTLEMENT MANAGER</NavLink><button className="icon-button mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">MENU</button><nav className={`nav ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(false)}><NavLink to="/">Dashboard</NavLink><NavLink to="/settlements">Catalogue</NavLink>{user ? <NavLink to="/profile">Profile</NavLink> : null}</nav><div className="header-actions"><button className="theme-button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? "LIGHT" : "DARK"}</button>{user ? <button className="theme-button" onClick={logout}>LOG OUT</button> : <NavLink className="button" to="/login">LOG IN</NavLink>}</div></header><Outlet /><footer className="footer"><span>FALLOUT SETTLEMENT MANAGER</span><span>STATIC CATALOGUE // PERSONAL MANAGEMENT COMING LATER</span></footer></div>;
}
