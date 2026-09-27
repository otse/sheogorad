// 🧙‍♀️ Code magic within

import Sheogorad from "../sheogorad.js";

import Wnd from "../wnd.js";
import CellViewer from "./cell.js";
import ExteriorViewer from "./exterior.js";

// An Interior Cell: a building housing its own npcs/items.
export default class BuildingViewer extends CellViewer {
	/** @type {BuildingViewer | null} */
	static instance = null;

	/**
	* @param {{ settlement?: any, building_id?: string, building_name?: string, buildingObject?: any }} [data]
	 */
	constructor(data = {}) {
		super(data);
	}
	_create() {
		const template = /** @type {HTMLTemplateElement} */
			(document.getElementById('cell-viewer-wnd-template'));
		const clone = /** @type {DocumentFragment} */
			(template.content.cloneNode(true));
		const wnd = new Wnd(
			`Interior`,
			clone,
			{ width: 400, height: 250, minWidth: 380, minHeight: 250 });
		wnd.moveTo(0, 100);
		return wnd;
	}

	/**
	 * Feed new data into an existing (or not-yet-created) window and re-render it.
	 * This lets one BuildingViewer instance/window be reused to display different buildings.
	* @param {{ settlement?: any, building_id?: string, building_name?: string, buildingObject?: any }} data
	 * @param {{ merge?: boolean }} [options]
	 */
	setData(data, { merge = false } = {}) {
		this.data = merge ? { ...this.data, ...data } : { ...data };
		this.make();
		this.wnd?.setWndTitle(`${this.data.building_name || this.data.building_id || 'Cell'}`);
	}
	refresh() {
		const areaId = this.data.settlement?.id;
		const area = Sheogorad.serverData?.areas.find((entry) => entry.id === areaId);
		const building = area?.buildings?.find((entry) => entry.id === this.data.building_id);
		if (area && building) {
			this.data = { ...this.data, settlement: area, buildingObject: building, building_name: building.name };
			this.wnd?.setWndTitle(building.name);
		}
		super.refresh();
	}
	_render() {
		if (!this.wnd)
			return;

		const target = /** @type {HTMLElement} */
			(this.wnd.wndContent.querySelector('.rnl-cell-wnd-div'));
		if (!target)
			return;

		target.innerHTML = '';

		if (this.data.settlement) {
			const goOutsideLink = document.createElement('rn-link');
			goOutsideLink.className = 'rnl-go-outside-link';
			goOutsideLink.textContent = '< Go outside?';
			goOutsideLink.addEventListener('click', () => this.goOutside());
			target.appendChild(goOutsideLink);
		}

		const serverBuilding = this.findServerBuilding(this.data.building_id);

		const building = serverBuilding || this.data.buildingObject;
		const instance = building?.instance || building || {};
		const content = building?.content || building || {};
	
		if (!building) {
			target.appendChild(document.createTextNode('Choose a building to view its details.'));
			return;
		}

		const settlementName = this.data.settlement?.name;
		//if (settlementName)
		//	this.addDetail(target, 'Settlement', settlementName);
		//if (instance.condition)
		//	this.addDetail(target, 'Condition', instance.condition);
		if (instance.modifier)
			this.addDetail(target, 'Description', instance.modifier);

		const npcs = content.npcs || {};
		const residents = Array.isArray(building?.npcs)
			? building.npcs
			: [...(npcs.forced || []), ...(npcs.pool || [])];
		this.addList(target, 'Residents', residents, true);
		const items = content.items || {};
		this.addList(target, 'Items', building?.items || [...(items.forced || []), ...(items.pool || [])]);
	}

	// Shows this building's area as an exterior wnd, docked in the shared area dock.
	goOutside() {
		const settlement = this.data.settlement;
		const areaList = Sheogorad.areaList;
		if (!settlement || !areaList)
			return;

		areaList.exteriorViewer ??= new ExteriorViewer();
		areaList.exteriorViewer.setData({ settlement }, { merge: true });
		areaList.dockCellViewer(areaList.exteriorViewer);
	}

	findServerBuilding(buildingId) {
		if (!buildingId || !Sheogorad.serverData?.areas)
			return null;

		const areas = Array.isArray(Sheogorad.serverData.areas)
			? Sheogorad.serverData.areas
			: Object.values(Sheogorad.serverData.areas);

		for (const area of areas) {
			const buildings = area?.buildings;
			if (!buildings)
				continue;
			if (!Array.isArray(buildings) && buildings[buildingId])
				return Array.isArray(buildings[buildingId]) ? buildings[buildingId][0] : buildings[buildingId];

			const entries = Array.isArray(buildings)
				? buildings.map((building) => [building.id || building.building_id, building])
				: Object.entries(buildings);
			for (const [id, entry] of entries) {
				const matches = id === buildingId || entry?.id === buildingId || entry?.building_id === buildingId;
				if (matches)
					return Array.isArray(entry) ? entry[0] : entry;
			}
		}
		return null;
	}
}