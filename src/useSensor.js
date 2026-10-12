import { useEffect, useRef, useState } from "react";

export const POLL_MS = 3000;
export const STALE_AFTER_MS = 15000;
export const BIN_HEIGHT_CM = 12; // keep in sync with the ESP32 sketch and backend
const MAX_POINTS = 80;

// Same thresholds as the backend: <50 normal, 50-80 filling, >=80 almost full.
function statusFor(fill, blockage) {
  if (blockage) return "BLOCKAGE DETECTED";
  if (fill >= 80) return "ALMOST FULL";
  if (fill >= 50) return "FILLING";
  return "NORMAL";
}

// Fake ESP32 for working on the UI without hardware.
function nextDemoReading(state) {
  if (state.blockTicks > 0) state.blockTicks -= 1;
  else if (Math.random() < 0.04) state.blockTicks = 3;

  state.fill += 1 + Math.random() * 3.5;
  if (state.fill > 100) state.fill = 8 + Math.random() * 10; // bin emptied

  const fill = Math.round(state.fill * 10) / 10;
  const distance = Math.round(((100 - fill) / 100) * BIN_HEIGHT_CM * 10) / 10;
  const blockage = state.blockTicks > 0;
  return {
    distance,
    blockage,
    fillLevel: fill,
    status: statusFor(fill, blockage),
    lastUpdated: new Date().toISOString(),
  };
}

export function useSensor({ apiUrl, demo }) {
  const [reading, setReading] = useState(null);
  const [history, setHistory] = useState([]);
  const [link, setLink] = useState(demo ? "demo" : "connecting");
  const [now, setNow] = useState(Date.now());
  const lastStamp = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setReading(null);
    setHistory([]);
    lastStamp.current = null;
    let stopped = false;

    const accept = (r) => {
      setReading(r);
      if (r.lastUpdated && r.lastUpdated !== lastStamp.current) {
        lastStamp.current = r.lastUpdated;
        setHistory((h) =>
          [...h, { t: Date.parse(r.lastUpdated), fill: r.fillLevel, blockage: r.blockage }].slice(-MAX_POINTS)
        );
      }
    };

    if (demo) {
      setLink("demo");
      const demoState = { fill: 22, blockTicks: 0 };
      const tick = () => accept(nextDemoReading(demoState));
      tick();
      const id = setInterval(tick, POLL_MS);
      return () => {
        stopped = true;
        clearInterval(id);
      };
    }

    setLink("connecting");
    const base = apiUrl.replace(/\/+$/, "");

    const poll = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      try {
        const res = await fetch(`${base}/api/sensor-data`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!stopped) {
          setLink("live");
          accept(data);
        }
      } catch {
        if (!stopped) setLink("offline");
      } finally {
        clearTimeout(timeout);
      }
    };

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [apiUrl, demo]);

  const ageMs = reading?.lastUpdated ? Math.max(0, now - Date.parse(reading.lastUpdated)) : null;
  const stale = link === "live" && ageMs !== null && ageMs > STALE_AFTER_MS;
  const waiting = link === "live" && reading && !reading.lastUpdated;

  return { reading, history, link, ageMs, stale, waiting };
}
