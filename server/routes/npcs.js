import { Router } from 'express';
import { sendVersioned } from '../http/versioned-response.js';

/** @param {{ simulation: import('../domain/simulation.js').Simulation }} dependencies */
export function createNpcsRouter({ simulation }) {
	const router = Router();
	router.get('/', (req, res) => {
		const { region, settlement, buildingId, name } = req.query;
		res.json(simulation.listNpcs({
			region: typeof region === 'string' ? region : undefined,
			settlement: typeof settlement === 'string' ? settlement : undefined,
			buildingId: typeof buildingId === 'string' ? buildingId : undefined,
			name: typeof name === 'string' ? name : undefined
		}));
	});

	router.get('/:name', (req, res) => {
		const npc = simulation.npcs.get(req.params.name)
			?? [...simulation.npcs.values()].find((entry) => entry.name.toLowerCase() === req.params.name.toLowerCase());
		if (!npc)
			return res.status(404).json({ error: `Unknown npc "${req.params.name}"` });
		sendVersioned(res, req, npc.version, () => simulation.serializeNpc(npc));
	});

	return router;
}