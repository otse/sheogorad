// 🧙‍♀️ Code magic within

import { Router } from 'express';

export function createNpcsRouter({ simulation }) {
	const router = Router();

	// Real-time NPC data, filterable by region/settlement/building/name.
	router.get('/', (req, res) => {
		const { region, settlement, buildingId, name } = req.query;
		res.json(simulation.list({ region, settlement, buildingId, name }));
	});

	router.get('/:name', (req, res) => {
		const npc = simulation.get(decodeURIComponent(req.params.name));
		if (!npc) return res.status(404).json({ error: 'NPC not found' });
		res.json(npc);
	});

	return router;
}
