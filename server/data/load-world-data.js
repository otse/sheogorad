import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_ROOT = __dirname;

/**
 * @typedef {{ instance?: { name?: string, condition?: string, modifier?: string }, content?: { npcs?: { forced?: string[], pool?: string[] }, items?: { forced?: string[], pool?: string[] } } }} CanonBuilding
 * @typedef {{ name: string, type?: string, alignment?: string, services?: string[], transport?: Record<string, string[]>, buildings?: Record<string, CanonBuilding[]> }} CanonSettlement
 * @typedef {Record<string, CanonSettlement[]>} CanonData
 * @typedef {{ name: string, type?: string, summary?: string, [key: string]: unknown }} LoreEntry
 * @typedef {{ canon: CanonData, buildingTypes: Record<string, unknown>, icons: { npcIcons: Record<string, string> }, lore: LoreEntry[] }} WorldData
 */

/** @param {string} fileName @returns {Promise<unknown>} */
async function readJson(fileName) {
	const raw = await readFile(path.join(JSON_ROOT, fileName), 'utf8');
	return JSON.parse(raw);
}

/** @returns {Promise<WorldData>} */
export async function loadWorldData() {
	const [canon, buildingTypes, icons, loreFile] = await Promise.all([
		readJson('canon list.json'),
		readJson('building types list.json'),
		readJson('icon list.json'),
		readJson('lore.json')
	]);

	return {
		canon: /** @type {CanonData} */ (canon),
		buildingTypes: /** @type {Record<string, unknown>} */ (buildingTypes),
		icons: /** @type {{ npcIcons: Record<string, string> }} */ (icons),
		lore: /** @type {{ lore?: LoreEntry[] }} */ (loreFile).lore ?? []
	};
}