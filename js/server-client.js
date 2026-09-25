const DEFAULT_API_BASE = typeof location !== 'undefined' && location.port === '3001'
	? location.origin
	: 'http://localhost:3001';

export default class ServerClient {
	constructor(baseUrl = DEFAULT_API_BASE) {
		this.baseUrl = baseUrl.replace(/\/$/, '');
		this.areaVersions = new Map();
	}

	async request(path, options = {}) {
		const response = await fetch(`${this.baseUrl}${path}`, {
			cache: 'no-store',
			...options
		});

		if (!response.ok)
			throw new Error(`Request to ${path} failed: HTTP ${response.status}`);

		return response.json();
	}

	getWorld() {
		return this.request('/api/world');
	}

	getRegions() {
		return this.request('/api/regions');
	}

	getRegion(regionId) {
		return this.request(`/api/regions/${encodeURIComponent(regionId)}`);
	}

	getAreas() {
		return this.request('/api/areas');
	}

	getArea(areaId) {
		return this.request(`/api/areas/${encodeURIComponent(areaId)}`);
	}

	getNpcs() {
		return this.request('/api/npcs');
	}

	getLore() {
		return this.request('/api/lore');
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

	downloadAll() {
		return Promise.all([
			this.getWorld(),
			this.getRegions(),
			this.getAreas(),
			this.getNpcs(),
			this.getLore()
		]).then(([world, regions, areas, npcs, lore]) => ({
			world,
			regions,
			areas,
			npcs,
			lore
		}));
	}
}