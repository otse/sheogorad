// 🧙‍♀️ Code magic within

import Sheogorad from "./sheogorad.js";
import Wnd from "./wnd.js";

function formatNpcName(name) {
	return name.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

export default class Npc {
	/** @type {Wnd | null} */
	wnd = null;
	icon = '';
	constructor(name) {
		this.name = name;
		this.icon = Sheogorad.iconList.npcIcons[name] || '';
	}
	makeWnd() {
		const mwMenuTemplate = /** @type {HTMLTemplateElement} */
			(document.getElementById('npc-wnd-template'));
			
		const clone = mwMenuTemplate.content.cloneNode(true);

		this.wnd = new Wnd(
			`${this.icon}${formatNpcName(this.name)}`,
			`Details about ${formatNpcName(this.name)}`,
			{ width: 200, height: 300 });
		this.wnd.setContent(clone);
	}
}