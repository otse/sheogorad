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
		this.wnd.wndd = this;
		this.wnd.setRefreshHandler(() => this.refresh());
		this.render();
	}
	render() {
	}
	refresh() {
		this.render();
	}
	close() {
		if (this.wnd) {
			this.wnd.close();
		}
	}

	/**
	 * Creates a fresh, independently live instance of this viewer (same class,
	 * same `data`), used by Wnd.cloneAsFloating() to detach a hard-docked wnd.
	 * @returns {Wndd}
	 */
	clone() {
		const Ctor = /** @type {new (data?: any) => Wndd} */ (this.constructor);
		const copy = new Ctor(/** @type {any} */ (this).data);
		copy.make();
		return copy;
	}
}
