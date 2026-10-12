import { useState } from "react";
import { useSensor, BIN_HEIGHT_CM } from "./useSensor.js";
import BinGauge from "./components/BinGauge.jsx";
import StatusLights from "./components/StatusLights.jsx";
import HistoryChart from "./components/HistoryChart.jsx";
import ConnectionPanel from "./components/ConnectionPanel.jsx";

const DEFAULT_API = import.meta.env.VITE_API_URL || "http://localhost:8080";

function load(key, fallback) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable: setting just won't persist */
  }
}

const TONES = {
  ok: { title: "Plenty of room", note: "No action needed." },
  filling: { title: "Filling up", note: "Plan a pickup in the next few days." },
  full: { title: "Almost full", note: "Schedule a pickup soon." },
  alert: { title: "Opening is blocked", note: "Something is covering the bin opening. Send someone to clear it." },
};

function toneFor(status) {
  switch (status) {
    case "BLOCKAGE DETECTED": return "alert";
    case "ALMOST FULL": return "full";
    case "FILLING": return "filling";
    default: return "ok";
  }
}

function ago(ms) {
  const s = Math.round(ms / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s} seconds ago`;
  const m = Math.floor(s / 60);
  return `${m} minute${m === 1 ? "" : "s"} ago`;
}

export default function App() {
  const [apiUrl, setApiUrl] = useState(() => load("wt.apiUrl", DEFAULT_API));
  const [demo, setDemo] = useState(() => load("wt.demo", "0") === "1");
  const { reading, history, link, ageMs, stale, waiting } = useSensor({ apiUrl, demo });

  const hasData = !!reading && !!reading.lastUpdated && link !== "offline";
  const tone = hasData ? toneFor(reading.status) : "idle";
  const showReading = hasData && !stale;

  let title, note;
  if (link === "offline" && !reading) {
    title = "No connection";
    note = "The dashboard can't reach the backend.";
  } else if (!reading) {
    title = "Connecting";
    note = "Looking for the backend.";
  } else if (waiting) {
    title = "Waiting for the bin";
    note = "The backend is running but the ESP32 hasn't sent a reading yet.";
  } else if (stale) {
    title = "Bin stopped reporting";
    note = `The last reading was ${ago(ageMs)}. Check the ESP32's power and Wi-Fi.`;
  } else if (link === "offline") {
    title = "Connection lost";
    note = "Showing the last reading received.";
  } else {
    ({ title, note } = TONES[tone]);
  }

  const fill = reading?.fillLevel ?? 0;
  const freeCm = reading ? Math.max(0, reading.distance) : null;

  const changeApi = (v) => { save("wt.apiUrl", v); setApiUrl(v); };
  const changeDemo = (v) => { save("wt.demo", v ? "1" : "0"); setDemo(v); };

  return (
    <div className={`app tone-${tone}`}>
      <header className="top">
        <h1>Community Waste Tracker</h1>
        <p className={`pill pill--${link}`}>
          <span className="dot" aria-hidden="true" />
          {link === "live" ? "Live" : link === "demo" ? "Simulated" : link === "offline" ? "Offline" : "Connecting"}
        </p>
      </header>

      <main className="layout">
        <section className="stage" aria-labelledby="status-title">
          <div className="stage__bin">
            <BinGauge fill={fill} tone={tone} blocked={showReading && reading.blockage} dim={!hasData} />
          </div>
          <div className="stage__text">
            <p className="stage__pct" aria-hidden={!hasData}>
              {hasData ? Math.round(fill) : "–"}
              <span>% full</span>
            </p>
            <h2 id="status-title" aria-live="polite">{title}</h2>
            <p className="stage__note">{note}</p>
          </div>
        </section>

        <div className="side">
          <section aria-labelledby="lights-title">
            <h2 id="lights-title">Indicator lights</h2>
            <StatusLights tone={tone} active={showReading} />
          </section>

          <section aria-labelledby="read-title">
            <h2 id="read-title">Latest reading</h2>
            <dl className="readout">
              <div>
                <dt>Space left</dt>
                <dd>{hasData ? <>{freeCm.toFixed(1)}<small> of {BIN_HEIGHT_CM} cm</small></> : "–"}</dd>
              </div>
              <div>
                <dt>Opening</dt>
                <dd className={hasData && reading.blockage ? "bad" : ""}>
                  {hasData ? (reading.blockage ? "Blocked" : "Clear") : "–"}
                </dd>
              </div>
              <div>
                <dt>Updated</dt>
                <dd>{hasData ? ago(ageMs) : "–"}</dd>
              </div>
            </dl>
          </section>
        </div>

        <section className="history" aria-labelledby="hist-title">
          <h2 id="hist-title">Fill level since you opened this page</h2>
          <HistoryChart points={history} />
        </section>

        <ConnectionPanel link={link} apiUrl={apiUrl} demo={demo} onApiUrl={changeApi} onDemo={changeDemo} />
      </main>
    </div>
  );
}
