// 🧙‍♀️ Code magic within

import Taskbar from './taskbar.js';

function getGridRestriction() {
	return {
		left: 0,
		top: 0,
		right: window.innerWidth,
		bottom: window.innerHeight
	};
}
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
}

function moveWithin(parent, el, x, y) {
	const pw = parent.clientWidth / 2;
	const ph = parent.clientHeight / 2;

	const ew = el.offsetWidth;
	const eh = el.offsetHeight;

	const clampedX = Math.max(-pw, Math.min(x, (pw) - ew));
	const clampedY = Math.max(-ph, Math.min(y, (ph) - eh));

	return [clampedX, clampedY];

	el.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
	el.dataset.x = clampedX;
	el.dataset.y = clampedY;
}

const RESIZE_HANDLES = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

/* Windows should be able to minimize at some point,
this would still remove them from the DOM, then an animation
will pop them back up to where they ought to be*/

let stoneWnds;

// A Mw / Ds Wnd
export default class Wnd {

	static wnds = []; // Static

	el = null;

	isDestroyed = false;
	isMinimized = false;

	beforeMinSize = { width: 0, height: 0 };
	beforeMinXY = { x: 0, y: 0 };

	static init() {
		stoneWnds = document.querySelector('stone-wnds');
	}

	warnWindowDestroyed() {
		if (!this.el) {
			console.warn('Attempted to interact with a destroyed wnd');
		}
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
		if (!this.el) {
			this.warnWindowDestroyed();
			return;
		}
		// this.dsWnd.style.display = 'none';
		this.beforeMinSize.width = this.el.offsetWidth;
		this.beforeMinSize.height = this.el.offsetHeight;
		this.beforeMinXY.x = parseFloat(this.el.getAttribute('data-x')) || 0;
		this.beforeMinXY.y = parseFloat(this.el.getAttribute('data-y')) || 0;
		this.el.setAttribute('data-minimized', 'true');

		console.warn('Min imize');

		this.moveWithinTranslateTerritory(
			-window.innerWidth, -window.innerHeight);
		this.el.style.transition = 'transform 0.3s ease';
		//
		Taskbar.admitOne(this);
		this.el.setAttribute('data-minimized', 'true');
		// Hide the content part, but keep the title bar visible for now
		const contentContainer = this.el.querySelector('.stone-wnd-content');
		contentContainer.style.display = 'none';
		// Squish the height of the window to just the title bar
		this.el.style.width = '0px';
		this.el.style.height = '0px';
		this.el.style.minHeight = '0px';
	}

	maximize() {
		if (!this.el) {
			this.warnWindowDestroyed();
			return;
		}
		//
		Taskbar.removeOne(this);
		this.moveTo(this.beforeMinXY.x, this.beforeMinXY.y);
		this.el.removeAttribute('data-minimized');
		const contentContainer = this.el.querySelector('.stone-wnd-content');
		// Reset to default styles, which should be defined in CSS
		contentContainer.style.display = '';
		this.el.style.height = '';
		this.el.style.minHeight = '';
		this.el.style.width = this.beforeMinSize.width + 'px';
		this.el.style.height = this.beforeMinSize.height + 'px';
		setTimeout(() => {
			this.el.style.transition = '';
		}, 300);
	}

	toggle() {
		if (!this.el) {
			this.warnWindowDestroyed();
			return;
		}
		if (this.el.style.display === 'none') {
			this.el.style.display = 'block';
		} else {
			this.el.style.display = 'none';
		}
	}

	close() {
		if (!this.el) {
			this.warnWindowDestroyed();
			return;
		}
		this.el.remove();
		this.el = null;
		this.isDestroyed = true;
	}

	moveWithinTranslateTerritory(mx, my) {
		if (!this.el) {
			this.warnWindowDestroyed();
			return;
		}
		const clut = moveWithin(stoneWnds, this.el, mx, my);
		this.moveTo(clut[0], clut[1]);
		// this.moveTo(mx, my);
	}

	moveTo(x, y) {
		if (!this.el) {
			this.warnWindowDestroyed();
			return;
		}
		this.el.style.transform = `translate(${x}px, ${y}px)`;
		this.el.setAttribute('data-x', x);
		this.el.setAttribute('data-y', y);
	}

	setContent(content) {
		if (!this.el) {
			this.warnWindowDestroyed();
			return;
		}
		const contentContainer = this.el.querySelector('.stone-wnd-content');
		contentContainer.innerHTML = '';
		if (content instanceof Node) {
			contentContainer.appendChild(content);
		} else if (typeof content === 'string') {
			contentContainer.textContent = content;
		}
	}


	constructor(title, content, options = {}) {
		const darkstoneUI = document.querySelector('stone-user-interface');

		const wndTemplate = document.getElementById('stone-wnd-template');
		const clone = wndTemplate.content.cloneNode(true);

		this.el = clone.querySelector('.stone-wnd');

		// Attach Wnd user-data to el
		this.el._wndInstance = this;

		const el = this.el;

		stoneWnds.appendChild(clone);

		el.style.width = (options.width || 200) + 'px';
		el.style.height = (options.height || 200) + 'px';

		el.querySelector('.stone-wnd-title span').innerHTML = `${title}`;

		const contentContainer = el.querySelector('.stone-wnd-content');

		if (content)
			contentContainer.innerHTML = content;

		//darkstoneUI.appendChild(clone);

		const interactable = interact(el);
		this.interactable = interactable;

		const rect = el.getBoundingClientRect();
		//dsWnd.style.left = (window.innerWidth / 2 - rect.width / 2) + 'px';
		//dsWnd.style.top = (window.innerHeight / 2 - rect.height / 2) + 'px';

		el.style.transform = 'none';

		const that = this;

		// Set up interact let's

		// Problem This is a quick and dirty z-index hack
		el.addEventListener('mousedown', () => {
			document.querySelectorAll('.stone-wnd').forEach((box) => box.classList.remove('active'));
			el.classList.add('active');
		});

		if (el.hasAttribute('minimizable')) {
			const minBtn = el.querySelector('.stone-title-bar-button.min');
			minBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				Sheogorad.playClickSound();
				this.toggleMin();
			});
		}
		if (el.hasAttribute('closable')) {
			const closeBtn = el.querySelector('.stone-title-bar-button.close');
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
				allowFrom: '.stone-wnd-title',
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
			handle.className = `stone-wnd-resize-handle stone-wnd-resize-${edge}`;
			el.appendChild(handle);
		});

		if (el.hasAttribute('resizeable')) {
			interactable.resizable({
				allowFrom: '.stone-wnd-resize-handle',
				edges: {
					top: '.stone-wnd-resize-n, .stone-wnd-resize-ne, .stone-wnd-resize-nw',
					left: '.stone-wnd-resize-w, .stone-wnd-resize-nw, .stone-wnd-resize-sw',
					bottom: '.stone-wnd-resize-s, .stone-wnd-resize-se, .stone-wnd-resize-sw',
					right: '.stone-wnd-resize-e, .stone-wnd-resize-ne, .stone-wnd-resize-se',
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
						const target = event.target;
						let x = parseFloat(target.getAttribute('data-x')) || 0;
						let y = parseFloat(target.getAttribute('data-y')) || 0;

						x += event.deltaRect.left;
						y += event.deltaRect.top;

						target.style.width = event.rect.width + 'px';
						target.style.height = event.rect.height + 'px';
						target.style.transform = `translate(${x}px, ${y}px)`;

						target.setAttribute('data-x', x);
						target.setAttribute('data-y', y);
					},
				},
			});
		}


	}
}