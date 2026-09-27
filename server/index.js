import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadWorldData } from './data/load-world-data.js';
import { Simulation } from './domain/simulation.js';
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
				'GET /api/lore/:name'
			]
		});
	});

	app.use('/api/world', createWorldRouter({ simulation }));
	app.use('/api/regions', createRegionsRouter({ simulation }));
	app.use('/api/areas', createAreasRouter({ simulation }));
	app.use('/api/npcs', createNpcsRouter({ simulation }));
	app.use('/api/lore', createLoreRouter({ worldData }));
	app.use('/server', (req, res) => res.sendStatus(404));
	app.use(express.static(CLIENT_ROOT));

	app.listen(PORT, () => {
		console.log(`Sheogorad server listening on http://localhost:${PORT}`);
		console.log(`API root: http://localhost:${PORT}/api`);
	});
}

main().catch((error) => {
	console.error('Failed to start Sheogorad server:', error);
	process.exit(1);
});