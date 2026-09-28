# Sheogorad

Sheogorad is a simulation of mostly canon morrowind. It has elements of roguelikes and story generators, while being absolutely neither.

- **Mood:** fallout shelter, folder dungeon, neverending legacy

[(Read the GDD.md?)](md%20files/gdd.md)

## Non canon abominationworlds

Experimental chaos simulations are supported:

* Hostile Silt Strider World-1
* Red Year

## Pretty .md files

[Provided Here (Docs).](md%20files/write-up.md)

If you are okay with banter try /text files.

## Run locally

Install dependencies and start the app and API server:

```sh
npm install
npm start
```

Open `http://localhost:3001`. The browser loads world, region, area, NPC, and lore data through the `/api` endpoints. Use **Refresh data** to pull the latest server snapshot; versioned region and area responses avoid resending unchanged details.

The source datasets live in `server/data/world` and are loaded only by the backend. Server source paths are not exposed by the static client server.