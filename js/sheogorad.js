// 🧙‍♀️ Code magic within

import Tree from './tree.js';
import Npc from './wnds/npc.js';
import Wnd from './wnd.js';
import MusicPlayer from './wnds/music player.js';
import LorePanel from './wnds/lore.js';
import ThingsToDo from './wnds/things to do.js';
import RegionViewer from './wnds/region.js';
import AreaViewer from './wnds/area.js';

import randomData from './global.js';

export const Sheogorad = {

	config: {
		version: "0.1.0",
		name: "sheogorad",
		debug: true
	},

	global: randomData,

	/** @type {ThingsToDo | null} */
	thingsToDo: null,
	/** @type {LorePanel | null} */
	lorePanel: null,
	/** @type {RegionViewer | null} */
	areaList: null,
	/** @type {AreaViewer | null} */
	areaViewer: null,
	/** @type {MusicPlayer | null} */
	musicPlayer: null,

	canonList: {},
	lore: {},
	iconList: {},

	/** @type {Npc[]} */
	npcs: [],

	musicToggle: true,

	async init() {
		console.log('sheogorad initialized');

		await this.loadCanonList();
		await this.loadLore();
		await this.loadIconList();
		this.setupEventListeners();

		Wnd.init();

		// new Wnd('History', null, { width: 300, height: 150 });

		this.lorePanel = new LorePanel();

		this.thingsToDo = new ThingsToDo();
		this.thingsToDo.make();

		this.areaList = new RegionViewer();
		this.areaList.make();

		this.areaViewer = new AreaViewer();
		this.areaViewer.make();
		if (this.areaList.wnd && this.areaViewer.wnd) {
			const areaDockZone = this.areaList.wnd.wndContent.querySelector('.rnl-region-wnd-docking-zone');
			if (areaDockZone instanceof HTMLElement)
				this.areaViewer.wnd.hardDock(areaDockZone);
		}

		Sheogorad.staaart(); // We're cheating! Skip GenDiag!

		// this.musicPlayer = new MusicPlayer();

		const bgMusic = /** @type {HTMLAudioElement | null} */ (document.getElementById('bg-music'));
		const muteBtn = document.getElementById('mute-btn');
		const lorePanelBtn = document.getElementById('new-box-btn');

		if (lorePanelBtn)
			lorePanelBtn.addEventListener('click', (e) => {
				// this.lorePanel.close();
				if (this.lorePanel)
					this.lorePanel.make();
				Sheogorad.playClickSound();
			});

		function startMusicWhenPossible() {
			if (!bgMusic)
				return;
			bgMusic.play().catch(() => { });
		}

		// Problem Clicking the button doesnt start the music (not document)
		document.addEventListener('click', startMusicWhenPossible, { once: true });
		document.addEventListener('keydown', startMusicWhenPossible, { once: true });

		if (muteBtn)
			muteBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				/*if (bgMusic.muted) {
					bgMusic.muted = false;
					muteBtn.textContent = 'Music (On)';
					muteBtn.classList.remove('muted');
					muteBtn.title = 'Mute';
				} else {
					bgMusic.muted = true;
					muteBtn.textContent = 'Music (Off)';
					muteBtn.classList.add('muted');
					muteBtn.title = 'Unmute';
				}*/
				Sheogorad.playClickSound();
				Sheogorad.musicPlayer ??= new MusicPlayer();
				Sheogorad.musicPlayer.toggle(this.musicToggle);
			});


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

	async loadLore() {
		this.lore = await this.loadJson('json/lore.json');
	},

	async loadIconList() {
		this.iconList = await this.loadJson('json/icon list.json');
	},

	playClickSound() {
		const click = new Audio('sound/menu click.wav');
		click.play().catch(() => { });
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

	staaart() {
		this.populate();

		// Search for npc of name X and make a Wnd for them
		const wulf = this.npcs.find(npc => npc.name === 'arrille');
		if (wulf) {
			wulf.makeWnd();
			//wulf.wnd.moveTo(30, 40);
			// Problem wnd.wnd makes no sense
		}

		// Define some dock zones
		Wnd.defineDockZone('#dockingZoneLeft');
		Wnd.defineDockZone('#dockingZoneRight');
	},

	populate() {
		console.warn(' Populate ');
	}
};

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => Sheogorad.init());

// Export for global access
window.Sheogorad = Sheogorad;

// Default export
export default Sheogorad;