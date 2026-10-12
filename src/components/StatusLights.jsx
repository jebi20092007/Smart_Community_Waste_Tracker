// Mirrors the three LEDs on the ESP32 (GPIO 13 / 14 / 15).
const LAMPS = [
  { id: "green", label: "Green", hint: "Under 50% full", on: (t) => t === "ok" },
  { id: "yellow", label: "Yellow", hint: "50% to 80% full", on: (t) => t === "filling" },
  { id: "red", label: "Red", hint: "80%+ full or opening blocked", on: (t) => t === "full" || t === "alert" },
];

export default function StatusLights({ tone, active }) {
  return (
    <ul className="lights" aria-label="Bin indicator lights">
      {LAMPS.map((l) => {
        const lit = active && l.on(tone);
        return (
          <li key={l.id} className={`light light--${l.id} ${lit ? "is-lit" : ""}`}>
            <span className="light__bulb" aria-hidden="true" />
            <span className="light__text">
              <strong>
                {l.label}
                <span className="sr-only">{lit ? " light is on" : " light is off"}</span>
              </strong>
              <small>{l.hint}</small>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
