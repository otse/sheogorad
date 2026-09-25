// 🧙‍♀️ Code magic within
// Entry point: loads the world once, starts the tick simulation, and
// exposes it all over a small REST API (plus the static client, for
// convenience, on the same origin).

import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadWorldData } from './lib/data.js';
import { Simulation } from './lib/simulation.js';
import { createWorldRouter } from './routes/world.js';
import { createRegionsRouter } from './routes/regions.js';
import { createAreasRouter } from './routes/areas.js';
import { createNpcsRouter } from './routes/npcs.js';
import { createLoreRouter } from './routes/lore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_ROOT = path.resolve(__dirname, '..');

const PORT = process.env.PORT || 3001;
const TICK_MS = 4000;

async function main() {
	const worldData = await loadWorldData();
	const simulation = new Simulation(worldData);
	setInterval(() => simulation.step(), TICK_MS);

	const app = express();
	app.use(cors());
	app.use(express.json());

	app.get('/api', (req, res) => {
		res.json({
			endpoints: [
				'GET /api/world',
				'GET /api/regions',
				'GET /api/regions/:region',
				'GET /api/areas',
				'GET /api/areas/:name',
				'GET /api/areas/:name/buildings/:buildingId',
				'POST /api/areas/:name/changes',
				'GET /api/npcs',
				'GET /api/npcs/:name',
				'GET /api/lore',
				'GET /api/lore/:name',
			],
		});
	});

	app.use('/api/world', createWorldRouter({ worldData, simulation }));
	app.use('/api/regions', createRegionsRouter({ worldData, simulation }));
	app.use('/api/areas', createAreasRouter({ worldData, simulation }));
	app.use('/api/npcs', createNpcsRouter({ worldData, simulation }));
	app.use('/api/lore', createLoreRouter({ worldData, simulation }));

	// Serve the game client itself so the whole thing can run from one origin.
	app.use(express.static(CLIENT_ROOT));

	app.listen(PORT, () => {
		console.log(`Sheogorad server listening on http://localhost:${PORT}`);
		console.log(`API root: http://localhost:${PORT}/api`);
	});
}

main().catch(err => {
	console.error('Failed to start Sheogorad server:', err);
	process.exit(1);
});
