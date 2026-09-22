// 🧙‍♀️ Code magic within
// Loads the game's static JSON data and normalizes it into a shape the
// server can query quickly (regions -> settlements -> buildings, plus an
// NPC roster derived from the "forced"/"pool" npc lists in each building).

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_DIR = path.resolve(__dirname, '..', '..', 'json');

async function loadJson(fileName) {
	const filePath = path.join(JSON_DIR, fileName);
	const raw = await readFile(filePath, 'utf-8');
	return JSON.parse(raw);
}

function registerNpc(roster, name, iconList, region, settlementName, buildingId, buildingName, role) {
	// first building a name is discovered in "wins" as its home base
	if (roster.has(name)) return;
	roster.set(name, {
		name,
		icon: iconList.npcIcons?.[name] || '❔',
		region,
		settlement: settlementName,
		buildingId,
		buildingName,
		role,
	});
}

export async function loadWorldData() {
	const [canonList, loreFile, iconList, buildingTypes] = await Promise.all([
		loadJson('canon list.json'),
		loadJson('lore.json'),
		loadJson('icon list.json'),
		loadJson('building types list.json'),
	]);

	const regions = [];
	const settlements = new Map();
	const npcRoster = new Map();

	for (const regionName of Object.keys(canonList)) {
		const settlementNames = [];

		for (const settlement of canonList[regionName]) {
			const buildings = [];

			for (const buildingId of Object.keys(settlement.buildings || {})) {
				for (const buildingInstance of settlement.buildings[buildingId]) {
					const forced = buildingInstance.content?.npcs?.forced || [];
					const pool = buildingInstance.content?.npcs?.pool || [];

					buildings.push({
						buildingId,
						name: buildingInstance.instance.name,
						condition: buildingInstance.instance.condition,
						modifier: buildingInstance.instance.modifier,
						items: buildingInstance.content?.items?.pool || [],
						npcNames: [...forced, ...pool],
					});

					for (const npcName of forced) {
						registerNpc(npcRoster, npcName, iconList, regionName, settlement.name, buildingId, buildingInstance.instance.name, 'forced');
					}
					for (const npcName of pool) {
						registerNpc(npcRoster, npcName, iconList, regionName, settlement.name, buildingId, buildingInstance.instance.name, 'pool');
					}
				}
			}

			settlements.set(settlement.name, {
				region: regionName,
				name: settlement.name,
				type: settlement.type,
				alignment: settlement.alignment,
				services: settlement.services || [],
				transport: settlement.transport || {},
				buildings,
			});
			settlementNames.push(settlement.name);
		}

		regions.push({ name: regionName, settlements: settlementNames });
	}

	return {
		regions,
		settlements,
		npcRoster,
		lore: loreFile.lore || [],
		iconList,
		buildingTypes: buildingTypes.buildingTypes || {},
	};
}
