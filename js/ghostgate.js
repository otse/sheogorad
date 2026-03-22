import Tree from './tree.js';

(function () {

	// ghostgate initialization
	const Ghostgate = {

		config: {
			version: "0.1.0",
			name: "ghostgate",
			debug: true
		},

		canonList: {},
		iconList: {},

		async init() {
			console.log('ghostgate initialized');

			await this.loadCanonList();
			await this.loadIconList();
			this.setupEventListeners();

			Ghostgate.generate(); // We're cheating! Skip GenDiag!

		},
		async loadJson(filePath) {
			try {
				const response = await fetch(filePath);
				const data = await response.json();
				if (this.config.debug) console.log(`Loaded ${filePath}:`, data);
				return data;
			} catch (error) {
				console.error(`Error loading ${filePath}:`, error);
				throw error;
			}
		},

		async loadCanonList() {
			this.canonList = await this.loadJson('json/canon list.json');
		},

		async loadIconList() {
			this.iconList = await this.loadJson('json/icon list.json');
		},

		formatNpcName(name) {
			return name.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
		},

		setupEventListeners() {
			// Add your event listeners here
		},

		generate() {
			// Add your generation logic here
			const islandName = document.getElementById('islandName').value;
			const treeStyle = document.getElementById('treeStyle').value;
			const hasWildGrass = document.getElementById('wildGrass').checked;

			document.getElementById('generationDialog').style.display = 'none';
			document.getElementById('mainView').style.display = 'block';
			document.getElementById('islandInfo').textContent = `Island: ${islandName} | Trees: ${treeStyle} | Wild Grass: ${hasWildGrass}`;

			this.populate();
		},

		populate() {
			console.warn(' Populate ');

			// Create items for the generic list
			// Make drop down menus for each region in the canon list
			const genericList = document.getElementById('genericList');
			genericList.innerHTML = '';

			for (const region in this.canonList) {
				console.log('Log');

				const tree = new Tree([], { name: region, className: 'tree treeSet' });
				for (const settlement of this.canonList[region]) {

					// tree.addItem(settlement.name);
					const tree2 = new Tree([], {
						name: settlement.name,
						className: 'tree treeSet'
					});
					const building_ids = settlement.buildings;
					
					for (const building_id in building_ids) {
						console.warn(' building_ids ', building_id);

						for (const buildingObject of building_ids[building_id]) {
							console.warn(' building ', buildingObject.instance.name);
							const tree3 = new Tree([], {
								name: buildingObject.instance.name,
								className: 'tree treeSet'
							});
							tree2.addItem(tree3);

							if (buildingObject.content.npcs.forced) {
								for (const npc of buildingObject.content.npcs.forced) {
									const icon = this.iconList.npcIcons[npc] || '';
									tree3.addItem(`${icon} ${this.formatNpcName(npc)}`);
								}
							}
							if (buildingObject.content.npcs.pool) {
								for (const npc of buildingObject.content.npcs.pool) {
									const icon = this.iconList.npcIcons[npc] || '';
									tree3.addItem(`${icon} ${this.formatNpcName(npc)}`);
								}
							}
						};
					}
					tree.addItem(tree2);
				};
				genericList.appendChild(tree.getElement());

			}

		}
	};

	// Run on page load
	document.addEventListener('DOMContentLoaded', () => Ghostgate.init());

	window.Tree = Tree;
	window.Ghostgate = Ghostgate;
})();