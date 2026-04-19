# SoPra FS26 Group 13 Client

[![Quality gate](https://sonarcloud.io/api/project_badges/quality_gate?project=bergwald_sopra-fs26-group-13-client)](https://sonarcloud.io/summary/new_code?id=bergwald_sopra-fs26-group-13-client)

## Deployment

Backend deployment URL: https://sopra-fs26-group-13-server.oa.r.appspot.com

Frontend deployment URL: https://sopra-fs26-group-13-client.vercel.app

## Local Development

To launch the frontend locally, install dependencies and start the Next.js dev server:

```bash
npm install
npm run dev
```

### Google Street View Setup

The demo game page uses a browser Google Maps JavaScript API key for Street View.

1. Create a file named `.env.local` in the project root.
2. Add the following variable:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_API_KEY=your_browser_restricted_key_here
```

3. Restart the dev server after changing the file.

Without this variable, the Street View demo on `/game/demo` will show a missing-key error state instead of the panorama.
