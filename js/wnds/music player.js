// 🧙‍♀️ Code magic within

import Sheogorad from "../sheogorad.js";
import Wnd from "../wnd.js";
import Wndd from "../wndd.js";

export default class MusicPlayer extends Wndd {
	constructor() {
		super();
		console.log('new music player');

		this.make();
	}
	_create() {
		const template = /** @type {HTMLTemplateElement} */ (document.getElementById('music-player-wnd-template'));
		const clone = /** @type {DocumentFragment} */ (template.content.cloneNode(true));

		return new Wnd(
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