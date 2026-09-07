import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../services/api";
import type { UserProfile } from "../types/api";

interface AuthState { token: string | null; user: UserProfile | null; loading: boolean; login: (username: string, password: string) => Promise<void>; logout: () => void; refreshUser: () => Promise<void>; setUser: (user: UserProfile) => void; }
const AuthContext = createContext<AuthState | undefined>(undefined);
const TOKEN_KEY = "fallout-settlement-token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(Boolean(token));
  const logout = useCallback(() => { localStorage.removeItem(TOKEN_KEY); setToken(null); setUser(null); setLoading(false); }, []);
  const refreshUser = useCallback(async () => { if (!token) return; setUser(await api.getMe(token)); }, [token]);
  useEffect(() => { if (!token) return; setLoading(true); refreshUser().catch(logout).finally(() => setLoading(false)); }, [token, refreshUser, logout]);
  const login = useCallback(async (username: string, password: string) => { const data = await api.login(username, password); localStorage.setItem(TOKEN_KEY, data.access_token); setToken(data.access_token); }, []);
  const value = useMemo(() => ({ token, user, loading, login, logout, refreshUser, setUser }), [token, user, loading, login, logout, refreshUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error("useAuth must be used inside AuthProvider"); return context; }
