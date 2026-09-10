// 🧙‍♀️ Code magic within

import Sheogorad from "./sheogorad.js";
import Wnd from "./wnd.js";

export default class MusicPlayer {
	constructor() {
		console.log('new music player');

		this.ensureWnd();
	}
	ensureWnd() {
		if (!this.wnd || this.wnd.isDestroyed) {
			this.wnd = new Wnd(
				`Music Player`,
				`Yes`,
				{ width: 200, height: 100 });
		}
	}
	toggle(on) {
		if (!on)
			this.wnd.close();
		else
			this.ensureWnd();
	}
}