# Sheogorad Server Branch

Sheogorad is a simulation of mostly canon morrowind. It has elements of roguelikes and story generators, while being absolutely neither.

- **Mood:** fallout shelter, folder dungeon, neverending legacy

## Server / REST API

`server/` is a small Node/Express app that loads the `json/` data files, runs
a live NPC simulation (ticks every few seconds: stats drift, status changes,
NPCs relocate between buildings), and exposes it over HTTP:

```
cd server
npm install
npm start   # http://localhost:3001
```

Endpoints (see `GET /api` for the full list): `/api/world`, `/api/regions`,
`/api/regions/:region`, `/api/areas`, `/api/areas/:name`,
`/api/areas/:name/buildings/:buildingId`, `/api/npcs` (filter with
`?region=&settlement=&buildingId=&name=`), `/api/npcs/:name`, `/api/lore`.

The server also serves the game client itself as static files, so
`http://localhost:3001` runs the whole thing from one origin.