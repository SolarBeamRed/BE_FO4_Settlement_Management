import { useEffect, useState, type SubmitEvent } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import type { UserUpdate } from "../types/api";

export default function Profile() {
  const { token, user, loading, setUser, logout } = useAuth();
  const [form, setForm] = useState<UserUpdate>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    setForm({ username: user.username, display_name: user.display_name ?? "", bio: user.bio ?? "", favorite_settlement: user.favorite_settlement ?? "", favorite_faction: user.favorite_faction ?? "" });
  }, [user]);

  function change(key: keyof UserUpdate, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !user) return;

    setError(""); setMessage(""); setSaving(true);
    const update: UserUpdate = { ...form };
    if (user && update.username === user.username) delete update.username;
    Object.entries(update).forEach(([key, value]) => { if (value === "") update[key as keyof UserUpdate] = null; });

    try {
      const updated = await api.updateMe(update, token);
      setUser(updated);
      setMessage("Profile saved to the terminal.");
    } catch (err) {
      if (err instanceof Error && /401|credentials|token/i.test(err.message)) logout();
      setError(err instanceof Error ? err.message : "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  }

  if (!loading && !token) return <Navigate to="/login" replace />;
  if (loading || !user) return <main className="page"><div className="loading">LOADING SURVIVOR PROFILE…</div></main>;

  const initial = (user.display_name ?? user.username).slice(0, 1).toUpperCase();
  return (
    <main className="page">
      <span className="eyebrow">Survivor terminal</span><h1>Profile</h1>
      <div className="profile-grid">
        <aside className="panel profile-summary">
          {user.profile_picture_url ? <img className="avatar" src={user.profile_picture_url} alt="Profile" /> : <div className="avatar">{initial}</div>}
          <h2>{user.display_name ?? user.username}</h2>
          <div className="meta-list"><div><strong>Username</strong>{user.username}</div><div><strong>Registered</strong>{new Date(user.created_at).toLocaleDateString()}</div></div>
        </aside>
        <form className="panel" onSubmit={submit}>
          {error && <div className="notice error">{error}</div>}
          {message && <div className="notice">{message}</div>}
          <label className="field">Username<input value={form.username ?? ""} onChange={(event) => change("username", event.target.value)} /></label>
          <label className="field">Display name<input value={form.display_name ?? ""} onChange={(event) => change("display_name", event.target.value)} /></label>
          <label className="field">Bio<textarea value={form.bio ?? ""} onChange={(event) => change("bio", event.target.value)} /></label>
          <label className="field">Favorite settlement<input value={form.favorite_settlement ?? ""} onChange={(event) => change("favorite_settlement", event.target.value)} /></label>
          <label className="field">Favorite faction<input value={form.favorite_faction ?? ""} onChange={(event) => change("favorite_faction", event.target.value)} /></label>
          <button className="button" disabled={saving}>{saving ? "SAVING…" : "SAVE PROFILE"}</button>
        </form>
      </div>
    </main>
  );
}
