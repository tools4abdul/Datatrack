# DataTrack Dashboard

A static analytics dashboard for tracking operational data quality, source health, event volumes, and channel performance.

## GitHub Pages compatibility

This dashboard is implemented as a front-end-only static web application. It uses plain HTML, CSS, JavaScript, and a JSON data feed, so it can run directly on GitHub Pages without a Node.js or Express runtime.

## Project layout

- `index.html` is the dashboard shell.
- `styles.css` contains all page styling and layout.
- `script.js` fetches analytics data and renders the UI.
- `data/mockData.json` provides the dashboard dataset.
- `.github/workflows/pages.yml` publishes the repository as a static GitHub Pages site.

## Standard API protocol ingest contract

The static dashboard payload exposes a top-level `ingest` object for protocol ingestion visibility. The contract is intentionally front-end friendly and static-hosting compatible:

```json
{
  "ingest": {
    "lastSync": "2026-08-11T10:16:00Z",
    "runtime": "live",
    "totalSources": 18,
    "protocols": [
      {
        "name": "REST",
        "status": "online",
        "sources": 7,
        "latency": "1.2m",
        "successRate": 98,
        "endpoint": "/api/v1"
      }
    ]
  }
}
```

The protocol list is designed to describe common standard protocol coverage surfaces for source ingestion: `REST`, `GraphQL`, `SOAP`, and `Webhook`.

## Local testing

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Then open:

http://127.0.0.1:4173

## GitHub Pages deployment

The repository includes a GitHub Actions workflow that publishes the static site to GitHub Pages on pushes to the `main` branch.
