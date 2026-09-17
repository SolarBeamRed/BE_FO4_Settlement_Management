import { useEffect, useState, type SubmitEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { ApiError, api } from "../services/api";
import type { UserUpdate } from "../types/api";

export default function Profile() {
  const { token, user, loading, setUser, logout } = useAuth();
  const [form, setForm] = useState<UserUpdate>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

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

  async function deleteAccount() {
    if (!token) return;
    setDeleting(true); setError("");
    try {
      await api.deleteMe(token);
      logout();
      navigate("/", { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) logout();
      setError(err instanceof Error ? err.message : "Unable to delete account.");
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  if (!loading && !token) return <Navigate to="/login" replace />;
  if (loading || !user) return <main className="page"><div className="loading">LOADING SURVIVOR PROFILE…</div></main>;

  const initial = (user.display_name ?? user.username).slice(0, 1).toUpperCase();
  return (
    <main className="page">
      <div className="terminal-reveal terminal-reveal-delay-1">
        <span className="eyebrow">Survivor terminal</span>
        <h1>Profile</h1>
      </div>
      <div className="profile-grid terminal-reveal terminal-reveal-delay-2">
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
          <section className="danger-zone">
            <span className="eyebrow">Danger zone</span><h2>Delete account</h2>
            <p className="muted">Permanently erase this survivor account and every personal settlement record.</p>
            <button type="button" className="button danger" onClick={() => setConfirmingDelete(true)}>DELETE ACCOUNT</button>
          </section>
        </form>
      </div>
      {confirmingDelete && <div className="modal-backdrop" role="presentation"><section className="modal panel" role="dialog" aria-modal="true" aria-labelledby="delete-title"><h2 id="delete-title">Delete your account?</h2><p>This permanently deletes your account and all of your personal settlement tracking data. Your account cannot be recovered.</p><div className="modal-actions"><button className="button secondary" disabled={deleting} onClick={() => setConfirmingDelete(false)}>CANCEL</button><button className="button danger" disabled={deleting} onClick={deleteAccount}>{deleting ? "DELETING…" : "DELETE ACCOUNT"}</button></div></section></div>}
    </main>
  );
}
