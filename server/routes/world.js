// 🧙‍♀️ Code magic within

import { Router } from 'express';

export function createWorldRouter({ worldData, simulation }) {
	const router = Router();

	router.get('/', (req, res) => {
		res.json({
			tick: simulation.tick,
			uptimeMs: Date.now() - simulation.startedAt,
			regionCount: worldData.regions.length,
			settlementCount: worldData.settlements.size,
			npcCount: simulation.npcs.size,
		});
	});

	return router;
}
