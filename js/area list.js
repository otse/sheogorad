// 🧙‍♀️ Code magic within

import Npc from "./npc.js";
import Sheogorad from "./sheogorad.js";
import Tree from "./tree.js";
import Wnd from "./wnd.js";

const swathOfText = `
	<div class="rn-bordered">
		<div class="explanator">Stepped:</div>
		<div class="rn-divider"></div>
		<div id="genericList" class="rn-scroll" style="">
		</div>
	</div>
`;

export default class AreaList {
	/** @type {Wnd | null} */
	wnd = null;
	constructor() {
	}
	ensureWnd() {
		if (!this.wnd || this.wnd.isDestroyed) {
			this.wnd = new Wnd(
				`Areas`,
				`${swathOfText}`,
				{ width: 400, height: 200 });
			this.wnd.moveTo(-400, 100);
			this.populate();
		}
	}
	close() {
		if (this.wnd) {
			this.wnd.close();
		}
	}
	populate() {
		if (!this.wnd)
			return;
		const target = /** @type {HTMLElement} */ (this.wnd.wndContent.querySelector('#genericList'));

		for (const region in Sheogorad.canonList) {
			const tree = new Tree([], {
				name: Sheogorad.formatRegionName(region),
				className: 'tree',
				labelClassName: Sheogorad.regionClassName(region)
			});
			for (const settlement of Sheogorad.canonList[region]) {
				// tree.addItem(settlement.name);
				const tree2 = new Tree([], {
					name: settlement.name,
					className: 'tree'
				});
				const building_ids = settlement.buildings;

				for (const building_id in building_ids) {
					//console.warn(' building_ids ', building_id);

					for (const buildingObject of building_ids[building_id]) {
						// console.warn(' building ', buildingObject.instance.name);
						const tree3 = new Tree([], {
							name: buildingObject.instance.name,
							labelClassName: 'tree-building'
						});


						tree2.addItem(tree3);
						const allNpcs = [
							...(buildingObject.content.npcs.forced || []),
							...(buildingObject.content.npcs.pool || [])
						];

						for (const npcName of allNpcs) {
							const npc = new Npc(npcName);
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
				}
				tree.addItem(tree2);
			};
			target.appendChild(tree.getElement());

			const divider = document.createElement('div');
			divider.className = 'rn-divider';
			// target.appendChild(divider);
		}
	}

}