// 🧙‍♀️ Code magic within

import Npc from "./npc.js";

import Sheogorad from "../sheogorad.js";
import BuildingViewer from "./building.js";
import ExteriorViewer from "./exterior.js";

import Tree from "../tree.js";
import Wnd from "../wnd.js";
import Wndd from "../wndd.js";

export default class RegionViewer extends Wndd {
	/** @type {BuildingViewer | null} */
	dockedBuildingViewer = null;
	/** @type {ExteriorViewer | null} */
	exteriorViewer = null;
	/** @type {HTMLElement | null} */
	dockingElement = null;

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

		this.dockingElement = /** @type {HTMLElement} */
			(this.wnd.wndContent.querySelector('.rnl-region-wnd-docking-zone'));

		Wnd.defineDockZone(this.dockingElement);

		this.dockedBuildingViewer = new BuildingViewer();
		this.dockedBuildingViewer.make();

		this.dockCellViewer(this.dockedBuildingViewer);
	}

	/**
	 * Docks the given cell viewer into the shared area dock, silently closing
	 * whichever one (building or exterior) currently occupies it.
	 * @param {BuildingViewer | ExteriorViewer} viewer
	 */
	dockCellViewer(viewer) {
		if (!this.dockingElement || !viewer.wnd)
			return;

		for (const other of [this.dockedBuildingViewer, this.exteriorViewer]) {
			if (other && other !== viewer && other.wnd && !other.wnd.isDestroyed)
				other.close();
		}

		if (!viewer.wnd.hardDockState)
			viewer.wnd.hardDock(this.dockingElement);
	}
	populate() {
		if (!this.wnd)
			return;
		const that = this;

		const target = /** @type {HTMLElement} */
			(this.wnd.wndContent.querySelector('.rnl-region-wnd-list'));
		target.innerHTML = '';

		const tamriel = new Tree([], {
			name: 'Tamriel'
		});
		const morrowind = new Tree([], {
			name: 'Morrowind'
		});
		const vvardenfell = new Tree([], {
			name: 'Vvardenfell'
		});
		const mainland = new Tree([], {
			name: 'Mainland'
		});
		const esroniet = new Tree([], {
			name: 'Esroniet'
		});

		for (const region in Sheogorad.canonList) {
			const tree = new Tree([], {
				name: `${Sheogorad.formatRegionName(region)}`
			});

			// Regions aren't cells, so this makes little sense
			/*tree.addItem({
				text: 'Region itself',
				onClick: () => {
					console.log(`Wandering the wilds of ${Sheogorad.formatRegionName(region)} itself.`);
				}
			});*/

			for (const settlement of Sheogorad.canonList[region]) {
				// tree.addItem(settlement.name);
				const tree2 = new Tree([], {
					name: /*A:*/`${settlement.name}`,
					//onClick: () => {
					//	that.dockedBuildingViewer?.setData({ settlement });
					//}
				});
				const building_ids = settlement.buildings;

				tree2.addItem({
					text: 'Area itself',
					onClick: () => {
						if (!that.exteriorViewer)
							that.exteriorViewer = new ExteriorViewer();
						that.exteriorViewer.setData({ settlement }, { merge: true });
						that.dockCellViewer(that.exteriorViewer);
					}
				});

				for (const building_id in building_ids) {
					//console.warn(' building_ids ', building_id);

					for (const buildingObject of building_ids[building_id]) {
						tree2.addItem({
							text: /*I:*/`${buildingObject.instance.name}`,
							//labelClassName: 'tree-building',
							onClick: () => {
								that.dockedBuildingViewer?.setData({ settlement, building_id, building_name: buildingObject.instance.name, buildingObject }, { merge: true });
								if (that.dockedBuildingViewer)
									that.dockCellViewer(that.dockedBuildingViewer);
							}
						});
					}
				}
				tree.addItem(tree2);
			};
			vvardenfell.addItem(tree);
		}
		morrowind.addItem(vvardenfell);
		morrowind.addItem(mainland);
		tamriel.addItem(morrowind);
		tamriel.addItem(esroniet);
		target.appendChild(tamriel.getElement());

		const divider = document.createElement('div');
		divider.className = 'rn-divider';
		target.appendChild(divider);
	}

}