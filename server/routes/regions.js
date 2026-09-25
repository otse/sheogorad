import { Router } from 'express';
import { sendVersioned } from '../lib/change-tracking.js';

export function createRegionsRouter({ simulation }) {
	const router = Router();

	router.get('/', (req, res) => {
		res.json(simulation.listRegions());
	});

	router.get('/:region', (req, res) => {
		const region = simulation.regions.get(req.params.region);
		if (!region) return res.status(404).json({ error: `Unknown region "${req.params.region}"` });
		sendVersioned(res, req, region.version, () => simulation.getRegion(region.id));
	});

	return router;
}
