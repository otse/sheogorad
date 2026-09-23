// 🧙‍♀️ Code magic within

import Npc from "./npc.js";
import Sheogorad from "../sheogorad.js";
import Tree from "../tree.js";
import Wnd from "../wnd.js";
import Wndd from "../wndd.js";

const swathOfText = `
    <div class="rn-bordered">
        <div class="explanator">Stepped:</div>
        <div class="rn-divider"></div>
        <div id="genericList" class="rn-scroll" style="">
        </div>
    </div>
`;

export default class AreaViewer extends Wndd {
    /** @type {AreaViewer | null} */
    static generalInstance = null;

    data = {};
    /**
     * @param {{ settlement?: any, building_id?: string }} [data]
     */
    constructor(data = {}) {
        super();
        this.data = { ...data };
    }
    _create() {
        const template = /** @type {HTMLTemplateElement} */ (document.getElementById('area-viewer-wnd-template'));
        const clone = /** @type {DocumentFragment} */ (template.content.cloneNode(true));

        const wnd = new Wnd(
            `Area`,
            clone,
            { width: 400, height: 250, minWidth: 380, minHeight: 250 });
        wnd.moveTo(-400, 100);
        return wnd;
    }
    render() {
        this.fillWithData();
    }
    /**
     * Feed new data into an existing (or not-yet-created) window and re-render it.
     * This lets one AreaViewer instance/window be reused to display different areas.
     * @param {{ settlement?: any, building_id?: string }} data
     * @param {{ merge?: boolean }} [options]
     */
    setData(data, { merge = false } = {}) {
        this.data = merge ? { ...this.data, ...data } : { ...data };
        this.make();
    }
    fillWithData() {
        if (!this.wnd)
            return;
        const target = /** @type {HTMLElement} */ (this.wnd.wndContent.querySelector('#genericList'));
        target.innerHTML = '';

        if (!this.data.settlement || !this.data.building_id)
            return;

        const building_ids = this.data.settlement.buildings;

        const tree = new Tree([], {
            name: 'Stuff',
            className: 'tree',
        });

        //console.warn(' building_ids ', building_id);

        for (const buildingObject of building_ids[this.data.building_id]) {
            // console.warn(' building ', buildingObject.instance.name);
            const tree3 = new Tree([], {
                name: buildingObject.instance.name,
                labelClassName: 'tree-building'
            });


            tree.addItem(tree3);
            const allNpcs = [
                ...(buildingObject.content.npcs.forced || []),
                ...(buildingObject.content.npcs.pool || [])
            ];

            for (const npcName of allNpcs) {
                const npc = new Npc(npcName, {
                    name: Sheogorad.formatNpcName(npcName)
                });
                Sheogorad.npcs.push(npc);
                const icon = Sheogorad.iconList.npcIcons[npcName] || '';
                tree3.addItem({
                    text: `${icon} ${Sheogorad.formatNpcName(npcName)}`,
                    onClick: () => {
                        npc.makeWnd();
                    }
                });
            }
        };

        target.appendChild(tree.getElement());
    }


}