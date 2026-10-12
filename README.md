# Waste Tracker Dashboard (React + Vite)

Live dashboard for the Smart Community Waste Tracker. It polls `GET /api/sensor-data`
on the Spring Boot backend every 3 seconds.

## Run it
1. Start the backend: `cd backend && mvn spring-boot:run`
2. In this folder: `npm install` then `npm run dev`
3. Open http://localhost:5173

No hardware yet? Switch on "Use simulated data" in the Connection section.

## Backend address
Default is `http://localhost:8080`. Change it in the Connection section (it is remembered in
the browser), or set `VITE_API_URL` in a `.env` file (see `.env.example`).
To open the dashboard from a phone on the same Wi-Fi, use the laptop's IPv4 address instead of localhost.

## Keep in sync
`BIN_HEIGHT_CM` in `src/useSensor.js` (12 cm) must match the ESP32 sketch and the backend.
