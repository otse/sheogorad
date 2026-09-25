import { Router } from 'express';
import { slugify } from '../lib/ids.js';

export function createLoreRouter({ worldData }) {
	const router = Router();
	const bySlug = new Map(worldData.lore.map(entry => [slugify(entry.name), entry]));

	router.get('/', (req, res) => {
		res.json(worldData.lore.map(({ name, type, summary }) => ({ id: slugify(name), name, type, summary })));
	});

	router.get('/:name', (req, res) => {
		const entry = bySlug.get(req.params.name) ?? bySlug.get(slugify(req.params.name));
		if (!entry) return res.status(404).json({ error: `Unknown lore entry "${req.params.name}"` });
		res.json({ id: slugify(entry.name), ...entry });
	});

	return router;
}
