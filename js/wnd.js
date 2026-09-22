// 🧙‍♀️ Code magic within

import Sheogorad from './sheogorad.js';
import Taskbar from './taskbar.js';
// Dynamically imported in bindRunes() to avoid a circular import chain
// (wnd.js -> lore panel.js -> wnd card.js -> wnd.js) that leaves Wnd
// undefined when wnd card.js's class extends it.

function getGridRestriction() {
	return {
		left: 0,
		top: 0,
		right: window.innerWidth,
		bottom: window.innerHeight
	};
}
/*
function getTranslateAreaFor(rect) {
	const centerX = window.innerWidth / 2;
	const centerY = window.innerHeight / 2;

	// Calculate maximum allowed offsets to stay within bounds
	// Left bound: leftmost position where window fits in restriction area
	const maxLeftOffset = gridRestriction.left - centerX;
	// Right bound: rightmost position where window still fits
	const maxRightOffset = gridRestriction.right - centerX - rect.width;
	// Top bound: topmost position where window fits
	const maxTopOffset = gridRestriction.top - centerY;
	// Bottom bound: bottommost position where window still fits
	const maxBottomOffset = gridRestriction.bottom - centerY - rect.height;

	return {
		left: maxLeftOffset,
		top: maxTopOffset,
		right: maxRightOffset,
		bottom: maxBottomOffset
	};
}*/

function moveWithin(parent, el, x, y) {
	const pw = parent.clientWidth / 2;
	const ph = parent.clientHeight / 2;

	const ew = el.offsetWidth;
	const eh = el.offsetHeight;

	const clampedX = Math.max(-pw, Math.min(x, (pw) - ew));
	const clampedY = Math.max(-ph, Math.min(y, (ph) - eh));

	return [clampedX, clampedY];

	/*el.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
	el.dataset.x = clampedX;
	el.dataset.y = clampedY;*/
}

const RESIZE_HANDLES = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

/* Windows should be able to minimize at some point,
   this would still remove them from the DOM, then an animation
   will pop them back up to where they ought to be. */

// the intended lifecycle is create → destroy → recreate, not create → hide → show.

let stoneWnds;

// A Mw / Ds Wnd
export default class Wnd {

	static wnds = []; // Static

	/** @type {Map<HTMLElement, object>} Dockable areas registered via Wnd.defineDockZone() */
	static dockZones = new Map();

	/**
	 * Marks an element as a dock target. Windows dragged over it will
	 * highlight it, and dropping there docks the window to its position.
	 * @param {HTMLElement | string} element Element or CSS selector
	 * @param {{ resize?: boolean }} [options]
	 */
	static defineDockZone(element, options = {}) {
		if (typeof element === 'string')
			element = /** @type {HTMLElement} */ (document.querySelector(element));
		if (!element) {
			console.warn('Wnd.defineDockZone: element not found');
			return;
		}
		element.classList.add('rn-dock-zone');
		Wnd.dockZones.set(element, options);

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

	/**
	 * @typedef {HTMLElement & { _wndInstance: Wnd }} WndElement
	 */
	/** @type {WndElement | null}  */
	el = null;

	/** @type {WndElement | null} .rn-wnd-position wrapper; owns interact.js's position/size updates */
	posEl = null;

	isDestroyed = false;
	isMinimized = false;

	/** @type {Wnd | null} Wnd whose spawned link created this wnd, if any */
	parent = null;
	/** @type {Wnd[]} Wnds spawned from links inside this wnd */
	children = [];

	/** @type {HTMLElement | null} Dock zone this wnd is currently snapped to, if any */
	dockedZone = null;

	beforeMinSize = { width: 0, height: 0 };
	beforeMinXY = { x: 0, y: 0 };

	static init() {
		stoneWnds = document.querySelector('rn-wnds');
	}

	warnWindowDestroyed() {
		if (!this.el) {
			console.warn('Attempted to interact with a destroyed wnd');
		}
	}

	convertToWndcard() {

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
		if (!this.el || !this.posEl) {
			this.warnWindowDestroyed();
			return;
		}
		// this.dsWnd.style.display = 'none';
		this.beforeMinSize.width = this.posEl.offsetWidth;
		this.beforeMinSize.height = this.posEl.offsetHeight;
		this.beforeMinXY.x = parseFloat(this.posEl.getAttribute('data-x') || '') || 0;
		this.beforeMinXY.y = parseFloat(this.posEl.getAttribute('data-y') || '') || 0;
		this.el.setAttribute('data-minimized', 'true');

		console.warn('Min imize');

		this.moveWithinTranslateTerritory(
			-window.innerWidth, -window.innerHeight);
		this.posEl.style.transition = 'transform 0.3s ease';
		//
		Taskbar.admitOne(this);
		this.el.setAttribute('data-minimized', 'true');
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
		if (!this.el || !this.posEl) {
			this.warnWindowDestroyed();
			return;
		}
		//
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
		if (!this.el || !this.posEl) {
			this.warnWindowDestroyed();
			return;
		}
		if (this.posEl.style.display === 'none') {
			this.posEl.style.display = 'block';
		} else {
			this.posEl.style.display = 'none';
		}
	}

	close() {
		if (!this.el || !this.posEl) {
			this.warnWindowDestroyed();
			return;
		}
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
		if (!this.el || !this.posEl) {
			this.warnWindowDestroyed();
			return;
		}
		const clut = moveWithin(stoneWnds, this.posEl, mx, my);
		this.moveTo(clut[0], clut[1]);
		// this.moveTo(mx, my);
	}

	moveTo(x, y) {
		if (!this.el || !this.posEl) {
			this.warnWindowDestroyed();
			return;
		}
		this.posEl.style.transform = `translate(${x}px, ${y}px)`;
		this.posEl.setAttribute('data-x', x);
		this.posEl.setAttribute('data-y', y);
	}

	/**
	 * Snaps this wnd into a dock zone registered via Wnd.defineDockZone().
	 * @param {HTMLElement} zoneEl
	 * @param {{ resize?: boolean }} [options]
	 */
	dock(zoneEl, options = {}) {
		if (!this.el || !this.posEl) {
			this.warnWindowDestroyed();
			return;
		}
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
		if (!this.el || !this.posEl) {
			this.warnWindowDestroyed();
			return;
		}
		this.dockedZone = null;
		this.posEl.removeAttribute('data-docked');
		this.el.classList.remove('rn-wnd-docked');
	}

	setContent(content) {
		if (!this.el) {
			this.warnWindowDestroyed();
			return;
		}
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

	constructor(title, content, options = {}) {
		const rnWndTemplate = /** @type {HTMLTemplateElement} */
			(document.getElementById('rn-wnd-template'));

		const clone = /** @type {DocumentFragment} */
			(rnWndTemplate.content.cloneNode(true));

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

		if (options.wndcard)
			el.classList.add('rn-wndcard');

		stoneWnds.appendChild(clone);

		el.style.width = (options.width || 200) + 'px';
		el.style.height = (options.height || 200) + 'px';

		// Fix this with a type assertion:
		const titleSpan = /** @type {HTMLElement} */
			(el.querySelector('.rn-wnd-title>span:nth-of-type(2)>span'));
		titleSpan.innerHTML = `${title}`;
		titleSpan.setAttribute('data-text', title);

		const contentContainer = /** @type {HTMLElement} */
			(el.querySelector('.rn-wnd-content'));

		this.wndContent = contentContainer;

		// if content is a string
		if (typeof content === 'string')
			contentContainer.innerHTML = content;
		else {
			// Set this as the only child of the content container:
			contentContainer.innerHTML = '';
			contentContainer.appendChild(content);
		}

		//darkstoneUI.appendChild(clone);

		const interactable = interact(posEl);
		this.interactable = interactable;

		const rect = posEl.getBoundingClientRect();
		//dsWnd.style.left = (window.innerWidth / 2 - rect.width / 2) + 'px';
		//dsWnd.style.top = (window.innerHeight / 2 - rect.height / 2) + 'px';

		posEl.style.transform = 'none';

		const that = this;

		// Set up interact let's

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
				allowFrom: options.wndcard ? '.rn-wnd-content' : '.rn-wnd-title',
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
					start() {
						if (that.dockedZone)
							that.undock();
					},
					move(event) {
						const target = event.target;
						// console.log('event target', target);

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
						min: { width: options.minWidth || 100, height: 100 },
						// max: { width: options.maxWidth || 500, height: 100 },
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

						let x = parseFloat(posEl.getAttribute('data-x')) || 0;
						let y = parseFloat(posEl.getAttribute('data-y')) || 0;

						x += event.deltaRect.left;
						y += event.deltaRect.top;

						el.style.width = event.rect.width + 'px';
						el.style.height = event.rect.height + 'px';
						posEl.style.transform = `translate(${x}px, ${y}px)`;

						posEl.setAttribute('data-x', x);
						posEl.setAttribute('data-y', y);
					},
				},
			});
		}


	}
}