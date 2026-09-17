import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";

import { ApiError, api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Settlement, UserSettlementDetail, UserSettlementUpdate } from "../types/api";

const fields = ["people", "food", "water", "power", "defense", "beds", "happiness"] as const;
const stations: [keyof Settlement["crafting_stations"], string][] = [["weapons_workbench", "Weapons Workbench"], ["armor_workbench", "Armor Workbench"], ["chemistry_station", "Chemistry Station"], ["cooking_station", "Cooking Station"], ["power_armor_station", "Power Armor Station"]];

export default function MySettlementDetails() {
  const { settlementId = "" } = useParams();
  const id = Number(settlementId);
  const { token, loading: authLoading, logout } = useAuth();
  const location = useLocation(); const navigate = useNavigate();
  const [detail, setDetail] = useState<UserSettlementDetail | null>(null);
  const [form, setForm] = useState<UserSettlementUpdate>({});
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [locking, setLocking] = useState(false);
  const [error, setError] = useState(""); const [message, setMessage] = useState(""); const [notFound, setNotFound] = useState(false); const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const activeToken = token;
    async function load() {
      if (!activeToken || !Number.isInteger(id) || id < 1) { setLoading(false); return; }
      setLoading(true); setError(""); setNotFound(false);
      try { const value = await api.getMySettlement(id, activeToken); setDetail(value); setForm({ people: value.people, food: value.food, water: value.water, power: value.power, defense: value.defense, beds: value.beds, happiness: value.happiness, notes: value.notes ?? "" }); }
      catch (err) { if (err instanceof ApiError && err.status === 401) logout(); else if (err instanceof ApiError && err.status === 404) setNotFound(true); else setError(err instanceof Error ? err.message : "Unable to load this settlement."); }
      finally { setLoading(false); }
    }
    void load();
  }, [id, token, logout]);

  function changeNumber(key: typeof fields[number], raw: string) {
    const maximum = key === "happiness" ? 100 : Number.MAX_SAFE_INTEGER;
    const value = Math.min(maximum, Math.max(0, Number(raw) || 0));
    setForm((current) => ({ ...current, [key]: value }));
  }
  async function save(event: FormEvent) {
    event.preventDefault(); if (!token || !detail) return;
    setSaving(true); setError(""); setMessage("");
    try { const updated = await api.updateMySettlement(id, form, token); setDetail((current) => current ? { ...current, ...updated } : current); setForm({ ...form, ...updated, notes: updated.notes ?? "" }); setMessage("Settlement tracking data saved."); }
    catch (err) { if (err instanceof ApiError && err.status === 401) logout(); else setError(err instanceof Error ? err.message : "Unable to save settlement data."); }
    finally { setSaving(false); }
  }
  async function lockSettlement() {
    if (!token) return; setLocking(true); setError("");
    try { await api.deleteMySettlement(id, token); navigate("/my-settlements", { replace: true, state: { message: "Settlement locked. Its tracked data was removed." } }); }
    catch (err) { if (err instanceof ApiError && err.status === 401) logout(); else setError(err instanceof Error ? err.message : "Unable to lock this settlement."); setLocking(false); setConfirming(false); }
  }
  if (!authLoading && !token) return <Navigate to="/login" state={{ from: location }} replace />;
  if (authLoading || loading) return <main className="page"><div className="loading">RETRIEVING SETTLEMENT TRACKING DATA…</div></main>;
  if (!Number.isInteger(id) || id < 1 || notFound) return <main className="page"><h1>Personal record unavailable</h1><p className="lead">This settlement is locked or no longer available in your personal records.</p><Link className="button" to="/my-settlements">RETURN TO MY SETTLEMENTS</Link></main>;
  if (error && !detail) return <main className="page"><div className="notice error">{error}</div></main>;
  if (!detail) return null;
  const settlement = detail.settlement;
  return <main className="page">
    <div className="detail-header"><div><span className="eyebrow">Personal settlement tracking</span><h1>{settlement.name}</h1><p className="lead">{settlement.region ?? "Unknown region"} // {settlement.addon}</p></div><Link className="button secondary" to="/my-settlements">← MY SETTLEMENTS</Link></div>
    {error && <div className="notice error">{error}</div>}{message && <div className="notice">{message}</div>}
    <div className="detail-grid personal-detail-grid"><form className="panel" onSubmit={save}><span className="eyebrow">Your live records</span><h2>Tracking data</h2><div className="tracking-form">{fields.map((key) => <label className="field" key={key}>{key}<input type="number" min="0" max={key === "happiness" ? 100 : undefined} value={form[key] ?? 0} onChange={(event) => changeNumber(key, event.target.value)} /></label>)}</div><label className="field">Personal notes<textarea value={form.notes ?? ""} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} /></label><button className="button" disabled={saving}>{saving ? "SAVING…" : "SAVE CHANGES"}</button><div className="danger-zone"><span className="eyebrow">Danger zone</span><h3>Lock settlement</h3><p className="muted">Remove this personal record while keeping the catalogue entry available.</p><button type="button" className="button danger" onClick={() => setConfirming(true)}>LOCK SETTLEMENT</button></div></form>
      <aside className="panel"><span className="eyebrow">Catalogue reference</span>{settlement.map_image_url && <img className="map-image" src={settlement.map_image_url} alt={`Map of ${settlement.name}`} />}<h2>Field description</h2><p className="description">{settlement.description}</p><h3>How to obtain</h3><p className="description">{settlement.how_to_obtain}</p>{settlement.notes && <><h3>Catalogue notes</h3><p className="description">{settlement.notes}</p></>}<h3>Crafting stations</h3><div className="station-list">{stations.map(([key, label]) => <div className={`station-status ${settlement.crafting_stations[key] ? "available" : ""}`} key={key}><span>{label}</span><em>{settlement.crafting_stations[key] ? "AVAILABLE" : "UNAVAILABLE"}</em></div>)}</div>{settlement.wiki_url && <p className="external-link"><a href={settlement.wiki_url} target="_blank" rel="noreferrer">OPEN EXTERNAL REFERENCE ↗</a></p>}</aside></div>
    {confirming && <div className="modal-backdrop" role="presentation"><section className="modal panel" role="dialog" aria-modal="true" aria-labelledby="lock-title"><h2 id="lock-title">Lock this settlement?</h2><p>Your tracked data for this settlement will be permanently removed. The static catalogue entry will remain and can be unlocked again later, but your population, resources, defense, beds, happiness, and notes will be lost.</p><div className="modal-actions"><button className="button secondary" disabled={locking} onClick={() => setConfirming(false)}>CANCEL</button><button className="button danger" disabled={locking} onClick={lockSettlement}>{locking ? "LOCKING…" : "LOCK SETTLEMENT"}</button></div></section></div>}
  </main>;
}
