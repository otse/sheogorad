// 🧙‍♀️ Code magic within

import Sheogorad from "../sheogorad.js";
import Menu from "../menu.js";
import MenuBase from "../menu-base.js";

export default class MenuMusic extends MenuBase {
	constructor() {
		super();
		console.log('new music player');

		this.make();
	}
	_create() {
		const template = /** @type {HTMLTemplateElement} */ (document.getElementById('music-player-wnd-template'));
		const clone = /** @type {DocumentFragment} */ (template.content.cloneNode(true));

		return new Menu(
			`Music Player`,
			clone,
			{ minWidth: 350, minHeight: 200 });
	}
	toggle(on) {
		if (!this.wnd)
			return;
		if (!on)
			this.wnd.close();
		else
			this.make();
	}
}