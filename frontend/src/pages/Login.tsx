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
  const [verificationStage, setVerificationStage] = useState<
    "idle" | "verifying" | "success"
    >("idle");

  if (user && !submitting && verificationStage === "idle") {
    return <Navigate to="/" replace />;
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!username.trim() || !password) return setError("Username and password are required.");

    setSubmitting(true);
    try {
      await login(username.trim(), password);
      setVerificationStage("verifying");
      
      await new Promise((resolve) => window.setTimeout(resolve, 500));
      setVerificationStage("success");
      
      await new Promise((resolve) => window.setTimeout(resolve, 350));
      navigate((location.state as { from?: string } | null)?.from ?? "/");

    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page form-page">
      <div className="terminal-reveal terminal-reveal-delay-1">
        <span className="eyebrow">Identity checkpoint</span>
        <h1>Log in</h1>
        <p className="lead">
          Enter your terminal credentials to access your survivor profile.
        </p>
      </div>
      <form
        className="panel form-card terminal-reveal terminal-reveal-delay-2"
        onSubmit={submit}
      >
        {error && <div className="notice error">{error}</div>}
        <label className="field">Username<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" /></label>
        <label className="field">Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></label>
        <button className="button" disabled={submitting || loading}>
          {submitting ? (
            <span className="button-loading">
              VERIFYING
              <span className="button-loading-indicator" aria-hidden="true" />
            </span>
          ) : (
            "LOG IN"
          )}
        </button>
        <p className="form-footer">New to the Commonwealth? <Link to="/register">Create an account</Link></p>
      </form>
      {verificationStage !== "idle" && (
        <div className="verification-overlay">
          <div className="verification-terminal">
            <span className="eyebrow">VAULT-TEC IDENTITY SYS</span>

            <div
              className={`verification-indicator ${
                verificationStage === "success" ? "success" : ""
              }`}
            >
              {verificationStage === "success" ? "✓" : ""}
            </div>

            <p className="verification-status">
              {verificationStage === "verifying"
                ? "VERIFYING CREDENTIALS..."
                : "VERIFICATION SUCCESSFUL"}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
