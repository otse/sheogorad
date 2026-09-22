// 🧙‍♀️ Code magic within
// Turns the static world data into "live" NPCs: each one gets randomized
// stats and a status, then drifts/relocates a little on every tick() so
// clients polling the API see the world changing in real time.

const STATUSES = ['idle', 'working', 'resting', 'socializing', 'traveling', 'guarding'];

function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}

function randomInt(min, max) {
	return min + Math.floor(Math.random() * (max - min + 1));
}

function statDrift(status, volatility) {
	const bias = status === 'resting' ? 1 : (status === 'guarding' || status === 'traveling') ? -1 : 0;
	return bias + Math.round((Math.random() - 0.5) * volatility);
}

export class Simulation {
	tick = 0;
	startedAt = Date.now();

	constructor(worldData) {
		this.worldData = worldData;
		this.npcs = new Map();

		for (const roster of worldData.npcRoster.values()) {
			this.npcs.set(roster.name, this.#createRuntimeNpc(roster));
		}
	}

	#createRuntimeNpc(roster) {
		const maxLife = randomInt(40, 110);
		const maxMagicka = randomInt(20, 220);
		return {
			...roster,
			status: STATUSES[randomInt(0, STATUSES.length - 1)],
			stats: {
				life: { current: maxLife, max: maxLife },
				magicka: { current: maxMagicka, max: maxMagicka },
				level: randomInt(1, 25),
				pillars: {
					might: randomInt(1, 100),
					will: randomInt(1, 100),
					wits: randomInt(1, 100),
					charm: randomInt(1, 100),
				},
			},
			updatedAt: Date.now(),
		};
	}

	#relocate(npc) {
		const settlement = this.worldData.settlements.get(npc.settlement);
		if (!settlement || settlement.buildings.length < 2) return;

		const candidates = settlement.buildings.filter(b => b.buildingId !== npc.buildingId);
		const target = candidates[randomInt(0, candidates.length - 1)];
		if (target) {
			npc.buildingId = target.buildingId;
			npc.buildingName = target.name;
			npc.status = 'traveling';
		}
	}

	step() {
		this.tick += 1;
		const now = Date.now();

		for (const npc of this.npcs.values()) {
			if (Math.random() < 0.15) {
				npc.status = STATUSES[randomInt(0, STATUSES.length - 1)];
			}

			npc.stats.life.current = clamp(npc.stats.life.current + statDrift(npc.status, 3), 0, npc.stats.life.max);
			npc.stats.magicka.current = clamp(npc.stats.magicka.current + statDrift(npc.status, 6), 0, npc.stats.magicka.max);

			if (Math.random() < 0.05) {
				this.#relocate(npc);
			}

			npc.updatedAt = now;
		}
	}

	list({ region, settlement, buildingId, name } = {}) {
		let result = [...this.npcs.values()];
		if (region) result = result.filter(n => n.region.toLowerCase() === region.toLowerCase());
		if (settlement) result = result.filter(n => n.settlement.toLowerCase() === settlement.toLowerCase());
		if (buildingId) result = result.filter(n => n.buildingId === buildingId);
		if (name) result = result.filter(n => n.name.toLowerCase().includes(name.toLowerCase()));
		return result;
	}

	countInSettlement(settlementName) {
		return this.list({ settlement: settlementName }).length;
	}

	countInBuilding(settlementName, buildingId) {
		return this.list({ settlement: settlementName, buildingId }).length;
	}

	get(name) {
		return this.npcs.get(name);
	}
}
