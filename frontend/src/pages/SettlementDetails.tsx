import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { api, ApiError } from "../services/api";
import type { Settlement } from "../types/api";

const stations: [keyof Settlement["crafting_stations"], string][] = [["weapons_workbench", "Weapons Workbench"], ["armor_workbench", "Armor Workbench"], ["chemistry_station", "Chemistry Station"], ["cooking_station", "Cooking Station"], ["power_armor_station", "Power Armor Station"]];

export default function SettlementDetails() {
  const { settlementName = "" } = useParams();
  const [item, setItem] = useState<Settlement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true); setError(""); setNotFound(false);
    api.getSettlement(settlementName).then(setItem).catch((err: Error) => {
      if (err instanceof ApiError && err.status === 404) setNotFound(true);
      else setError(err.message);
    }).finally(() => setLoading(false));
  }, [settlementName]);

  if (loading) return <main className="page"><div className="loading">RETRIEVING SETTLEMENT RECORD…</div></main>;
  if (notFound) return <main className="page"><h1>Record unavailable</h1><p className="lead">This settlement could not be found in the current catalogue.</p><Link className="button" to="/settlements">RETURN TO CATALOGUE</Link></main>;
  if (error || !item) return <main className="page"><div className="notice error">Unable to load this settlement: {error}</div></main>;

  return (
    <main className="page">
      <div className="detail-header"><div><span className="eyebrow">{item.addon} // {item.region ?? "Unknown region"}</span><h1>{item.name}</h1><p className="lead">Reference ID: {item.ref_id}</p></div><Link className="button secondary" to="/settlements">← CATALOGUE</Link></div>
      <div className="detail-grid"><div className="panel">{item.map_image_url && <img className="map-image" src={item.map_image_url} alt={`Map of ${item.name}`} />}<h2>Field description</h2><p className="description">{item.description}</p><h2 className="section-title">How to obtain</h2><p className="description">{item.how_to_obtain}</p>{item.notes && <><h2 className="section-title">Notes</h2><p className="description">{item.notes}</p></>}{item.wiki_url && <p className="external-link"><a href={item.wiki_url} target="_blank" rel="noreferrer">OPEN EXTERNAL REFERENCE ↗</a></p>}</div><aside className="panel"><span className="eyebrow">On-site equipment</span><h2>Crafting stations</h2><div className="station-list">{stations.map(([key, label]) => <div className={`station-status ${item.crafting_stations[key] ? "available" : ""}`} key={key}><span>{label}</span><em>{item.crafting_stations[key] ? "AVAILABLE" : "UNAVAILABLE"}</em></div>)}</div></aside></div>
    </main>
  );
}
