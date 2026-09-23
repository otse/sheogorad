// 🧙‍♀️ Code magic within

import { bindTemplate } from "./bind.js";

import Sheogorad from "./sheogorad.js";
import Wnd from "./wnd.js";

function formatNpcName(name) {
	return name.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

const DEFAULT_STATS = {
	name: 'Arrille',
	hometown: 'Seyda Neen',
	life: { current: 61, max: 78 },
	magicka: { current: 200, max: 206 },
	level: 6,
	race: 'Dark Elf',
	class: 'Mage Warrior',
	pillars: {
		might: 57,
		will: 59,
		wits: 41,
		charm: 1,
	},
};

const random_stats = () => ({
	life: { current: Math.floor(Math.random() * 78), max: 78 },
	magicka: { current: Math.floor(Math.random() * 206), max: 206 },
	level: Math.floor(Math.random() * 10) + 1,
	race: ['Dark Elf', 'High Elf', 'Wood Elf', 'Orc', 'Nord'][Math.floor(Math.random() * 5)],
	class: ['Mage Warrior', 'Sorcerer', 'Thief', 'Ranger'][Math.floor(Math.random() * 4)],
	pillars: {
		might: Math.floor(Math.random() * 100),
		will: Math.floor(Math.random() * 100),
		wits: Math.floor(Math.random() * 100),
		charm: Math.floor(Math.random() * 100),
	},
});

export default class Npc {
	/** @type {Wnd | null} */
	wnd = null;
	icon = '';
	constructor(name, stats = {}) {
		this.name = name;
		this.icon = Sheogorad.iconList.npcIcons[name] || '';
		this.stats = { ...DEFAULT_STATS, ...random_stats(), ...stats };
	}
	makeWnd() {
		const mwMenuTemplate = /** @type {HTMLTemplateElement} */
			(document.getElementById('npc-wnd-template'));

		const clone = /** @type {DocumentFragment} */ (mwMenuTemplate.content.cloneNode(true));

		const { life, magicka } = this.stats;
		bindTemplate(clone, {
			...this.stats,
			life: { text: `${life.current}/${life.max}`, percent: `${(life.current / life.max) * 100}%` },
			magicka: { text: `${magicka.current}/${magicka.max}`, percent: `${(magicka.current / magicka.max) * 100}%` },
		});

		// ${this.icon}
		this.wnd = new Wnd(
			`${formatNpcName(this.name)}`,
			`Details about ${formatNpcName(this.name)}`,
			{ width: 200, height: 300 });
		this.wnd.setContent(clone);
	}
}