import { useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { api } from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!username.trim() || !password) return setError("Username and password are required.");

    setSubmitting(true);
    try {
      await api.register(username.trim(), password);
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page form-page">
      <div className="terminal-reveal terminal-reveal-delay-1">
        <span className="eyebrow">New survivor record</span>
        <h1>Register</h1>
        <p className="lead">Create a profile for the settlement network.</p>
      </div>
      <form className="panel form-card terminal-reveal terminal-reveal-delay-2" onSubmit={submit}>
        {error && <div className="notice error">{error}</div>}
        <label className="field">Username<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" /></label>
        <label className="field">Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" /></label>
        <button className="button" disabled={submitting}>
          {submitting ? (
            <span className="button-loading">
              CREATING
              <span className="button-loading-indicator" aria-hidden="true" />
            </span>
          ) : (
            "CREATE ACCOUNT"
          )}
        </button>
        <p className="form-footer">Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </main>
  );
}
