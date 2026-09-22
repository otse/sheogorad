// 🧙‍♀️ Code magic within

import { Router } from 'express';

function findSettlement(worldData, rawName) {
	const name = decodeURIComponent(rawName).toLowerCase();
	for (const settlement of worldData.settlements.values()) {
		if (settlement.name.toLowerCase() === name) return settlement;
	}
	return null;
}

export function createAreasRouter({ worldData, simulation }) {
	const router = Router();

	// Area summaries: enough info for an overview list/map view.
	router.get('/', (req, res) => {
		const summaries = [...worldData.settlements.values()].map(settlement => ({
			name: settlement.name,
			region: settlement.region,
			type: settlement.type,
			alignment: settlement.alignment,
			buildingCount: settlement.buildings.length,
			npcCount: simulation.countInSettlement(settlement.name),
		}));
		res.json(summaries);
	});

	router.get('/:name', (req, res) => {
		const settlement = findSettlement(worldData, req.params.name);
		if (!settlement) return res.status(404).json({ error: 'Area not found' });

		res.json({
			name: settlement.name,
			region: settlement.region,
			type: settlement.type,
			alignment: settlement.alignment,
			services: settlement.services,
			transport: settlement.transport,
			npcCount: simulation.countInSettlement(settlement.name),
			buildings: settlement.buildings.map(building => ({
				buildingId: building.buildingId,
				name: building.name,
				condition: building.condition,
				modifier: building.modifier,
				items: building.items,
				npcCount: simulation.countInBuilding(settlement.name, building.buildingId),
			})),
		});
	});

	router.get('/:name/buildings/:buildingId', (req, res) => {
		const settlement = findSettlement(worldData, req.params.name);
		if (!settlement) return res.status(404).json({ error: 'Area not found' });

		const building = settlement.buildings.find(b => b.buildingId === req.params.buildingId);
		if (!building) return res.status(404).json({ error: 'Building not found' });

		res.json({
			...building,
			settlement: settlement.name,
			region: settlement.region,
			npcs: simulation.list({ settlement: settlement.name, buildingId: building.buildingId }),
		});
	});

	return router;
}
