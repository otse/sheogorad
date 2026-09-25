// Turns the static canon JSON into the runtime world: regions, areas
// (settlements), buildings and npcs. Every entity carries a `version` number
// that only ever increases, so clients can cheaply ask "did this change?"
// by comparing a previously-seen version against the current one.

import { slugify, titleCase } from './ids.js';

class Versioned {
	constructor() {
		this.version = 1;
	}

	touch() {
		this.version += 1;
	}
}

export class Region extends Versioned {
	constructor(id, name) {
		super();
		this.id = id;
		this.name = name;
		this.areaIds = [];
	}
}

export class Area extends Versioned {
	constructor(id, name, regionId, settlement) {
		super();
		this.id = id;
		this.name = name;
		this.regionId = regionId;
		this.type = settlement.type ?? null;
		this.alignment = settlement.alignment ?? null;
		this.services = settlement.services ?? [];
		this.transport = settlement.transport ?? {};
		this.buildingIds = [];
	}
}

export class Building extends Versioned {
	constructor(id, key, areaId, instance, content) {
		super();
		this.id = id;
		this.key = key;
		this.areaId = areaId;
		this.name = instance?.name ?? titleCase(key);
		this.condition = instance?.condition ?? null;
		this.modifier = instance?.modifier ?? null;
		this.items = content?.items?.pool ?? [];
		this.npcIds = [];
	}
}

export class Npc extends Versioned {
	constructor(id, homeAreaId, homeBuildingId, isForced, icon) {
		super();
		this.id = id;
		this.name = titleCase(id);
		this.icon = icon ?? '👤';
		this.isForced = isForced;
		this.homeAreaId = homeAreaId;
		this.homeBuildingId = homeBuildingId;
		this.areaId = homeAreaId;
		this.buildingId = homeBuildingId;
		this.status = 'inside';
		this.lastEvent = null;
	}
}

// Builds the full runtime world graph from the parsed canon JSON.
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

			const buildingGroups = Object.entries(settlement.buildings ?? {});
			for (const [buildingKey, instances] of buildingGroups) {
				instances.forEach((entry, index) => {
					const buildingId = instances.length > 1 ? `${buildingKey}__${index}` : buildingKey;
					const building = new Building(buildingId, buildingKey, areaId, entry.instance, entry.content);
					buildings.set(buildingId, building);
					area.buildingIds.push(buildingId);

					const forcedIds = entry.content?.npcs?.forced ?? [];
					const poolIds = entry.content?.npcs?.pool ?? [];

					for (const npcId of forcedIds) {
						registerNpc(npcs, npcId, areaId, buildingId, true, npcIcons, building);
					}
					for (const npcId of poolIds) {
						registerNpc(npcs, npcId, areaId, buildingId, false, npcIcons, building);
					}
				});
			}
		}
	}

	return { regions, areas, buildings, npcs };
}

// A named npc keeps whichever building it was first seen in as its home.
// `forced` entries always win over `pool` entries seen later.
function registerNpc(npcs, npcId, areaId, buildingId, forced, npcIcons, building) {
	const existing = npcs.get(npcId);
	if (existing) {
		if (forced && !existing.isForced) {
			existing.isForced = true;
		}
		return;
	}

	const npc = new Npc(npcId, areaId, buildingId, forced, npcIcons[npcId]);
	npcs.set(npcId, npc);
	building.npcIds.push(npcId);
}
