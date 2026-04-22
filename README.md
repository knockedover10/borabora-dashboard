# Bora Bora Integrated Hub — Project Dashboard

Project tracking dashboard for the **Vaitape Luxury Integrated Hub**, Municipality of Bora Bora.

## Sections
- **Dashboard** — Overall project progress, milestone tracker, team progress
- **Luxury Hotel** — Slide deck tracker for the Strategic Positioning Study
- **Designer Village** — Coming soon
- **Yacht Club** — Coming soon

---

## Deploy on Railway (recommended)

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **New Project → Deploy from GitHub repo**
3. Select `borabora-dashboard`
4. Add one environment variable: `NODE_ENV` = `production`
5. Go to **Settings → Networking → Generate Domain**
6. Share the URL with your team

The `railway.toml` file in this repo handles build and start commands automatically.

---

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5000](http://localhost:5000)
