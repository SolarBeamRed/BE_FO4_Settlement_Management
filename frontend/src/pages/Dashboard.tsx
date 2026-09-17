import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import type { Settlement, UserSettlementListItem } from "../types/api";

export default function Dashboard() {
  const { user, token } = useAuth();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [error, setError] = useState(false);
  const [personal, setPersonal] = useState<UserSettlementListItem[] | null>(null);
  const [terminalBooting, setTerminalBooting] = useState(true);

  useEffect(() => {
    api.getSettlements().then(setSettlements).catch(() => setError(true));
  }, []);
  useEffect(() => { if (token) api.getMySettlements(token).then(setPersonal).catch(() => setPersonal(null)); }, [token]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setTerminalBooting(false);
    }, 1400);

    return () => window.clearTimeout(timer);
  }, []);

  const regionCount = new Set(
    settlements.map((settlement) => settlement.region).filter(Boolean),
  ).size;

  if (terminalBooting) {
    return (
      <main className="page terminal-boot-screen">
        <div className="terminal-sequence">
          <span className="terminal-line">
            &gt; INITIALIZING SURVIVOR TERMINAL...
          </span>

          <span className="terminal-line">
            &gt; DATABASE CONNECTION........OK
          </span>

          <span className="terminal-line">
            &gt; SETTLEMENT NETWORK........OK
          </span>

          <span className="terminal-line">
            &gt; USER PROFILE...............OK
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="hero terminal-reveal terminal-reveal-delay-1">
        <span className="eyebrow">Commonwealth settlement terminal</span>

        <h1>Build your settlement intelligence.</h1>

        <p className="lead">
          A field guide for discovering the Commonwealth’s available settlements,
          their origins, and the stations already waiting at each site.
        </p>

        <div className="hero-actions">
          <Link className="button" to="/settlements">
            OPEN CATALOGUE
          </Link>

          {user ? (
            <Link className="button secondary" to="/my-settlements">
              MY SETTLEMENTS
            </Link>
          ) : (
            <Link className="button secondary" to="/register">
              ENLIST NOW
            </Link>
          )}
        </div>
      </section>

      {user && personal && (
        <section className="personal-summary panel terminal-reveal terminal-reveal-delay-2">
          <span className="eyebrow">Personal management</span>

          <h2>Settlement status</h2>

          <p className="muted">
            <strong>
              {personal.filter((item) => item.unlocked).length}
            </strong>{" "}
            unlocked //{" "}
            <strong>
              {personal.filter((item) => !item.unlocked).length}
            </strong>{" "}
            locked
          </p>

          <Link className="button secondary" to="/my-settlements">
            MANAGE MY SETTLEMENTS
          </Link>
        </section>
      )}

      <section className="stats-grid terminal-reveal terminal-reveal-delay-3">
        <div className="stat">
          <strong>{error ? "—" : settlements.length}</strong>
          <span>catalogued settlements</span>
        </div>

        <div className="stat">
          <strong>{error ? "—" : regionCount}</strong>
          <span>regions represented</span>
        </div>

        <div className="stat">
          <strong>{user ? "ON" : "OFF"}</strong>
          <span>survivor terminal session</span>
        </div>
      </section>

      <section className="feature-grid terminal-reveal terminal-reveal-delay-4">
        <article className="panel">
          <span className="eyebrow">Field records</span>

          <h2>Static settlement catalogue</h2>

          <p className="muted">
            Browse verified location details, acquisition notes, DLC origins,
            maps, and available crafting stations.
          </p>
        </article>

        <article className="panel">
          <span className="eyebrow">
            {user
              ? `Welcome, ${user.display_name ?? user.username}`
              : "Survivor access"}
          </span>

          <h2>
            {user
              ? "Your profile is online."
              : "Sign in to track your settlements."}
          </h2>

          <p className="muted">
            {user
              ? "Manage your Commonwealth identity and personal settlement tracking from your survivor terminal."
              : "Create an account to unlock settlements and maintain your own resource records."}
          </p>
        </article>
      </section>
    </main>
  );

}
