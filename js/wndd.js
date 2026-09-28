// 🧙‍♀️ Code magic within

import Wnd from "./wnd.js";

/**
 * Base class for windowed components.
 */
export default class Wndd {
	/** @type {Wndd[]} All live Wndds, for Wndd.refreshAll() */
	static instances = [];

	static async refreshAll() {
		await Promise.all([...Wndd.instances]
			.filter((wndd) => !wndd.wnd?.isDestroyed)
			.map((wndd) => wndd.runRefresh()));
	}

	/** @type {Wnd | null} */
	wnd = null;
	/** Set to false for viewers whose refresh() never changes anything visible */
	showsRefreshSpinner = true;
	/** @type {number} Timestamp showSpinner() was last called, to enforce its minimum visible time */
	spinnerShownAt = 0;
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
			const title = this.wnd?.title;
			this.wnd = this._create();
			if (title !== undefined)
				this.wnd.setWndTitle(title);
		}
		if (!Wndd.instances.includes(this))
			Wndd.instances.push(this);
		this.wnd.setCloneHandler(() => {
			const copy = this.clone();
			return copy.wnd;
		});
		this.render();
	}
	render() {
	}
	async refresh() {
		this.render();
	}
	/** Override to decide whether this instance has data worth signaling as changed. */
	hasNewData() {
		return true;
	}

	/** Calls refresh(), showing the title spinner around it
	 * (unless this instance/call suppresses it). */
	async runRefresh(showSpinner = true) {
		const spin = showSpinner && this.showsRefreshSpinner && this.hasNewData();
		if (spin)
			this.showSpinner();
		try {
			await this.refresh();
		} finally {
			if (spin)
				await this.hideSpinner();
		}
	}

	/** @returns {HTMLElement | null | undefined} */
	get spinnerEl() {
		return this.wnd?.el?.querySelector('.rn-wnd-spinner');
	}

	/** Shows this wnd's title spinner. Call hideSpinner() to fade it back out. */
	showSpinner() {
		this.spinnerShownAt = Date.now();
		this.spinnerEl?.classList.remove('hidden');
	}

	/** Fades the spinner out, waiting out whatever's left of its 1s minimum visible time. */
	async hideSpinner() {
		const spinner = this.spinnerEl;
		if (!spinner)
			return;
		await new Promise((resolve) => setTimeout(resolve, Math.max(0, 1000 - (Date.now() - this.spinnerShownAt))));
		spinner.classList.add('hidden');
	}
	close() {
		const index = Wndd.instances.indexOf(this);
		if (index !== -1)
			Wndd.instances.splice(index, 1);
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
		const title = this.wnd?.title;
		const copy = new Ctor(/** @type {any} */ (this).data);
		copy.make();
		if (title !== undefined)
			copy.wnd?.setWndTitle(title);
		return copy;
	}
}
