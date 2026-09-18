import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../services/api";
import type { Settlement } from "../types/api";

const stationLabels = ["weapons_workbench", "armor_workbench", "chemistry_station", "cooking_station", "power_armor_station"] as const;

export default function Settlements() {
  const [items, setItems] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const [addon, setAddon] = useState("");
  const [station, setStation] = useState("");

  useEffect(() => {
    api.getSettlements().then(setItems).catch((err: Error) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const regions = [...new Set(items.map((item) => item.region).filter((value): value is string => Boolean(value)))].sort();
  const addons = [...new Set(items.map((item) => item.addon))].sort();
  const filtered = useMemo(() => items.filter((item) => {
    const queryMatches = !search || `${item.name} ${item.region ?? ""} ${item.addon}`.toLowerCase().includes(search.toLowerCase());
    const stationMatches = !station || item.crafting_stations[station as keyof typeof item.crafting_stations] === true;
    return queryMatches && (!region || item.region === region) && (!addon || item.addon === addon) && stationMatches;
  }), [items, search, region, addon, station]);

  return (
    <main className="page">
      <div className="terminal-reveal terminal-reveal-delay-1">
        <span className="eyebrow">Settlement index</span>
        <h1>Catalogue</h1>
        <p className="lead">
          Filter known settlements by location, content pack, or the essential stations already on site.
        </p>
      </div>
      <div className="toolbar terminal-reveal terminal-reveal-delay-2">
        <input placeholder="Search name, region, or add-on" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select value={region} onChange={(event) => setRegion(event.target.value)}><option value="">All regions</option>{regions.map((value) => <option key={value}>{value}</option>)}</select>
        <select value={addon} onChange={(event) => setAddon(event.target.value)}><option value="">All add-ons</option>{addons.map((value) => <option key={value}>{value}</option>)}</select>
        <select value={station} onChange={(event) => setStation(event.target.value)}><option value="">Any station setup</option>{stationLabels.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select>
      </div>
      {
        loading ? (
          <div className="data-loading">
            <span className="data-loading-text">
              SCANNING SETTLEMENT DATABASE...
              <span className="data-loading-cursor" />
            </span>
          </div>
        ) : error ? (
          <div className="notice error">
            Unable to load the catalogue: {error}
          </div>
        ) : (
          <section
            key={`${search}-${region}-${addon}-${station}`}
            className="catalogue terminal-reveal terminal-reveal-delay-3 filter-transition"
          >
            {filtered.length === 0 ? (
              <div className="empty">
                No settlement records match these filters.
              </div>
            ) : (
              filtered.map((item) => (
                <Link
                  className="settlement-row filter-result"
                  key={item.settlement_id}
                  style={
                    {
                      "--filter-delay": `${filtered.indexOf(item) * 50}ms`,
                    } as CSSProperties
                  }
                  to={`/settlements/${encodeURIComponent(item.name)}`}
                >
                  <span className="settlement-name">
                    {item.name}
                  </span>

                  <span>
                    {item.region ?? "Unknown region"}
                  </span>

                  <span className="chip">
                    {item.addon}
                  </span>

                  <span
                    className="stations-inline"
                    title="Available crafting stations"
                  >
                    {stationLabels.map((key) => (
                      <i
                        key={key}
                        className={`station-dot ${
                          item.crafting_stations[key] ? "available" : ""
                        }`}
                      />
                    ))}
                  </span>
                </Link>
              ))
            )}
          </section>
        )
      }
    </main>
  );
}
