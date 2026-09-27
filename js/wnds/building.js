// 🧙‍♀️ Code magic within

import Npc from "./npc.js";
import Sheogorad from "../sheogorad.js";

import Wnd from "../wnd.js";
import Wndd from "../wndd.js";

export default class BuildingViewer extends Wndd {
    /** @type {BuildingViewer | null} */
    static instance = null;

    data = {};
    /**
    * @param {{ settlement?: any, building_id?: string, buildingObject?: any }} [data]
     */
    constructor(data = {}) {
        super();
        this.data = { ...data };
    }
    _create() {
        const template = /** @type {HTMLTemplateElement} */
            (document.getElementById('building-viewer-wnd-template'));
        const clone = /** @type {DocumentFragment} */
            (template.content.cloneNode(true));

        const wnd = new Wnd(
            `Interior`,
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
     * This lets one BuildingViewer instance/window be reused to display different buildings.
    * @param {{ settlement?: any, building_id?: string, buildingObject?: any }} data
     * @param {{ merge?: boolean }} [options]
     */
    setData(data, { merge = false } = {}) {
        this.data = merge ? { ...this.data, ...data } : { ...data };
        this.make();
        // this.wnd?.setWndTitle(`${this.data.building_id || 'X'}`);
    }
    _render() {
        if (!this.wnd)
            return;

        const firstDiv = /** @type {HTMLElement} */ this.wnd.wndContent.querySelector('div.rnl-building-wnd-div');
        if(!firstDiv)
            return;
        const target = firstDiv;

        firstDiv.innerHTML = '';

        const serverBuilding = this.findServerBuilding(this.data.building_id);
        const building = serverBuilding || this.data.buildingObject;
        const instance = building?.instance || {};
        const content = building?.content || {};
        const heading = document.createElement('span');
        heading.textContent = instance.name || this.data.building_id || 'Select a building';
        target.appendChild(heading);

        if (!building) {
            const emptyState = document.createElement('span');
            emptyState.textContent = 'Choose a building to view its details.';
            target.appendChild(emptyState);
            return;
        }

        const settlementName = this.data.settlement?.name;
        if (settlementName)
            this.addDetail(target, 'Settlement', settlementName);
        if (instance.condition)
            this.addDetail(target, 'Condition', instance.condition);
        if (instance.modifier)
            this.addDetail(target, 'Description', instance.modifier);

        const npcs = content.npcs || {};
        this.addList(target, 'Residents', [...(npcs.forced || []), ...(npcs.pool || [])], true);
        const items = content.items || {};
        this.addList(target, 'Items', [...(items.forced || []), ...(items.pool || [])]);
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

    addDetail(target, label, value) {
        const row = document.createElement('span');
        const title = document.createElement('strong');
        title.textContent = `${label}: `;
        row.append(title, document.createTextNode(String(value)));
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