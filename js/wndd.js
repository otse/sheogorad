// 🧙‍♀️ Code magic within

import Wnd from "./wnd.js";

/**
 * Base class for windowed components.
 */
export default class Wndd {
	/** @type {Wnd | null} */
	wnd = null;
	/**
	 * @protected
	 * @returns {Wnd}
	 */
	// this is essentially a private method
	_create() {
		throw new Error(`${this.constructor.name} must implement create()`);
	}
	make() {
		if (!this.wnd || this.wnd.isDestroyed) {
			this.wnd = this._create();
		}
		this.render();
	}
	render() {
	}
	close() {
		if (this.wnd) {
			this.wnd.close();
		}
	}
}
