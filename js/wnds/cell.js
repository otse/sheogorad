// 🧙‍♀️ Code magic within

import Npc from "./npc.js";
import Sheogorad from "../sheogorad.js";

import Wnd from "../wnd.js";
import Wndd from "../wndd.js";

/**
 * Generic viewer for a Cell: anything that can contain Npcs, Objects,
 * Monsters, etc. (an interior, an exterior area, ...).
 * Meant to be subclassed (e.g. Interior/Exterior cell viewers) which can
 * override `_render()` and the `add*` helpers to customize presentation.
 */
export default class CellViewer extends Wndd {
	data = {};

	/**
	 * @param {object} [data]
	 */
	constructor(data = {}) {
		super();
		this.data = { ...data };
	}

	_create() {
		const template = /** @type {HTMLTemplateElement} */
			(document.getElementById('cell-viewer-wnd-template'));
		const clone = /** @type {DocumentFragment} */
			(template.content.cloneNode(true));
		const wnd = new Wnd(
			`${this.data.name || 'Cell'}`,
			clone,
			{ width: 400, height: 250, minWidth: 380, minHeight: 250 });
		wnd.moveTo(0, 100);
		return wnd;
	}

	render() {
		this._render();
	}

	/**
	 * Feed new data into an existing (or not-yet-created) window and re-render it.
	 * This lets one CellViewer instance/window be reused to display different cells.
	 * @param {object} data
	 * @param {{ merge?: boolean }} [options]
	 */
	setData(data, { merge = false } = {}) {
		this.data = merge ? { ...this.data, ...data } : { ...data };
		this.make();
		this.wnd?.setWndTitle(`${this.data.name || 'Cell'}`);
	}

	_render() {
		if (!this.wnd)
			return;

		const target = /** @type {HTMLElement} */
			(this.wnd.wndContent.querySelector('.rnl-cell-wnd-div'));
		if (!target)
			return;

		target.innerHTML = '';

		const content = this.data.content || {};

		if (!this.data.name && !Object.keys(content).length) {
			target.appendChild(document.createTextNode('Choose a cell to view its details.'));
			return;
		}

		if (this.data.description)
			this.addDetail(target, 'Description', this.data.description);

		const npcs = content.npcs || {};
		this.addList(target, 'Npcs', [...(npcs.forced || []), ...(npcs.pool || [])], true);

		const items = content.items || {};
		this.addList(target, 'Objects', [...(items.forced || []), ...(items.pool || [])]);

		const monsters = content.monsters || {};
		this.addList(target, 'Monsters', [...(monsters.forced || []), ...(monsters.pool || [])]);
	}

	addDetail(target, label, value) {
		const row = document.createElement('span');
		const title = document.createElement('strong');
		title.textContent = `${label}: `;
		row.append(/*/title*/document.createTextNode(String(value)));
		target.appendChild(row);
	}

	addList(target, label, values, clickable = false) {
		if (!values.length)
			return;

		const heading = document.createElement('span');
		heading.textContent = label;
		target.appendChild(heading);

		const list = document.createElement('ul');
		for (const value of values) {
			const item = document.createElement('li');
			const icon = clickable ? Sheogorad.iconList.npcIcons[value] || '' : '';
			item.textContent = `${icon}${icon ? ' ' : ''}${Sheogorad.formatNpcName(value)}`;
			if (clickable) {
				item.className = 'tree-building';
				item.tabIndex = 0;
				item.addEventListener('click', () => {
					const npc = new Npc(value, { name: Sheogorad.formatNpcName(value) });
					Sheogorad.npcs.push(npc);
					npc.makeWnd();
				});
			}
			list.appendChild(item);
		}
		target.appendChild(list);
	}
}
