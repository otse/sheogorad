// Loads the static world data (regions/settlements/buildings/npcs/lore) from
// the json/ folder. This is the only place that touches disk; everything
// downstream works with plain parsed JSON.

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_ROOT = path.resolve(__dirname, '..', '..', 'json');

async function readJson(fileName) {
	const raw = await readFile(path.join(JSON_ROOT, fileName), 'utf8');
	return JSON.parse(raw);
}

export async function loadWorldData() {
	const [canon, buildingTypes, icons, lore] = await Promise.all([
		readJson('canon list.json'),
		readJson('building types list.json'),
		readJson('icon list.json'),
		readJson('lore.json'),
	]);

	return { canon, buildingTypes, icons, lore: lore.lore ?? [] };
}
