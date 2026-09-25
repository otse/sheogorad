// 🧙‍♀️ Code magic within

import Npc from "./npc.js";

import Sheogorad from "../sheogorad.js";
import BuildingViewer from "./building.js";

import Tree from "../tree.js";
import Wnd from "../wnd.js";
import Wndd from "../wndd.js";

export default class RegionViewer extends Wndd {
	/** @type {BuildingViewer | null} */
	dockedBuildingViewer = null;

	_create() {
		const template = /** @type {HTMLTemplateElement} */
			(document.getElementById('area-list-wnd-template'));
			
		const clone = /** @type {DocumentFragment} */
			(template.content.cloneNode(true));

		const wnd = new Wnd(
			`Region Map`,
			clone,
			{ width: 400, height: 250, minWidth: 380, minHeight: 250 });
		wnd.moveTo(-400, 100);
		return wnd;
	}
	render() {
		this.populate();
		if (!this.wnd)
			return;

		const dockingElement = /** @type {HTMLElement} */
			(this.wnd.wndContent.querySelector('.rnl-region-wnd-docking-zone'));

		Wnd.defineDockZone(dockingElement);

		this.dockedBuildingViewer = new BuildingViewer();
		this.dockedBuildingViewer.make();

		if (this.wnd && this.dockedBuildingViewer.wnd) {
			this.dockedBuildingViewer.wnd.hardDock(dockingElement);
		}
	}
	populate() {
		if (!this.wnd)
			return;
		const that = this;

		const target = /** @type {HTMLElement} */
			(this.wnd.wndContent.querySelector('.rnl-region-wnd-list'));
		target.innerHTML = '';

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
					className: 'tree',
					//onClick: () => {
					//	that.dockedBuildingViewer?.setData({ settlement });
					//}
				});
				const building_ids = settlement.buildings;

				for (const building_id in building_ids) {
					//console.warn(' building_ids ', building_id);

					for (const buildingObject of building_ids[building_id]) {
						// console.warn(' building ', buildingObject.instance.name);
						const tree3 = new Tree([], {
							name: buildingObject.instance.name,
							labelClassName: 'tree-building',
							onClick: () => {
								console.warn('Building clicked:', buildingObject.instance.name);

								that.dockedBuildingViewer?.setData({ settlement, building_id, buildingObject }, { merge: true });
							}
						});

						tree2.addItem(tree3);
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