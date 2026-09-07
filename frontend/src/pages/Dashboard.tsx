import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import type { Settlement } from "../types/api";

export default function Dashboard() {
  const { user } = useAuth();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getSettlements().then(setSettlements).catch(() => setError(true));
  }, []);

  const regionCount = new Set(
    settlements.map((settlement) => settlement.region).filter(Boolean),
  ).size;

  return (
    <main className="page">
      <section className="hero">
        <span className="eyebrow">Commonwealth settlement terminal</span>
        <h1>Build your settlement intelligence.</h1>
        <p className="lead">
          A field guide for discovering the Commonwealth’s available settlements,
          their origins, and the stations already waiting at each site.
        </p>
        <div className="hero-actions">
          <Link className="button" to="/settlements">OPEN CATALOGUE</Link>
          {user ? (
            <Link className="button secondary" to="/profile">VIEW PROFILE</Link>
          ) : (
            <Link className="button secondary" to="/register">ENLIST NOW</Link>
          )}
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat"><strong>{error ? "—" : settlements.length}</strong><span>catalogued settlements</span></div>
        <div className="stat"><strong>{error ? "—" : regionCount}</strong><span>regions represented</span></div>
        <div className="stat"><strong>{user ? "ON" : "OFF"}</strong><span>survivor terminal session</span></div>
      </section>

      <section className="feature-grid">
        <article className="panel">
          <span className="eyebrow">Field records</span>
          <h2>Static settlement catalogue</h2>
          <p className="muted">Browse verified location details, acquisition notes, DLC origins, maps, and available crafting stations.</p>
        </article>
        <article className="panel">
          <span className="eyebrow">{user ? `Welcome, ${user.display_name ?? user.username}` : "Survivor access"}</span>
          <h2>{user ? "Your profile is online." : "Sign in to keep your identity."}</h2>
          <p className="muted">{user ? "Update your Commonwealth identity and favorite places from your profile terminal." : "Create an account to maintain a personal profile as the system grows."}</p>
        </article>
      </section>
    </main>
  );
}
