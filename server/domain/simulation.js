import { buildWorld } from './world.js';

/**
 * @typedef {import('./world.js').Region} Region
 * @typedef {import('./world.js').Area} Area
 * @typedef {import('./world.js').Building} Building
 * @typedef {import('./world.js').Npc} Npc
 */

const CHANCE_TO_STEP_OUT = 0.04;
const CHANCE_TO_RETURN_HOME = 0.2;

export class Simulation {
	/** @param {import('../data/load-world-data.js').WorldData} worldData */
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
				if (Math.random() < CHANCE_TO_STEP_OUT)
					this.#moveOutside(npc);
			} else if (Math.random() < CHANCE_TO_RETURN_HOME) {
				this.#moveHome(npc);
			}
		}
	}

	/** @param {Npc} npc */
	#moveOutside(npc) {
		const building = npc.buildingId ? this.buildings.get(npc.buildingId) : undefined;
		npc.buildingId = null;
		npc.status = 'outside';
		npc.lastEvent = building ? `stepped outside ${building.name}` : 'stepped outside';
		npc.touch();
		building?.touch();
		this.areas.get(npc.areaId)?.touch();
	}

	/** @param {Npc} npc */
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
			regions: [...this.regions.values()].map((region) => ({ id: region.id, name: region.name, areaCount: region.areaIds.length }))
		};
	}

	listRegions() {
		return [...this.regions.values()].map((region) => this.serializeRegion(region));
	}

	/** @param {string} id */
	getRegion(id) {
		const region = this.regions.get(id);
		return region ? this.serializeRegion(region) : null;
	}

	listAreas() {
		return [...this.areas.values()].map((area) => this.serializeArea(area));
	}

	/** @param {string} id */
	getArea(id) {
		const area = this.areas.get(id);
		return area ? this.serializeArea(area, { withBuildings: true }) : null;
	}

	/** @param {string} areaId @param {string} buildingId */
	getBuilding(areaId, buildingId) {
		const building = this.buildings.get(buildingId);
		if (!building || building.areaId !== areaId)
			return null;
		return this.serializeBuilding(building, { withNpcs: true });
	}

	/** @param {string} areaId @param {Record<string, number>} [knownVersions] */
	getAreaChanges(areaId, knownVersions = {}) {
		const area = this.areas.get(areaId);
		if (!area)
			return null;

		const buildings = [];
		const npcIds = new Set();
		for (const buildingId of area.buildingIds) {
			const building = this.buildings.get(buildingId);
			if (!building)
				continue;
			for (const npcId of building.npcIds)
				npcIds.add(npcId);
			if (knownVersions[buildingId] !== building.version)
				buildings.push(this.serializeBuilding(building, { withNpcs: false }));
		}

		const npcs = [];
		for (const npcId of npcIds) {
			const npc = this.npcs.get(npcId);
			if (npc && knownVersions[npcId] !== npc.version)
				npcs.push(this.serializeNpc(npc));
		}

		return { areaId: area.id, version: area.version, buildings, npcs };
	}

	/** @param {{ region?: string, settlement?: string, buildingId?: string, name?: string }} [filters] */
	listNpcs({ region, settlement, buildingId, name } = {}) {
		let list = [...this.npcs.values()];
		if (region)
			list = list.filter((npc) => this.areas.get(npc.areaId)?.regionId === region);
		if (settlement)
			list = list.filter((npc) => npc.areaId === settlement);
		if (buildingId)
			list = list.filter((npc) => npc.buildingId === buildingId || npc.homeBuildingId === buildingId);
		if (name) {
			const needle = name.toLowerCase();
			list = list.filter((npc) => npc.id.includes(needle) || npc.name.toLowerCase().includes(needle));
		}
		return list.map((npc) => this.serializeNpc(npc));
	}

	/** @param {Region} region */
	serializeRegion(region) {
		return {
			id: region.id,
			name: region.name,
			version: region.version,
			areas: region.areaIds.map((id) => {
				const area = this.areas.get(id);
				if (!area)
					return null;
				return { id: area.id, name: area.name, version: area.version, npcCount: this.#npcCountForArea(area.id) };
			}).filter((area) => area !== null)
		};
	}

	/** @param {Area} area @param {{ withBuildings?: boolean }} [options] */
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
			npcCount: this.#npcCountForArea(area.id)
		};
		if (!withBuildings)
			return base;

		return {
			...base,
			buildings: area.buildingIds.flatMap((id) => {
				const building = this.buildings.get(id);
				return building ? [this.serializeBuilding(building, { withNpcs: true })] : [];
			}),
			npcsOutside: [...this.npcs.values()]
				.filter((npc) => npc.areaId === area.id && npc.status === 'outside')
				.map((npc) => this.serializeNpc(npc))
		};
	}

	/** @param {Building} building @param {{ withNpcs?: boolean }} [options] */
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
			npcCount: building.npcIds.filter((id) => this.npcs.get(id)?.buildingId === building.id).length
		};
		if (!withNpcs)
			return base;

		return {
			...base,
			npcs: building.npcIds.flatMap((id) => {
				const npc = this.npcs.get(id);
				return npc ? [this.serializeNpc(npc)] : [];
			})
		};
	}

	/** @param {Npc} npc */
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
			version: npc.version
		};
	}

	/** @param {string} areaId */
	#npcCountForArea(areaId) {
		let count = 0;
		for (const npc of this.npcs.values()) {
			if (npc.areaId === areaId)
				count += 1;
		}
		return count;
	}
}