import { useState, type SubmitEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!username.trim() || !password) return setError("Username and password are required.");

    setSubmitting(true);
    try {
      await login(username.trim(), password);
      navigate((location.state as { from?: string } | null)?.from ?? "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page form-page">
      <span className="eyebrow">Identity checkpoint</span><h1>Log in</h1>
      <p className="lead">Enter your terminal credentials to access your survivor profile.</p>
      <form className="panel form-card" onSubmit={submit}>
        {error && <div className="notice error">{error}</div>}
        <label className="field">Username<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" /></label>
        <label className="field">Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></label>
        <button className="button" disabled={submitting || loading}>{submitting ? "VERIFYING…" : "LOG IN"}</button>
        <p className="form-footer">New to the Commonwealth? <Link to="/register">Create an account</Link></p>
      </form>
    </main>
  );
}
