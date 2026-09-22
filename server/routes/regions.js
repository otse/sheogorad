// 🧙‍♀️ Code magic within

import { Router } from 'express';

export function createRegionsRouter({ worldData }) {
	const router = Router();

	router.get('/', (req, res) => {
		res.json(worldData.regions.map(region => ({
			name: region.name,
			settlementCount: region.settlements.length,
			settlements: region.settlements,
		})));
	});

	router.get('/:region', (req, res) => {
		const region = worldData.regions.find(
			r => r.name.toLowerCase() === decodeURIComponent(req.params.region).toLowerCase()
		);
		if (!region) return res.status(404).json({ error: 'Region not found' });

		res.json({
			name: region.name,
			settlements: region.settlements.map(name => worldData.settlements.get(name)),
		});
	});

	return router;
}
