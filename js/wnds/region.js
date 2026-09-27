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
			`Regions`,
			clone,
			{
				width: 580,
				height: 250, 
				minWidth: 380,
				minHeight: 250,
				maxWidth: 800,
				maxHeight: 600,
				emoji: '🗺️',
				titleGradient: 'linear-gradient(to bottom, rgb(28, 42, 69), rgb(36 53 62))' });
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
				name: `${Sheogorad.formatRegionName(region)}`,
				className: 'tree-view',
				labelClassName: Sheogorad.regionClassName(region)
			});
			for (const settlement of Sheogorad.canonList[region]) {
				// tree.addItem(settlement.name);
				const tree2 = new Tree([], {
					name: /*A:*/`${settlement.name}`,
					className: 'tree-view',
					//onClick: () => {
					//	that.dockedBuildingViewer?.setData({ settlement });
					//}
				});
				const building_ids = settlement.buildings;

				tree2.addItem({
					text: 'Area itself',
					onClick: () => {
						console.log('If Fargoth left his house he would be in the Area Itself.');
					}
				});

				for (const building_id in building_ids) {
					//console.warn(' building_ids ', building_id);

					for (const buildingObject of building_ids[building_id]) {
						tree2.addItem({
							text: /*I:*/`${buildingObject.instance.name}`,
							//labelClassName: 'tree-building',
							onClick: () => {
								console.warn('Building clicked:', buildingObject.instance.name);

								that.dockedBuildingViewer?.setData({ settlement, building_id, buildingObject }, { merge: true });
							}
						});
					}
				}
				tree.addItem(tree2);
			};
			target.appendChild(tree.getElement());

			const divider = document.createElement('div');
			divider.className = 'rn-divider';
			target.appendChild(divider);
		}
	}

}