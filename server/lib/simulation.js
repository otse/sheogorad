// Ticks the runtime world forward. Movement is intentionally rudimentary:
// most npcs just sit at home, occasionally step outside into their area,
// and eventually wander back in. No AI, no pathfinding, just small odds
// rolled every tick.

import { buildWorld } from './world.js';

const CHANCE_TO_STEP_OUT = 0.04;
const CHANCE_TO_RETURN_HOME = 0.2;

export class Simulation {
	constructor(worldData) {
		this.worldData = worldData;
		const { regions, areas, buildings, npcs } = buildWorld(worldData.canon, worldData.icons);
		this.regions = regions;
		this.areas = areas;
		this.buildings = buildings;
		this.npcs = npcs;
		this.tick = 0;
		this.startedAt = new Date().toISOString();
	}

	step() {
		this.tick += 1;
		for (const npc of this.npcs.values()) {
			if (npc.status === 'inside') {
				if (Math.random() < CHANCE_TO_STEP_OUT) this.#moveOutside(npc);
			} else if (Math.random() < CHANCE_TO_RETURN_HOME) {
				this.#moveHome(npc);
			}
		}
	}

	#moveOutside(npc) {
		const building = this.buildings.get(npc.buildingId);
		npc.buildingId = null;
		npc.status = 'outside';
		npc.lastEvent = building ? `stepped outside ${building.name}` : 'stepped outside';
		npc.touch();
		building?.touch();
		this.areas.get(npc.areaId)?.touch();
	}

	#moveHome(npc) {
		const building = this.buildings.get(npc.homeBuildingId);
		npc.buildingId = npc.homeBuildingId;
		npc.status = 'inside';
		npc.lastEvent = building ? `went back into ${building.name}` : 'went back home';
		npc.touch();
		building?.touch();
		this.areas.get(npc.areaId)?.touch();
	}

	getWorldStatus() {
		return {
			tick: this.tick,
			startedAt: this.startedAt,
			regionCount: this.regions.size,
			areaCount: this.areas.size,
			buildingCount: this.buildings.size,
			npcCount: this.npcs.size,
			regions: [...this.regions.values()].map(r => ({ id: r.id, name: r.name, areaCount: r.areaIds.length })),
		};
	}

	listRegions() {
		return [...this.regions.values()].map(r => this.serializeRegion(r));
	}

	getRegion(id) {
		const region = this.regions.get(id);
		return region ? this.serializeRegion(region) : null;
	}

	listAreas() {
		return [...this.areas.values()].map(a => this.serializeArea(a));
	}

	getArea(id) {
		const area = this.areas.get(id);
		return area ? this.serializeArea(area, { withBuildings: true }) : null;
	}

	getBuilding(areaId, buildingId) {
		const building = this.buildings.get(buildingId);
		if (!building || building.areaId !== areaId) return null;
		return this.serializeBuilding(building, { withNpcs: true });
	}

	// Diffs an area against a client's known { id: version } map, returning
	// only the buildings/npcs that are newer than what the client already has.
	getAreaChanges(areaId, knownVersions = {}) {
		const area = this.areas.get(areaId);
		if (!area) return null;

		const buildings = [];
		const npcIds = new Set();
		for (const buildingId of area.buildingIds) {
			const building = this.buildings.get(buildingId);
			for (const npcId of building.npcIds) npcIds.add(npcId);
			if (knownVersions[buildingId] !== building.version) {
				buildings.push(this.serializeBuilding(building, { withNpcs: false }));
			}
		}

		const npcs = [];
		for (const npcId of npcIds) {
			const npc = this.npcs.get(npcId);
			if (knownVersions[npcId] !== npc.version) npcs.push(this.serializeNpc(npc));
		}

		return { areaId: area.id, version: area.version, buildings, npcs };
	}

	listNpcs({ region, settlement, buildingId, name } = {}) {
		let list = [...this.npcs.values()];
		if (region) list = list.filter(n => this.areas.get(n.areaId)?.regionId === region);
		if (settlement) list = list.filter(n => n.areaId === settlement);
		if (buildingId) list = list.filter(n => n.buildingId === buildingId || n.homeBuildingId === buildingId);
		if (name) {
			const needle = name.toLowerCase();
			list = list.filter(n => n.id.includes(needle) || n.name.toLowerCase().includes(needle));
		}
		return list.map(n => this.serializeNpc(n));
	}

	getNpc(id) {
		const npc = this.npcs.get(id) ?? [...this.npcs.values()].find(n => n.name.toLowerCase() === id.toLowerCase());
		return npc ? this.serializeNpc(npc) : null;
	}

	serializeRegion(region) {
		return {
			id: region.id,
			name: region.name,
			version: region.version,
			areas: region.areaIds.map(id => {
				const area = this.areas.get(id);
				return { id: area.id, name: area.name, version: area.version, npcCount: this.#npcCountForArea(area.id) };
			}),
		};
	}

	serializeArea(area, { withBuildings = false } = {}) {
		const base = {
			id: area.id,
			name: area.name,
			regionId: area.regionId,
			type: area.type,
			alignment: area.alignment,
			services: area.services,
			transport: area.transport,
			version: area.version,
			npcCount: this.#npcCountForArea(area.id),
		};
		if (!withBuildings) return base;

		return {
			...base,
			buildings: area.buildingIds.map(id => this.serializeBuilding(this.buildings.get(id), { withNpcs: true })),
			npcsOutside: [...this.npcs.values()]
				.filter(n => n.areaId === area.id && n.status === 'outside')
				.map(n => this.serializeNpc(n)),
		};
	}

	serializeBuilding(building, { withNpcs = false } = {}) {
		const base = {
			id: building.id,
			key: building.key,
			areaId: building.areaId,
			name: building.name,
			condition: building.condition,
			modifier: building.modifier,
			items: building.items,
			version: building.version,
			npcCount: building.npcIds.filter(id => this.npcs.get(id)?.buildingId === building.id).length,
		};
		if (!withNpcs) return base;

		return {
			...base,
			npcs: building.npcIds.map(id => this.serializeNpc(this.npcs.get(id))),
		};
	}

	serializeNpc(npc) {
		return {
			id: npc.id,
			name: npc.name,
			icon: npc.icon,
			isForced: npc.isForced,
			homeAreaId: npc.homeAreaId,
			homeBuildingId: npc.homeBuildingId,
			areaId: npc.areaId,
			buildingId: npc.buildingId,
			status: npc.status,
			lastEvent: npc.lastEvent,
			version: npc.version,
		};
	}

	#npcCountForArea(areaId) {
		let count = 0;
		for (const npc of this.npcs.values()) if (npc.areaId === areaId) count += 1;
		return count;
	}
}
