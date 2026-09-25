import { Router } from 'express';
import { sendVersioned } from '../lib/change-tracking.js';

export function createAreasRouter({ simulation }) {
	const router = Router();

	router.get('/', (req, res) => {
		res.json(simulation.listAreas());
	});

	router.get('/:name', (req, res) => {
		const area = simulation.areas.get(req.params.name);
		if (!area) return res.status(404).json({ error: `Unknown area "${req.params.name}"` });
		sendVersioned(res, req, area.version, () => simulation.getArea(area.id));
	});

	router.get('/:name/buildings/:buildingId', (req, res) => {
		const building = simulation.getBuilding(req.params.name, req.params.buildingId);
		if (!building) return res.status(404).json({ error: `Unknown building "${req.params.buildingId}" in "${req.params.name}"` });
		sendVersioned(res, req, building.version, () => building);
	});

	// Body: { versions: { [buildingOrNpcId]: lastKnownVersion } }.
	// Returns only the buildings/npcs whose version moved past what was sent.
	router.post('/:name/changes', (req, res) => {
		const area = simulation.areas.get(req.params.name);
		if (!area) return res.status(404).json({ error: `Unknown area "${req.params.name}"` });

		const knownVersions = req.body?.versions;
		if (typeof knownVersions !== 'object' || knownVersions === null || Array.isArray(knownVersions)) {
			return res.status(400).json({ error: '"versions" must be an object mapping id -> version' });
		}

		res.json(simulation.getAreaChanges(area.id, knownVersions));
	});

	return router;
}
