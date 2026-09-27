import { slugify, titleCase } from '../lib/ids.js';

class Versioned {
	constructor() {
		this.version = 1;
	}

	touch() {
		this.version += 1;
	}
}

export class Region extends Versioned {
	/** @param {string} id @param {string} name */
	constructor(id, name) {
		super();
		this.id = id;
		this.name = name;
		/** @type {string[]} */
		this.areaIds = [];
	}
}

export class Area extends Versioned {
	/** @param {string} id @param {string} name @param {string} regionId @param {import('../data/load-world-data.js').CanonSettlement} settlement */
	constructor(id, name, regionId, settlement) {
		super();
		this.id = id;
		this.name = name;
		this.regionId = regionId;
		this.type = settlement.type ?? null;
		this.alignment = settlement.alignment ?? null;
		this.services = settlement.services ?? [];
		this.transport = settlement.transport ?? {};
		/** @type {string[]} */
		this.buildingIds = [];
	}
}

export class Building extends Versioned {
	/** @param {string} id @param {string} key @param {string} areaId @param {import('../data/load-world-data.js').CanonBuilding['instance']} instance @param {import('../data/load-world-data.js').CanonBuilding['content']} content */
	constructor(id, key, areaId, instance, content) {
		super();
		this.id = id;
		this.key = key;
		this.areaId = areaId;
		this.name = instance?.name ?? titleCase(key);
		this.condition = instance?.condition ?? null;
		this.modifier = instance?.modifier ?? null;
		this.items = content?.items?.pool ?? [];
		/** @type {string[]} */
		this.npcIds = [];
	}
}

export class Npc extends Versioned {
	/** @param {string} id @param {string} homeAreaId @param {string} homeBuildingId @param {boolean} isForced @param {string | undefined} icon */
	constructor(id, homeAreaId, homeBuildingId, isForced, icon) {
		super();
		this.id = id;
		this.name = titleCase(id);
		this.icon = icon ?? '👤';
		this.isForced = isForced;
		this.homeAreaId = homeAreaId;
		this.homeBuildingId = homeBuildingId;
		this.areaId = homeAreaId;
		/** @type {string | null} */
		this.buildingId = homeBuildingId;
		/** @type {'inside' | 'outside'} */
		this.status = 'inside';
		this.lastEvent = null;
	}
}

/**
 * @param {import('../data/load-world-data.js').CanonData} canon
 * @param {{ npcIcons?: Record<string, string> }} [icons]
 * @returns {{ regions: Map<string, Region>, areas: Map<string, Area>, buildings: Map<string, Building>, npcs: Map<string, Npc> }}
 */
export function buildWorld(canon, icons) {
	const regions = new Map();
	const areas = new Map();
	const buildings = new Map();
	const npcs = new Map();
	const npcIcons = icons?.npcIcons ?? {};

	for (const [regionName, settlements] of Object.entries(canon)) {
		const regionId = slugify(regionName);
		const region = new Region(regionId, regionName);
		regions.set(regionId, region);

		for (const settlement of settlements) {
			const areaId = slugify(settlement.name);
			const area = new Area(areaId, settlement.name, regionId, settlement);
			areas.set(areaId, area);
			region.areaIds.push(areaId);

			for (const [buildingKey, instances] of Object.entries(settlement.buildings ?? {})) {
				instances.forEach((entry, index) => {
					const buildingId = instances.length > 1 ? `${buildingKey}__${index}` : buildingKey;
					const building = new Building(buildingId, buildingKey, areaId, entry.instance, entry.content);
					buildings.set(buildingId, building);
					area.buildingIds.push(buildingId);

					const forcedIds = entry.content?.npcs?.forced ?? [];
					const poolIds = entry.content?.npcs?.pool ?? [];
					for (const npcId of forcedIds)
						registerNpc(npcs, npcId, areaId, buildingId, true, npcIcons, building);
					for (const npcId of poolIds)
						registerNpc(npcs, npcId, areaId, buildingId, false, npcIcons, building);
				});
			}
		}
	}

	return { regions, areas, buildings, npcs };
}

/** @param {Map<string, Npc>} npcs @param {string} npcId @param {string} areaId @param {string} buildingId @param {boolean} forced @param {Record<string, string>} npcIcons @param {Building} building */
function registerNpc(npcs, npcId, areaId, buildingId, forced, npcIcons, building) {
	const existing = npcs.get(npcId);
	if (existing) {
		if (forced && !existing.isForced)
			existing.isForced = true;
		return;
	}

	const npc = new Npc(npcId, areaId, buildingId, forced, npcIcons[npcId]);
	npcs.set(npcId, npc);
	building.npcIds.push(npcId);
}