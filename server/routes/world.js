import { Router } from 'express';

/** @param {{ simulation: import('../domain/simulation.js').Simulation }} dependencies */
export function createWorldRouter({ simulation }) {
	const router = Router();
	router.get('/', (req, res) => res.json(simulation.getWorldStatus()));
	return router;
}