import { useState } from "react";

const LINK_TEXT = {
  live: "Receiving data from the backend",
  demo: "Showing simulated data",
  connecting: "Connecting to the backend",
  offline: "Can't reach the backend",
};

export default function ConnectionPanel({ link, apiUrl, demo, onApiUrl, onDemo }) {
  const [draft, setDraft] = useState(apiUrl);

  const save = (e) => {
    e.preventDefault();
    onApiUrl(draft.trim() || "http://localhost:8080");
  };

  return (
    <section className="conn" aria-labelledby="conn-title">
      <h2 id="conn-title">Connection</h2>
      <p className={`conn__state conn__state--${link}`}>
        <span className="dot" aria-hidden="true" /> {LINK_TEXT[link]}
      </p>

      <form onSubmit={save} className="conn__form">
        <label htmlFor="api-url">Backend address</label>
        <div className="conn__row">
          <input id="api-url" value={draft} onChange={(e) => setDraft(e.target.value)} spellCheck="false" inputMode="url" />
          <button type="submit" className="btn">Save address</button>
        </div>
      </form>

      <label className="switch">
        <input type="checkbox" checked={demo} onChange={(e) => onDemo(e.target.checked)} />
        <span className="switch__track" aria-hidden="true" />
        <span>Use simulated data (no hardware needed)</span>
      </label>

      {link === "offline" && !demo && (
        <p className="conn__help">
          Start the backend with <code>mvn spring-boot:run</code> in the <code>backend</code> folder, then check the address above.
          You can switch on simulated data to preview the dashboard meanwhile.
        </p>
      )}
    </section>
  );
}
