// 🧙‍♀️ Code magic within

import Tree from './tree.js';
import Npc from './wnds/npc.js';
import Wnd from './wnd.js';
import Wndd from './wndd.js';
import MusicPlayer from './wnds/music player.js';
import LorePanel from './wnds/lore.js';
import ThingsToDo from './wnds/things to do.js';
import RegionViewer from './wnds/region.js';
import BuildingViewer from './wnds/building.js';
import ServerClient from './server-client.js';

import randomData from './global.js';

/** @typedef {Awaited<ReturnType<ServerClient['downloadAll']>>} ServerData */

export const Sheogorad = {

	config: {
		version: "0.1.0",
		name: "sheogorad",
		debug: true
	},

	global: randomData,

	serverClient: new ServerClient(),
	/** @type {ServerData | null} */
	serverData: null,

	/** @type {ThingsToDo | null} */
	thingsToDo: null,
	/** @type {LorePanel | null} */
	lorePanel: null,
	/** @type {RegionViewer | null} */
	areaList: null,
	/** @type {BuildingViewer | null} */
	buildingViewer: null,
	/** @type {MusicPlayer | null} */
	musicPlayer: null,

	lore: {},
	iconList: {},

	/** @type {Npc[]} */
	npcs: [],

	musicToggle: true,

	async init() {
		console.log('sheogorad initialized');

		const refreshDataBtn = document.getElementById('refresh-data-btn');
		const refreshStatus = document.getElementById('data-refresh-status');
		const refresh = async () => {
			refreshDataBtn?.setAttribute('aria-busy', 'true');
			refreshDataBtn?.setAttribute('disabled', '');
			if (refreshStatus)
				refreshStatus.textContent = 'Refreshing';
			try {
				await this.refreshServerData();
				if (refreshStatus)
					refreshStatus.textContent = `Updated ${new Date().toLocaleTimeString()}`;
			} catch (error) {
				console.error('Failed to refresh server data:', error);
				if (refreshStatus)
					refreshStatus.textContent = 'Refresh failed';
			} finally {
				refreshDataBtn?.removeAttribute('aria-busy');
				refreshDataBtn?.removeAttribute('disabled');
			}
		};
		// Fixes a bug where region.js is never rebuilt
		refreshDataBtn?.addEventListener('click', refresh);
		await refresh();
		this.setupEventListeners();

		Wnd.init();

		// new Wnd('History', null, { width: 300, height: 150 });

		this.lorePanel = new LorePanel();

		this.thingsToDo = new ThingsToDo();
		this.thingsToDo.make();

		this.areaList = new RegionViewer();
		this.areaList.make();

		// RegionViewer.render() already creates and hard-docks its own BuildingViewer
		// into the same docking zone; reuse it instead of hard-docking a second
		// instance on top of it (which would silently swallow tree click updates).
		this.buildingViewer = this.areaList.dockedBuildingViewer;

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
	async downloadServerData() {
		this.serverData = await this.serverClient.downloadAll();
		return this.serverData;
	},

	async refreshServerData() {
		const previousData = JSON.stringify(this.serverData);
		const data = await this.downloadServerData();
		this.lore = data.lore;
		this.iconList = {
			npcIcons: Object.fromEntries(data.npcs.map((npc) => [npc.id, npc.icon]))
		};
		LorePanel.resetArticleIndex();
		await Wndd.refreshAll();
		return data;
	},

	playClickSound() {
		const click = new Audio('sound/menu click.wav');
		click.play().catch(() => { });
	},

	formatNpcName(name) {
		return name.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
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