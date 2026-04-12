// 🧙‍♀️ Code magic within

import Wnd from './wnd.js';

function overrideToggle(e) {
	console.warn('Rita Vritaski');
	e.stopPropagation();
	Sheogorad.playClickSound();
	this._wndInstance.toggleMin();
}

export const Taskbar = {

	// A stack of Wnds, the last minimized on on top
	minimizedWnds: [],

	config: {
		version: "0.1.0",
		name: "taskbar",
		debug: true
	},

	async init() {

	},

	async admitOne(wnd) {
		if (!(wnd instanceof Wnd)) {
			console.error('Only Wnd instances can be admitted to the taskbar');
			return;
		}
		this.minimizedWnds.push(wnd);
		this.reorganizeStack();
		wnd.el.addEventListener('click', overrideToggle);
	},

	async removeOne(wnd) {
		if (!(wnd instanceof Wnd)) {
			console.error('Only Wnd instances can be removed from the taskbar');
			return;
		}
		// Remove
		const index = this.minimizedWnds.indexOf(wnd);
		if (index > -1) {
			this.minimizedWnds.splice(index, 1);
		}
		else {
			console.warn('Attempted to remove a wnd that is not in the taskbar');
		}
		this.reorganizeStack();
		wnd.el.removeEventListener('click', overrideToggle);

	},

	async reorganizeStack() {
		// Add a bit of marginTop to each Wnd.el based on position
			this.minimizedWnds.forEach((wnd, index) => {
				wnd.el.style.marginTop = `${index * 19}px`;
			});

	}
};

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => Taskbar.init());

// Export for global access
window.Taskbar = Taskbar;

// Default export
export default Taskbar;