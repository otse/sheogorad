import { Router } from 'express';
import { sendVersioned } from '../lib/change-tracking.js';

export function createNpcsRouter({ simulation }) {
	const router = Router();

	router.get('/', (req, res) => {
		const { region, settlement, buildingId, name } = req.query;
		res.json(simulation.listNpcs({ region, settlement, buildingId, name }));
	});

	router.get('/:name', (req, res) => {
		const npc = simulation.npcs.get(req.params.name)
			?? [...simulation.npcs.values()].find(n => n.name.toLowerCase() === req.params.name.toLowerCase());
		if (!npc) return res.status(404).json({ error: `Unknown npc "${req.params.name}"` });
		sendVersioned(res, req, npc.version, () => simulation.serializeNpc(npc));
	});

	return router;
}
