import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";

import { ApiError, api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type {
  UserSettlementListItem,
  UserSettlementResponse,
} from "../types/api";

const tracked = [
  "people",
  "food",
  "water",
  "power",
  "defense",
  "beds",
  "happiness",
] as const;

const regions = [
  "Central Commonwealth",
  "Eastern Commonwealth",
  "Northeastern Commonwealth",
  "Northern Commonwealth",
  "Northwestern Commonwealth",
  "Southeastern Commonwealth",
  "Southern Commonwealth",
  "Western Commonwealth",
] as const;

export default function MySettlements() {
  const { token, loading: authLoading, logout } = useAuth();
  const location = useLocation();
  const returnedMessage = (location.state as { message?: string } | null)
    ?.message;

  const [items, setItems] = useState<UserSettlementListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unlocking, setUnlocking] = useState<number | null>(null);
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [statusFilter, setStatusFilter] = useState("unlocked");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [regionMenuOpen, setRegionMenuOpen] = useState(false);

  const regionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) return;

    const activeToken = token;

    async function load() {
      setLoading(true);
      setError("");

      try {
        setItems(await api.getMySettlements(activeToken));
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          logout();
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your settlements."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [token, logout]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        regionMenuRef.current &&
        !regionMenuRef.current.contains(event.target as Node)
      ) {
        setRegionMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const visibleItems = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    const filtered = items.filter((item) => {
      if (
        searchTerm &&
        !(
          item.name.toLowerCase().includes(searchTerm) ||
          item.region?.toLowerCase().includes(searchTerm) ||
          item.addon.toLowerCase().includes(searchTerm)
        )
      ) {
        return false;
      }

      if (
        selectedRegions.length > 0 &&
        (!item.region || !selectedRegions.includes(item.region))
      ) {
        return false;
      }

      if (sortBy === "status") {
        return statusFilter === "unlocked"
          ? item.unlocked
          : !item.unlocked;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      let comparison = 0;

      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "region") {
        comparison = (a.region ?? "").localeCompare(b.region ?? "");
      } else if (sortBy === "addon") {
        comparison = a.addon.localeCompare(b.addon);
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [
    items,
    search,
    sortBy,
    sortDirection,
    statusFilter,
    selectedRegions,
  ]);

  function toggleRegion(region: string) {
    setSelectedRegions((current) =>
      current.includes(region)
        ? current.filter((selected) => selected !== region)
        : [...current, region]
    );
  }

  function getRegionLabel() {
    if (selectedRegions.length === 0) {
      return "ALL REGIONS";
    }

    if (selectedRegions.length === 1) {
      return selectedRegions[0];
    }

    return `${selectedRegions.length} REGIONS SELECTED`;
  }

  async function unlock(item: UserSettlementListItem) {
    if (!token) return;

    setUnlocking(item.settlement_id);
    setError("");

    try {
      const updated: UserSettlementResponse = await api.unlockSettlement(
        item.settlement_id,
        token
      );

      await new Promise((resolve) => window.setTimeout(resolve, 1500));

      setItems((current) =>
        current.map((record) =>
          record.settlement_id === item.settlement_id
            ? { ...record, unlocked: true, ...updated }
            : record
        )
      );

      setUnlocking(null);
      setRecentlyUnlocked(item.settlement_id);

      window.setTimeout(() => {
        setRecentlyUnlocked((current) =>
          current === item.settlement_id ? null : current
        );
      }, 1400);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to unlock this settlement."
        );
      }

      setUnlocking(null);
    }
  }

  if (!authLoading && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (authLoading || !token || loading) {
    return (
      <main className="page">
        <div className="loading">
          RETRIEVING PERSONAL SETTLEMENT RECORDS…
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="detail-header terminal-reveal terminal-reveal-delay-1">
        <div>
          <span className="eyebrow">Survivor terminal</span>
          <h1>My Settlements</h1>
          <p className="lead">
            Unlock catalogue sites and track the resources that keep each
            community running.
          </p>
        </div>

        <Link className="button secondary" to="/settlements">
          VIEW CATALOGUE
        </Link>
      </div>

      {returnedMessage && <div className="notice">{returnedMessage}</div>}
      {error && <div className="notice error">{error}</div>}

      <section className="toolbar my-settlements-toolbar terminal-reveal terminal-reveal-delay-2">
        <input
          type="text"
          placeholder="SEARCH SETTLEMENTS..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="region-filter" ref={regionMenuRef}>
          <button
            type="button"
            className={`filter-dropdown ${
              regionMenuOpen ? "open" : ""
            }`}
            onClick={() => setRegionMenuOpen((current) => !current)}
          >
            <span>{getRegionLabel()}</span>
            <span className="filter-arrow">⌄</span>
          </button>

          {regionMenuOpen && (
            <div className="filter-menu">
              <button
                type="button"
                className={`filter-option ${
                  selectedRegions.length === 0 ? "selected" : ""
                }`}
                onClick={() => setSelectedRegions([])}
              >
                <span className="filter-checkbox">
                  {selectedRegions.length === 0 ? "✓" : ""}
                </span>
                <span>ALL REGIONS</span>
              </button>

              {regions.map((region) => {
                const selected = selectedRegions.includes(region);

                return (
                  <button
                    type="button"
                    className={`filter-option ${
                      selected ? "selected" : ""
                    }`}
                    key={region}
                    onClick={() => toggleRegion(region)}
                  >
                    <span className="filter-checkbox">
                      {selected ? "✓" : ""}
                    </span>
                    <span>{region}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
        >
          <option value="name">NAME</option>
          <option value="region">REGION</option>
          <option value="addon">ADD-ON</option>
          <option value="status">STATUS</option>
        </select>

        {sortBy === "status" ? (
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="unlocked">UNLOCKED</option>
            <option value="locked">LOCKED</option>
          </select>
        ) : (
          <select
            value={sortDirection}
            onChange={(event) => setSortDirection(event.target.value)}
          >
            <option value="asc">ASCENDING</option>
            <option value="desc">DESCENDING</option>
          </select>
        )}
      </section>

      <section className="my-settlements-list terminal-reveal terminal-reveal-delay-3">
        {visibleItems.length === 0 ? (
          <div className="empty">
            {items.length === 0
              ? "No settlement records are available for this account."
              : "No settlements match your search."}
          </div>
        ) : (
          visibleItems.map((item) => (
            <article
              className={`my-settlement ${item.unlocked ? "" : "locked"} ${
                unlocking === item.settlement_id ? "unlocking" : ""
              } ${recentlyUnlocked === item.settlement_id ? "recently-unlocked" : ""}`}
              key={item.settlement_id}
            >
              <div className="my-settlement-heading">
                <div>
                  <h2>{item.name}</h2>

                  <span
                    className={`status ${item.unlocked ? "active" : ""}`}
                  >
                    {item.unlocked ? "UNLOCKED" : "LOCKED"}
                  </span>
                </div>

                {item.unlocked ? (
                  <Link
                    className="button secondary"
                    to={`/my-settlements/${item.settlement_id}`}
                  >
                    MANAGE
                  </Link>
                ) : (
                  <button
                    className="button"
                    disabled={unlocking === item.settlement_id}
                    onClick={() => unlock(item)}
                  >
                    {unlocking === item.settlement_id ? (
                      <span className="button-loading">
                        UNLOCKING
                        <span className="button-loading-indicator" aria-hidden="true" />
                      </span>
                    ) : (
                      "UNLOCK"
                    )}
                  </button>
                )}
              </div>

              {item.unlocked && (
                <div className="tracked-stats">
                  {tracked.map((key) => (
                    <div key={key}>
                      <strong>{item[key]}</strong>
                      <span>{key}</span>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))
        )}
      </section>
    </main>
  );
}