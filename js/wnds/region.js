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

	/** @type {Tree | null} */
	tamrielTree = null;

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
		wnd.moveTo(-400, 0);
		return wnd;
	}
	render() {
		this.populate();
		if (!this.wnd)
			return;

		this.dockingElement = /** @type {HTMLElement} */
			(this.wnd.wndContent.querySelector('.rnl-region-wnd-docking-zone'));

		Wnd.defineDockZone(this.dockingElement, { internal: true });

		this.dockedBuildingViewer = new BuildingViewer();
		this.dockedBuildingViewer.make();

		this.dockCellViewer(this.dockedBuildingViewer);

		// Only now is dockingElement set, so the default reveal can actually dock a viewer.
		if (Sheogorad.serverData?.regions?.length)
			this.revealPath('Morrowind', 'Vvardenfell', 'Bitter Coast', 'Seyda Neen', 'Census and Excise Office');
	}
	async refresh() { 
		// The region and area hierarchy is stable and should not be rebuilt.
	}
	hasNewData() {
		return true;
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

		const divider = document.createElement('div');
		divider.className = 'rn-divider';

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

		const areasById = new Map((Sheogorad.serverData?.areas ?? []).map((area) => [area.id, area]));
		for (const region of Sheogorad.serverData?.regions ?? []) {
			const tree = new Tree([], {
				name: `${Sheogorad.formatRegionName(region.name)}`
			});

			// Regions aren't cells, so this makes little sense
			/*tree.addItem({
				text: 'Region itself',
				onClick: () => {
					console.log(`Wandering the wilds of ${Sheogorad.formatRegionName(region)} itself.`);
				}
			});*/

			for (const areaSummary of region.areas ?? []) {
				const settlement = areasById.get(areaSummary.id) ?? areaSummary;
				// tree.addItem(settlement.name);
				const tree2 = new Tree([], {
					name: /*A:*/`${settlement.name}`,
					//onClick: () => {
					//	that.dockedBuildingViewer?.setData({ settlement });
					//}
				});
				tree2.addItem({
					text: 'Area itself',
					onClick: () => {
						if (!that.exteriorViewer)
							that.exteriorViewer = new ExteriorViewer();
						that.exteriorViewer.setData({ settlement }, { merge: true });
						that.dockCellViewer(that.exteriorViewer);
					}
				});

				for (const buildingObject of settlement.buildings ?? []) {
					const building_id = buildingObject.id;
					tree2.addItem({
						text: buildingObject.name,
						onClick: () => {
							that.dockedBuildingViewer?.setData({ settlement, building_id, building_name: buildingObject.name, buildingObject }, { merge: true });
							if (that.dockedBuildingViewer)
								that.dockCellViewer(that.dockedBuildingViewer);
						}
					});
				}
				tree.addItem(tree2);
			};
			vvardenfell.addItem(tree);
		}
		morrowind.addItem(vvardenfell);
		morrowind.addItem(mainland);

		//morrowind.addItem(divider.cloneNode(true));
		//vvardenfell.addItem(divider.cloneNode(true));
		//mainland.addItem(divider.cloneNode(true));

		tamriel.addItem(morrowind);
		tamriel.addItem(esroniet);
		target.appendChild(tamriel.getElement());

		target.appendChild(divider);
		this.tamrielTree = tamriel;
	}

	/**
	 * Expands the chain of trees matching the given names in order, e.g.
	 * `revealPath('Tamriel', 'Morrowind', 'Vvardenfell', 'Bitter Coast', 'Seyda Neen')`
	 * or `revealPath(['Tamriel', 'Morrowind', 'Vvardenfell', 'Bitter Coast', 'Seyda Neen'])`.
	 * @param {...(string | string[])} names
	 */
	revealPath(...names) {
		this.tamrielTree?.revealPath(.../** @type {string[]} */ (names));
	}

}