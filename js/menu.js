// 🧙‍♀️ Code magic within

import Sheogorad from './sheogorad.js';
import Taskbar from './taskbar.js';

function getGridRestriction() {
	return {
		left: 0,
		top: 0,
		right: window.innerWidth,
		bottom: window.innerHeight
	};
}

function moveWithin(parent, el, x, y) {
	const pw = parent.clientWidth / 2;
	const ph = parent.clientHeight / 2;

	const ew = el.offsetWidth;
	const eh = el.offsetHeight;

	const clampedX = Math.max(-pw, Math.min(x, (pw) - ew));
	const clampedY = Math.max(-ph, Math.min(y, (ph) - eh));

	return [clampedX, clampedY];
}

const RESIZE_HANDLES = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

/* Windows should be able to minimize at some point,
   this would still remove them from the DOM, then an animation
   will pop them back up to where they ought to be. */

// the intended lifecycle is create → destroy → recreate, not create → hide → show.

let rnWnds;

// A Mw / Ds Wnd
export default class Menu {

	/**
	 * @typedef {object} DockZoneOptions
	 * @property {boolean} [resize] Resize the window to fit the dock zone.
	 * @property {boolean} [internal] Mark a zone as programmatic-only.
	 */
	/**
	 * @typedef {object} DockOptions
	 * @property {boolean} [resize] Resize the window to fit the dock zone.
	 */
	/**
	 * @typedef {object} WindowOptions
	 * @property {number} [width]
	 * @property {number} [height]
	 * @property {number} [minWidth]
	 * @property {number} [minHeight]
	 * @property {number} [maxWidth]
	 * @property {number} [maxHeight]
	 * @property {boolean} [wndcard]
	 * @property {string} [emoji]
	 * @property {string} [titleGradient]
	 * @property {boolean} [closable]
	 */
	/**
	 * @typedef {object} HardDockState
	 * @property {HTMLElement} host
	 * @property {ChildNode | null} nextSibling
	 * @property {string} posStyle
	 * @property {string} elStyle
	 */
	/** @typedef {HTMLElement & { _wndInstance: Menu }} WndElement */

	/** @type {Menu[]} */
	static wnds = [];

	/** @type {Map<HTMLElement, DockZoneOptions>} Dockable areas registered via Wnd.defineDockZone() */
	static dockZones = new Map();

	/**
	 * Marks an element as a dock target. Windows dragged over it will
	 * highlight it, and dropping there docks the window to its position.
	 * @param {HTMLElement | string} element Element or CSS selector
	 * @param {DockZoneOptions} [options] Set `internal: true` for
	 * zones only ever hard-docked programmatically (e.g. RegionViewer's cell dock), so users
	 * can't drag arbitrary wnds into them.
	 */
	static defineDockZone(element, options = {}) {
		if (typeof element === 'string')
			element = /** @type {HTMLElement} */ (document.querySelector(element));
		if (!element) {
			console.warn('Wnd.defineDockZone: element not found');
			return;
		}
		Menu.dockZones.set(element, options);

		if (options.internal)
			return element;

		element.classList.add('rn-dock-zone');

		interact(element).dropzone({
			accept: '.rn-wnd-position',
			overlap: 'pointer',
			ondragenter(event) {
				event.target.classList.add('rn-dock-zone-hover');
			},
			ondragleave(event) {
				event.target.classList.remove('rn-dock-zone-hover');
			},
			ondrop(event) {
				event.target.classList.remove('rn-dock-zone-hover');
				const wnd = event.relatedTarget && event.relatedTarget._wndInstance;
				if (wnd)
					wnd.dock(event.target, options);
			},
			ondropdeactivate(event) {
				event.target.classList.remove('rn-dock-zone-hover');
			},
		});

		return element;
	}

	/** @type {HTMLElement} */
	wndContent = document.createElement('div');

	/** @type {WndElement | null}  */
	el = null;

	/** @type {WndElement | null} .rn-wnd-position wrapper; owns interact.js's position/size updates */
	posEl = null;

	isDestroyed = false;
	isMinimized = false;
	title = '';
	/** @type {(() => Menu | null) | null} */
	cloneHandler = null;

	/** @type {Menu | null} Wnd whose spawned link created this wnd, if any */
	parent = null;
	/** @type {Menu[]} Wnds spawned from links inside this wnd */
	children = [];

	/** @type {HTMLElement | null} Dock zone this wnd is currently snapped to, if any */
	dockedZone = null;
	/** @type {HardDockState | null} */
	hardDockState = null;
	beforeMinSize = { width: 0, height: 0 };
	beforeMinXY = { x: 0, y: 0 };

	static init() {
		rnWnds = document.querySelector('rn-wnds');
	}

	/** Warns and returns `undefined`, for use as `return this.warnDestroyed();` in a guard clause. */
	warnDestroyed() {
		console.warn('Attempted to interact with a destroyed wnd');
	}

	toggleMin() {
		if (this.isMinimized) {
			this.maximize();
			this.isMinimized = false;
		} else {
			this.minimize();
			this.isMinimized = true;
		}
	}

	minimize() {
		if (!this.el || !this.posEl) return this.warnDestroyed();
		// this.dsWnd.style.display = 'none';
		this.beforeMinSize.width = this.posEl.offsetWidth;
		this.beforeMinSize.height = this.posEl.offsetHeight;
		this.beforeMinXY.x = parseFloat(this.posEl.getAttribute('data-x') || '') || 0;
		this.beforeMinXY.y = parseFloat(this.posEl.getAttribute('data-y') || '') || 0;
		this.el.setAttribute('data-minimized', 'true');

		this.moveWithinTranslateTerritory(
			-window.innerWidth, -window.innerHeight);
		this.posEl.style.transition = 'transform 0.3s ease';
		Taskbar.admitOne(this);
		// Hide the content part, but keep the title bar visible for now
		/** @type {HTMLElement | null} */
		const contentContainer = this.el.querySelector('.rn-wnd-content');
		if (!contentContainer)
			return;
		contentContainer.style.display = 'none';
		// Squish the height of the window to just the title bar
		this.el.style.width = '0px';
		this.el.style.height = '0px';
		this.el.style.minHeight = '0px';
	}

	maximize() {
		if (!this.el || !this.posEl) return this.warnDestroyed();
		Taskbar.removeOne(this);
		this.moveTo(this.beforeMinXY.x, this.beforeMinXY.y);
		this.el.removeAttribute('data-minimized');
		/** @type {HTMLElement | null} */
		const contentContainer = this.el.querySelector('.rn-wnd-content');
		// Reset to default styles, which should be defined in CSS
		if (!contentContainer)
			return;
		contentContainer.style.display = '';
		this.el.style.height = '';
		this.el.style.minHeight = '';
		this.el.style.width = this.beforeMinSize.width + 'px';
		this.el.style.height = this.beforeMinSize.height + 'px';
		setTimeout(() => {
			if (this.posEl)
				this.posEl.style.transition = '';
		}, 300);
	}

	// Obscure method, completely hides our Wnd (not minimize)
	toggle() {
		if (!this.el || !this.posEl) return this.warnDestroyed();
		if (this.posEl.style.display === 'none') {
			this.posEl.style.display = 'block';
		} else {
			this.posEl.style.display = 'none';
		}
	}

	close() {
		if (!this.el || !this.posEl) return this.warnDestroyed();
		if (this.options.closable === false)
			return;
		this.closeChildren();
		if (this.parent) {
			const index = this.parent.children.indexOf(this);
			if (index !== -1)
				this.parent.children.splice(index, 1);
			this.parent = null;
		}
		this.posEl.remove();
		this.el = null;
		this.posEl = null;
		this.isDestroyed = true;
		const index = Menu.wnds.indexOf(this);
		if (index !== -1)
			Menu.wnds.splice(index, 1);
	}

	setCloneHandler(handler) {
		this.cloneHandler = handler;
	}

	// A wnd spawned this wnd by clicking a link within it
	addChild(child) {
		child.parent = this;
		this.children.push(child);
	}

	// Cards spawned from this wnd are just spawns, so they die with a click
	closeChildren() {
		[...this.children].forEach((child) => child.close());
	}

	moveWithinTranslateTerritory(mx, my) {
		if (!this.el || !this.posEl) return this.warnDestroyed();
		const clut = moveWithin(rnWnds, this.posEl, mx, my);
		this.moveTo(clut[0], clut[1]);
	}

	moveTo(x, y) {
		if (!this.el || !this.posEl) return this.warnDestroyed();
		this.posEl.style.transform = `translate(${x}px, ${y}px)`;
		this.posEl.setAttribute('data-x', x);
		this.posEl.setAttribute('data-y', y);
	}

	/**
	 * Snaps this wnd into a dock zone registered via Wnd.defineDockZone().
	 * @param {HTMLElement} zoneEl
	 * @param {DockOptions} [options]
	 */
	dock(zoneEl, options = {}) {
		if (!this.el || !this.posEl) return this.warnDestroyed();
		const zoneRect = zoneEl.getBoundingClientRect();
		const elRect = this.posEl.getBoundingClientRect();
		const curX = parseFloat(this.posEl.getAttribute('data-x') || '') || 0;
		const curY = parseFloat(this.posEl.getAttribute('data-y') || '') || 0;

		this.moveTo(curX + (zoneRect.left - elRect.left), curY + (zoneRect.top - elRect.top));

		if (options.resize !== false) {
			this.el.style.width = zoneRect.width + 'px';
			this.el.style.height = zoneRect.height + 'px';
		}

		this.dockedZone = zoneEl;
		this.posEl.setAttribute('data-docked', 'true');
		this.el.classList.add('rn-wnd-docked');
	}

	/** Clears the docked state set by dock(), if any. */
	undock() {
		if (!this.el || !this.posEl) return this.warnDestroyed();
		this.dockedZone = null;
		this.posEl.removeAttribute('data-docked');
		this.el.classList.remove('rn-wnd-docked');
	}

	/**
	 * Embeds this wnd in a zone so it is clipped and hidden with that zone's
	 * window. Unlike dock(), this changes the DOM parent and uses local layout.
	 * @param {HTMLElement} zoneEl
	 */
	hardDock(zoneEl) {
		if (!this.el || !this.posEl) return this.warnDestroyed();
		if (!(zoneEl instanceof HTMLElement))
			throw new TypeError('Wnd.hardDock requires an HTMLElement zone');

		if (this.hardDockState)
			this.hardUndock();

		const host = this.posEl.parentElement;
		if (!host)
			return;

		this.hardDockState = {
			host,
			nextSibling: this.posEl.nextSibling,
			posStyle: this.posEl.style.cssText,
			elStyle: this.el.style.cssText
		};

		this.posEl.removeAttribute('data-docked');
		this.el.classList.remove('rn-wnd-docked');
		zoneEl.appendChild(this.posEl);
		this.posEl.style.position = 'absolute';
		this.posEl.style.inset = '0';
		this.posEl.style.width = '100%';
		this.posEl.style.height = '100%';
		this.posEl.style.minWidth = '0';
		this.posEl.style.minHeight = '0';
		this.posEl.style.transform = 'none';
		this.el.style.width = '100%';
		this.el.style.height = '100%';
		this.el.style.minWidth = '0';
		this.el.style.minHeight = '0';

		// Dragging stays enabled so the title bar still starts a gesture, but the
		// 'start' listener below redirects it to a spawned clone instead of moving this posEl.
		this.interactable.resizable(false);
		this.dockedZone = zoneEl;
		this.posEl.setAttribute('data-hard-docked', 'true');
		this.el.classList.add('rn-wnd-hard-docked');
	}

	/** Restores a hard-docked wnd to the global window layer. */
	hardUndock() {
		if (!this.el || !this.posEl || !this.hardDockState)
			return;

		const { host, nextSibling, posStyle, elStyle } = this.hardDockState;
		if (nextSibling && nextSibling.parentNode === host)
			host.insertBefore(this.posEl, nextSibling);
		else
			host.appendChild(this.posEl);

		this.posEl.style.cssText = posStyle;
		this.el.style.cssText = elStyle;
		this.posEl.removeAttribute('data-hard-docked');
		this.el.classList.remove('rn-wnd-hard-docked');
		this.dockedZone = null;
		this.hardDockState = null;

		if (this.el.hasAttribute('moveable'))
			this.interactable.draggable(true);
		if (this.el.hasAttribute('resizeable'))
			this.interactable.resizable(true);
	}

	/**
	 * Spawns a floating copy of this wnd at its current on-screen position, via
	 * its registered clone handler, so the copy is a live, refreshable viewer
	 * rather than a static DOM snapshot.
	 * @returns {Menu}
	 */
	cloneAsFloating() {
		if (!this.el) {
			this.warnDestroyed();
			return this;
		}
		if (!this.cloneHandler) {
			console.warn('Wnd.cloneAsFloating: no clone handler is registered');
			return this;
		}
		const rect = this.el.getBoundingClientRect();
		const copy = this.cloneHandler();
		if (!copy?.el)
			return this;
		copy.el.style.width = rect.width + 'px';
		copy.el.style.height = rect.height + 'px';
		copy.moveTo(rect.left - window.innerWidth / 2, rect.top - window.innerHeight / 2);
		return copy;
	}

	setWndTitle(title) {
		if (!this.el) return this.warnDestroyed();
		this.title = title;
		const titleSpan = /** @type {HTMLElement} */
			(this.el.querySelector('.rn-wnd-title-bar>div>span>.text-gradient-title'));
		titleSpan.innerHTML = title;
		titleSpan.setAttribute('data-text', title);
		// Only strip stray text (e.g. a stale emoji), never the spinner element
		if (titleSpan.nextSibling?.nodeType === Node.TEXT_NODE)
			titleSpan.nextSibling.remove();
		if (this.options.emoji)
			titleSpan.before(document.createTextNode(this.options.emoji));
	}

	setContent(content) {
		if (!this.el) return this.warnDestroyed();
		const contentContainer = this.el.querySelector('.rn-wnd-content');
		if (!contentContainer)
			return;
		contentContainer.innerHTML = '';
		if (content instanceof Node) {
			contentContainer.appendChild(content);
		} else if (typeof content === 'string') {
			contentContainer.innerHTML = content;
		}
	}

	/**
	 * @param {string} title
	 * @param {Node | string} content
	 * @param {WindowOptions} [options]
	 */
	constructor(title, content, options = {}) {
		const rnWndTemplate = /** @type {HTMLTemplateElement} */ (document.getElementById('rn-wnd-template'));
		const clone = /** @type {DocumentFragment} */ (rnWndTemplate.content.cloneNode(true));

		this.el = clone.querySelector('.rn-wnd');

		if (!this.el)
			throw new Error('Missing .rn-wnd element in #rn-wnd-template');

		this.posEl = clone.querySelector('.rn-wnd-position');

		if (!this.posEl)
			throw new Error('Missing .rn-wnd-position element in #rn-wnd-template');

		// Attach Wnd user-data to el and posEl (interact.js dropzone events report posEl as the dragged target)
		this.el._wndInstance = this;
		this.posEl._wndInstance = this;

		const el = this.el;
		const posEl = this.posEl;

		this.options = options;
		if (options.closable === false) {
			el.removeAttribute('closable');
			el.querySelector('.rn-title-bar-button.close')?.remove();
		}
		if (this.options.wndcard)
			el.classList.add('rn-wndcard');

		// Entrance animation lives on el, not posEl, so it doesn't clash with interact.js's drag/resize transform
		el.classList.add('rn-wnd-enter');
		el.addEventListener('animationend', () => el.classList.remove('rn-wnd-enter'), { once: true });

		rnWnds.appendChild(clone);

		el.style.width = (options.width || 200) + 'px';
		el.style.height = (options.height || 200) + 'px';
		el.style.minWidth = (options.minWidth || 100) + 'px';
		el.style.minHeight = (options.minHeight || 100) + 'px';

		this.setWndTitle(title);
		if (options.titleGradient) {
			const titleSpan = /** @type {HTMLElement | null} */
				(el.querySelector('.rn-wnd-title-bar>div>span>span'));
			titleSpan?.classList.add('blue');
		}

		const contentContainer = /** @type {HTMLElement} */ (el.querySelector('.rn-wnd-content'));

		this.wndContent = contentContainer;

		if (typeof content === 'string')
			contentContainer.innerHTML = content;
		else {
			// Set this as the only child of the content container:
			contentContainer.innerHTML = '';
			contentContainer.appendChild(content);
		}

		const interactable = interact(posEl);
		this.interactable = interactable;

		posEl.style.transform = 'none';

		const that = this;

		const activate = () => {
			document.querySelectorAll('.rn-wnd-position').forEach((box) => box.classList.remove('active'));
			posEl.classList.add('active');
			that.closeChildren();
		};

		el.addEventListener('mousedown', activate);
		activate();

		if (el.hasAttribute('minimizable')) {
			const minBtn = el.querySelector('.rn-title-bar-button.min');
			if (!minBtn)
				return;
			minBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				Sheogorad.playClickSound();
				this.toggleMin();
			});
		}
		if (el.hasAttribute('closable')) {
			const closeBtn = el.querySelector('.rn-title-bar-button.close');
			if (!closeBtn)
				return;
			const removePressed = () => {
				closeBtn.classList.remove('pressed');
				document.removeEventListener('mouseup', removePressed);
			};
			closeBtn.addEventListener('mousedown', (e) => {
				e.preventDefault();
				e.stopPropagation();
				closeBtn.classList.add('pressed');
				Sheogorad.playClickSound();
				document.addEventListener('mouseup', removePressed);
			});
			closeBtn.addEventListener('mouseleave', removePressed);
			closeBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				this.close();
			});
		}
		if (el.hasAttribute('moveable')) {
			interactable.draggable({
				// Cards have no title bar, so drag from their content instead
				allowFrom: options.wndcard ? '.rn-wnd-content' : '.rn-wnd-title-bar',
				modifiers: [
					interact.modifiers.restrictRect({
						restriction: getGridRestriction,
						elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
					}),
					interact.modifiers.snap({
						targets: [null],
						range: Infinity,
						relativePoints: [{ x: 0, y: 0 }, { x: 0.5, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 0.5 }, { x: 0.5, y: 0.5 }, { x: 1, y: 0.5 }, { x: 0, y: 1 }, { x: 0.5, y: 1 }, { x: 1, y: 1 }],
					}),
				],
				listeners: {
					start(event) {
						if (that.hardDockState) {
							// Hard-docked wnds can't be dragged in place; spawn a floating
							// clone and hand the rest of this gesture off to it instead.
							const clone = that.cloneAsFloating();
							event.interaction.start({ name: 'drag' }, clone.interactable, clone.posEl);
							return;
						}
						if (that.dockedZone)
							that.undock();
					},
					move(event) {
						if (that.hardDockState)
							return;
						const target = event.target;
						const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
						const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

						that.moveTo(x, y);
					},
				},
			});
		}

		RESIZE_HANDLES.forEach((edge) => {
			const handle = document.createElement('div');
			handle.className = `rn-wnd-resize-handle rn-wnd-resize-${edge}`;
			el.appendChild(handle);
		});
		Menu.wnds.push(this);

		if (el.hasAttribute('resizeable')) {
			interactable.resizable({
				allowFrom: '.rn-wnd-resize-handle',
				edges: {
					top: '.rn-wnd-resize-n, .rn-wnd-resize-ne, .rn-wnd-resize-nw',
					left: '.rn-wnd-resize-w, .rn-wnd-resize-nw, .rn-wnd-resize-sw',
					bottom: '.rn-wnd-resize-s, .rn-wnd-resize-se, .rn-wnd-resize-sw',
					right: '.rn-wnd-resize-e, .rn-wnd-resize-ne, .rn-wnd-resize-se',
				},
				modifiers: [
					interact.modifiers.restrictSize({
						min: { width: options.minWidth || 100, height: options.minHeight || 100 },
						max: { width: options.maxWidth ?? Infinity, height: options.maxHeight ?? Infinity },
					}),
					interact.modifiers.restrictEdges({
						outer: getGridRestriction,
					}),
					interact.modifiers.snapEdges({
						targets: [null],
						range: Infinity,
					}),
				],
				invert: 'reposition',
				listeners: {
					move(event) {
						// Target the el not posEl:

						const posEl = event.target;
						const el = event.target.children[0];

						const x = (parseFloat(posEl.getAttribute('data-x')) || 0) + event.deltaRect.left;
						const y = (parseFloat(posEl.getAttribute('data-y')) || 0) + event.deltaRect.top;

						el.style.width = event.rect.width + 'px';
						el.style.height = event.rect.height + 'px';
						that.moveTo(x, y);
					},
				},
			});
		}


	}
}