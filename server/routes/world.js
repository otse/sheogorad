import { Router } from 'express';

export function createWorldRouter({ simulation }) {
	const router = Router();

	router.get('/', (req, res) => {
		res.json(simulation.getWorldStatus());
	});

	return router;
}
