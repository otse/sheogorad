import Tree from './tree.js';
import Map from './map.js';
import Npc from './npc.js';
import Wnd from './wnd.js';
import MusicPlayer from './music player.js';

export const Sheogorad = {

	config: {
		version: "0.1.0",
		name: "sheogorad",
		debug: true
	},

	musicPlayer: null,

	canonList: {},
	iconList: {},

	npcs: [],

	async init() {
		console.log('sheogorad initialized');

		await this.loadCanonList();
		await this.loadIconList();
		this.setupEventListeners();

		new Wnd('History', null, { width: 300, height: 150 });

		Sheogorad.generate(); // We're cheating! Skip GenDiag!


		const bgMusic = document.getElementById('bg-music');
		const muteBtn = document.getElementById('mute-btn');

		function playMusic() {
			bgMusic.play().catch(() => { });
			Sheogorad.musicPlayer = new MusicPlayer();
		}

		// Problem Clicking the button doesnt start the music (not document)
		document.addEventListener('click', playMusic, { once: true });
		document.addEventListener('keydown', playMusic, { once: true });

		muteBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			if (bgMusic.muted) {
				bgMusic.muted = false;
				muteBtn.textContent = '🔊 Music';
				muteBtn.classList.remove('muted');
				muteBtn.title = 'Mute';
			} else {
				bgMusic.muted = true;
				muteBtn.textContent = '🔇 Music';
				muteBtn.classList.add('muted');
				muteBtn.title = 'Unmute';
			}
		});


	},
	/*async playClickSound() {
		const click = new Audio('sound/menu click.wav');
		click.play().catch(() => { });
	},*/
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

	regionClassName(regionName) {
		const slug = regionName
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');
		return `region-${slug}`;
	},

	formatRegionName(regionName) {
		return `${regionName/*.toUpperCase()*/}`;
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
		//document.getElementById('mainView').textContent = `Boo`;

		this.populate();

		// Search for npc of name X and make a wnd for them
		const darvame = this.npcs.find(npc => npc.name === 'darvame_hleran');
		if (darvame) {
			darvame.makeWnd();
			darvame.wnd.moveTo(30, 40);
			// Problem wnd.wnd makes no sense
		}
		

	},

	populate() {
		console.warn(' Populate ');

		// Create items for the generic list
		// Make drop down menus for each region in the canon list
		const genericList = document.getElementById('genericList');

		for (const region in this.canonList) {
			const tree = new Tree([], {
				name: this.formatRegionName(region),
				className: 'tree',
				labelClassName: this.regionClassName(region)
			});
			for (const settlement of this.canonList[region]) {
				// tree.addItem(settlement.name);
				const tree2 = new Tree([], {
					name: settlement.name,
					className: 'tree'
				});
				const building_ids = settlement.buildings;

				for (const building_id in building_ids) {
					console.warn(' building_ids ', building_id);

					for (const buildingObject of building_ids[building_id]) {
						console.warn(' building ', buildingObject.instance.name);
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
							this.npcs.push(npc);
							const icon = this.iconList.npcIcons[npcName] || '';
							tree3.addItem({
								text: `${icon} ${this.formatNpcName(npcName)}`,
								onClick: () => {
									npc.makeWnd();
								}
							});
						}
					};
				}
				tree.addItem(tree2);
			};
			genericList.appendChild(tree.getElement());

			const divider = document.createElement('div');
			divider.className = 'menuDividerH';
			genericList.appendChild(divider);
		}

	}
};

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => Sheogorad.init());

// Export for global access
window.Sheogorad = Sheogorad;

// Default export
export default Sheogorad;