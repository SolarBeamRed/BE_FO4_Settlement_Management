import { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";

import { ApiError, api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { UserSettlementListItem, UserSettlementResponse } from "../types/api";

const tracked = ["people", "food", "water", "power", "defense", "beds", "happiness"] as const;

export default function MySettlements() {
  const { token, loading: authLoading, logout } = useAuth();
  const location = useLocation();
  const returnedMessage = (location.state as { message?: string } | null)?.message;
  const [items, setItems] = useState<UserSettlementListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unlocking, setUnlocking] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    const activeToken = token;
    async function load() {
      setLoading(true); setError("");
      try { setItems(await api.getMySettlements(activeToken)); }
      catch (err) { if (err instanceof ApiError && err.status === 401) logout(); else setError(err instanceof Error ? err.message : "Unable to load your settlements."); }
      finally { setLoading(false); }
    }
    void load();
  }, [token, logout]);

  async function unlock(item: UserSettlementListItem) {
    if (!token) return;
    setUnlocking(item.settlement_id); setError("");
    try {
      const updated: UserSettlementResponse = await api.unlockSettlement(item.settlement_id, token);
      setItems((current) => current.map((record) => record.settlement_id === item.settlement_id ? { ...record, unlocked: true, ...updated } : record));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) logout();
      else setError(err instanceof Error ? err.message : "Unable to unlock this settlement.");
    } finally { setUnlocking(null); }
  }

  if (!authLoading && !token) return <Navigate to="/login" state={{ from: location }} replace />;
  if (authLoading || !token || loading) return <main className="page"><div className="loading">RETRIEVING PERSONAL SETTLEMENT RECORDS…</div></main>;

  return <main className="page">
    <div className="detail-header"><div><span className="eyebrow">Survivor terminal</span><h1>My Settlements</h1><p className="lead">Unlock catalogue sites and track the resources that keep each community running.</p></div><Link className="button secondary" to="/settlements">VIEW CATALOGUE</Link></div>
    {returnedMessage && <div className="notice">{returnedMessage}</div>}
    {error && <div className="notice error">{error}</div>}
    <section className="my-settlements-list">
      {items.length === 0 ? <div className="empty">No settlement records are available for this account.</div> : items.map((item) => <article className={`my-settlement ${item.unlocked ? "" : "locked"}`} key={item.settlement_id}>
        <div className="my-settlement-heading"><div><h2>{item.name}</h2><span className={`status ${item.unlocked ? "active" : ""}`}>{item.unlocked ? "UNLOCKED" : "LOCKED"}</span></div>
          {item.unlocked ? <Link className="button secondary" to={`/my-settlements/${item.settlement_id}`}>MANAGE</Link> : <button className="button" disabled={unlocking === item.settlement_id} onClick={() => unlock(item)}>{unlocking === item.settlement_id ? "UNLOCKING…" : "UNLOCK"}</button>}
        </div>
        {item.unlocked && <div className="tracked-stats">{tracked.map((key) => <div key={key}><strong>{item[key]}</strong><span>{key}</span></div>)}</div>}
      </article>)}
    </section>
  </main>;
}
