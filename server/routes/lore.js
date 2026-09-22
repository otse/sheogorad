// 🧙‍♀️ Code magic within

import { Router } from 'express';

export function createLoreRouter({ worldData }) {
	const router = Router();

	router.get('/', (req, res) => {
		const { type, region } = req.query;
		let entries = worldData.lore;
		if (type) entries = entries.filter(e => e.type?.toLowerCase() === type.toLowerCase());
		if (region) entries = entries.filter(e => e.region?.toLowerCase() === region.toLowerCase());
		res.json(entries);
	});

	router.get('/:name', (req, res) => {
		const name = decodeURIComponent(req.params.name).toLowerCase();
		const entry = worldData.lore.find(e => e.name.toLowerCase() === name);
		if (!entry) return res.status(404).json({ error: 'Lore entry not found' });
		res.json(entry);
	});

	return router;
}
