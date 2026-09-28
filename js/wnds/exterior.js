// 🧙‍♀️ Code magic within

import Wnd from "../wnd.js";
import CellViewer from "./cell.js";
import Sheogorad from "../sheogorad.js";

// An Exterior Cell: a settlement/area itself, outside of any building.
export default class ExteriorViewer extends CellViewer {
	/** @type {ExteriorViewer | null} */
	static instance = null;

	/**
	* @param {{ settlement?: any }} [data]
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
			`Exterior`,
			clone,
			{ width: 400, height: 250, minWidth: 380, minHeight: 250 });
			
		wnd.moveTo(0, 100);

		return wnd;
	}

	/**
	 * Feed new data into an existing (or not-yet-created) window and re-render it.
	 * This lets one ExteriorViewer instance/window be reused to display different areas.
	* @param {{ settlement?: any }} data
	 * @param {{ merge?: boolean }} [options]
	 */
	setData(data, { merge = false } = {}) {
		this.data = merge ? { ...this.data, ...data } : { ...data };
		this.make();
		this.wnd?.setWndTitle(`${this.data.settlement?.name || 'Cell'}`);
	}
	hasNewData() {
		const areaId = this.data.settlement?.id;
		const area = Sheogorad.serverData?.areas.find((entry) => entry.id === areaId);
		return JSON.stringify(area) !== JSON.stringify(this.data.settlement);
	}
	async refresh() {
		const areaId = this.data.settlement?.id;
		const area = Sheogorad.serverData?.areas.find((entry) => entry.id === areaId);
		if (area) {
			this.data = { ...this.data, settlement: area };
			this.wnd?.setWndTitle(area.name);
		}
		await super.refresh();
	}
	_render() {
		if (!this.wnd)
			return;

		const target = /** @type {HTMLElement} */
			(this.wnd.wndContent.querySelector('.rnl-cell-wnd-div'));
		if (!target)
			return;

		target.innerHTML = '';

		const settlement = this.data.settlement;

		if (!settlement) {
			target.appendChild(document.createTextNode('Choose an area to view its details.'));
			return;
		}

		if (settlement.type)
			this.addDetail(target, 'Type', settlement.type);
		if (settlement.alignment)
			this.addDetail(target, 'Alignment', settlement.alignment);
		if (settlement.services?.length)
			this.addDetail(target, 'Services', settlement.services.join(', '));

		const content = settlement.content || settlement;
		const npcs = content.npcs || {};
		this.addList(target, 'Residents', settlement.npcsOutside || [...(npcs.forced || []), ...(npcs.pool || [])], true);
		const items = content.items || {};
		this.addList(target, 'Items', [...(items.forced || []), ...(items.pool || [])]);
	}
}
