
const TASKBAR_INSET = 60;

let gridContainer;

function getGridRestriction() {
	const vw = window.innerWidth;
	const vh = window.innerHeight;
	const safeBottom = vh - TASKBAR_INSET;
	if (!gridContainer) return { left: 0, top: 0, right: vw, bottom: safeBottom };
	const rect = gridContainer.getBoundingClientRect();
	return {
		left: Math.max(0, rect.left),
		top: Math.max(0, rect.top),
		right: Math.min(vw, rect.right),
		bottom: Math.min(safeBottom, rect.bottom),
	};
}

const RESIZE_HANDLES = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];


// A Mw Wnd
export default class Wnd {

	dsWnd = null;

	moveTo(x, y) {
		this.dsWnd.style.transform = `translate(${x}px, ${y}px)`;
		this.dsWnd.setAttribute('data-x', x);
		this.dsWnd.setAttribute('data-y', y);
	}

	setContent(content) {
		const contentContainer = this.dsWnd.querySelector('.darkstone-wnd-content');
		contentContainer.innerHTML = '';
		if (content instanceof Node) {
			contentContainer.appendChild(content);
		} else if (typeof content === 'string') {
			contentContainer.textContent = content;
		}
	}


	constructor(title, content, options = {}) {
		const darkstoneUI = document.querySelector('darkstone-user-interface');

		const mwMenuTemplate = document.getElementById('darkstone-wnd-template');
		const clone = mwMenuTemplate.content.cloneNode(true);

		const dsWnd = clone.querySelector('.darkstone-wnd');
		this.dsWnd = dsWnd;

		dsWnd.style.width = (options.width || 200) + 'px';
		dsWnd.style.height = (options.height || 200) + 'px';

		dsWnd.querySelector('.darkstone-wnd-title').innerHTML = `<span>${title}</span>`;

		const contentContainer = dsWnd.querySelector('.darkstone-wnd-content');

		if (content)
			contentContainer.textContent = content;

		darkstoneUI.appendChild(clone);

		const interactable = interact(dsWnd);
		this.interactable = interactable;

		const rect = dsWnd.getBoundingClientRect();
		//dsWnd.style.left = (window.innerWidth / 2 - rect.width / 2) + 'px';
		//dsWnd.style.top = (window.innerHeight / 2 - rect.height / 2) + 'px';

		dsWnd.style.transform = 'none';

		// Set up interact let's

		// Problem This is a quick and dirty z-index hack
		dsWnd.addEventListener('mousedown', () => {
            document.querySelectorAll('.darkstone-wnd').forEach((box) => box.classList.remove('active'));
            dsWnd.classList.add('active');
        });

		if (dsWnd.hasAttribute('closable')) {
			const closeBtn = dsWnd.querySelector('.darkstone-wnd-close');
			const removePressed = () => {
				closeBtn.classList.remove('pressed');
				document.removeEventListener('mouseup', removePressed);
			};
			closeBtn.addEventListener('mousedown', (e) => {
				e.preventDefault();
				e.stopPropagation();
				closeBtn.classList.add('pressed');
				// Public.playClickSound();
				document.addEventListener('mouseup', removePressed);
			});
			closeBtn.addEventListener('mouseleave', removePressed);
			closeBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				dsWnd.remove();
			});
		}
		if (dsWnd.hasAttribute('moveable')) {
			interactable.draggable({
				allowFrom: '.darkstone-wnd-title',
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

						target.style.transform = `translate(${x}px, ${y}px)`;
						target.setAttribute('data-x', x);
						target.setAttribute('data-y', y);
					},
				},
			});
		}

		RESIZE_HANDLES.forEach((edge) => {
			const handle = document.createElement('div');
			handle.className = `darkstone-wnd-resize-handle darkstone-wnd-resize-${edge}`;
			dsWnd.appendChild(handle);
		});

		if (dsWnd.hasAttribute('resizeable')) {
			interactable.resizable({
				allowFrom: '.darkstone-wnd-resize-handle',
				edges: {
					top: '.darkstone-wnd-resize-n, .darkstone-wnd-resize-ne, .darkstone-wnd-resize-nw',
					left: '.darkstone-wnd-resize-w, .darkstone-wnd-resize-nw, .darkstone-wnd-resize-sw',
					bottom: '.darkstone-wnd-resize-s, .darkstone-wnd-resize-se, .darkstone-wnd-resize-sw',
					right: '.darkstone-wnd-resize-e, .darkstone-wnd-resize-ne, .darkstone-wnd-resize-se',
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