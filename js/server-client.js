// Lets a page opened from a different host/port (e.g. a dev server, or a file:// copy)
// still reach the API, by pointing it at a specific host via ?apiHost= or a saved override.
const STORAGE_KEY = 'sheogoradApiHost';

function getConfiguredApiHost() {
	if (typeof location === 'undefined')
		return null;

	const fromQuery = new URLSearchParams(location.search).get('apiHost');
	if (fromQuery) {
		try {
			localStorage.setItem(STORAGE_KEY, fromQuery);
		} catch {
			// localStorage may be unavailable (e.g. privacy mode); the query param still works this load
		}
		return fromQuery;
	}

	try {
		return localStorage.getItem(STORAGE_KEY);
	} catch {
		return null;
	}
}

const CONFIGURED_API_HOST = getConfiguredApiHost();
const DEFAULT_API_BASE = CONFIGURED_API_HOST
	? CONFIGURED_API_HOST.replace(/\/$/, '')
	: typeof location !== 'undefined' && /^https?:$/.test(location.protocol)
		? location.origin
		: 'http://localhost:3001';
const LOCAL_API_FALLBACK = !CONFIGURED_API_HOST && typeof location !== 'undefined'
	&& ['localhost', '127.0.0.1'].includes(location.hostname)
	&& location.port !== '3001'
	? 'http://localhost:3001'
	: null;

export default class ServerClient {
	constructor(baseUrl = DEFAULT_API_BASE) {
		this.baseUrl = baseUrl.replace(/\/$/, '');
		this.fallbackBaseUrl = baseUrl === DEFAULT_API_BASE ? LOCAL_API_FALLBACK : null;
		this.areaVersions = new Map();
		this.versionedCache = new Map();
	}

	async request(path, options = {}) {
		const baseUrls = [this.baseUrl, this.fallbackBaseUrl].filter((baseUrl, index, all) => baseUrl && all.indexOf(baseUrl) === index);
		let lastError;
		for (const baseUrl of baseUrls) {
			try {
				const response = await fetch(`${baseUrl}${path}`, {
					cache: 'no-store',
					...options
				});

				if (!response.ok)
					throw new Error(`Request to ${path} failed: HTTP ${response.status}`);

				return await response.json();
			} catch (error) {
				lastError = error;
			}
		}

		throw lastError;
	}

	getWorld() {
		return this.request('/api/world');
	}

	async requestVersioned(path) {
		const cached = this.versionedCache.get(path);
		const url = new URL(`${this.baseUrl}${path}`);
		if (cached)
			url.searchParams.set('knownVersion', String(cached.version));

		const response = await this.request(`${url.pathname}${url.search}`);
		if (response?.unchanged === true) {
			if (cached)
				return cached.data;
			throw new Error(`Server returned unchanged data without a cached copy for ${path}`);
		}

		if (response && typeof response === 'object' && 'data' in response && 'version' in response) {
			this.versionedCache.set(path, { version: response.version, data: response.data });
			return response.data;
		}

		return response;
	}

	getRegions() {
		return this.request('/api/regions');
	}

	getRegion(regionId) {
		return this.requestVersioned(`/api/regions/${encodeURIComponent(regionId)}`);
	}

	getAreas() {
		return this.request('/api/areas');
	}

	getArea(areaId) {
		return this.requestVersioned(`/api/areas/${encodeURIComponent(areaId)}`);
	}

	getNpcs() {
		return this.request('/api/npcs');
	}

	getLore() {
		return this.request('/api/lore');
	}

	getLoreEntry(entryId) {
		return this.request(`/api/lore/${encodeURIComponent(entryId)}`);
	}

	async getAreaChanges(areaId, versions = this.areaVersions.get(areaId) ?? {}) {
		const changes = await this.request(`/api/areas/${encodeURIComponent(areaId)}/changes`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ versions })
		});
		const updatedVersions = { ...versions };

		for (const item of [...(changes.buildings ?? []), ...(changes.npcs ?? [])]) {
			if (item.id != null && item.version != null)
				updatedVersions[item.id] = item.version;
		}

		this.areaVersions.set(areaId, updatedVersions);
		return changes;
	}

	resetAreaVersions(areaId) {
		this.areaVersions.delete(areaId);
	}

	async downloadAll() {
		const [world, regionList, areaList, npcs, loreIndex] = await Promise.all([
			this.getWorld(),
			this.getRegions(),
			this.getAreas(),
			this.getNpcs(),
			this.getLore()
		]);
		const [regions, areas, lore] = await Promise.all([
			Promise.all(regionList.map(({ id }) => this.getRegion(id))),
			Promise.all(areaList.map(({ id }) => this.getArea(id))),
			Promise.all(loreIndex.map(({ id }) => this.getLoreEntry(id)))
		]);

		return {
			world,
			regions,
			areas,
			npcs,
			lore
		};
	}
}