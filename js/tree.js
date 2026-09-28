// 🧙‍♀️ Code magic within

export default class Tree {
	constructor(items = [], options = {}) {
		this.ul = document.createElement('ul');
		this.ul.className = 'tree-view';
		this.ul.hidden = true;
		this.root = this.ul;
		this.items = [];
		this.emptyItem = null;
		this.name = options.name ?? null;
		this.label = null;

		if (options.name) {
			const wrapper = document.createElement('div');
			const label = document.createElement('span');
			const elbow = document.createElement('span');
			elbow.setAttribute('aria-hidden', 'true');
			elbow.textContent = ' ⤥'; // ⤵ ⤥ ⤷ ⟹ ⟿
			elbow.style.fontSize = '80%';
			elbow.hidden = true;
			label.appendChild(document.createTextNode(options.name));
			label.appendChild(elbow);
			label.style.cursor = 'pointer';
			label.setAttribute('role', 'button');
			label.tabIndex = 0;
			label.setAttribute('aria-expanded', 'false');
			if (options.hideLabel) {
				label.hidden = true;
				this.ul.hidden = false;
			}

			// Start collapsed and keep both hidden/display in sync for reliability.

			label.addEventListener('click', () => {
				const shouldShow = label.getAttribute('aria-expanded') !== 'true';
				if (shouldShow && this.items.length === 0 && !this.emptyItem) {
					this.emptyItem = document.createElement('li');
					this.emptyItem.textContent = 'Empty';
					this.ul.appendChild(this.emptyItem);
				}
				const currentHeight = this.ul.hidden ? 0 : this.ul.getBoundingClientRect().height;
				this.ulAnimation?.cancel();
				this.ul.hidden = false;
				this.ul.style.height = `${currentHeight}px`;
				this.ul.style.overflow = 'hidden';
				const targetHeight = shouldShow ? this.ul.scrollHeight : 0;
				const animation = this.ul.animate(
					[{ height: `${currentHeight}px` }, { height: `${targetHeight}px` }],
					{ duration: 180, easing: 'ease-in-out' }
				);
				this.ulAnimation = animation;
				elbow.hidden = !shouldShow;
				animation.onfinish = () => {
					if (this.ulAnimation !== animation) {
						return;
					}
					this.ul.hidden = !shouldShow;
					this.ul.style.height = shouldShow ? 'auto' : '';
					this.ul.style.overflow = '';
					this.ulAnimation = null;
				};
				label.setAttribute('aria-expanded', String(shouldShow));
				if (options.onClick) {
					options.onClick();
				}
			});
			label.addEventListener('keydown', event => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault();
					label.click();
				}
			});

			wrapper.appendChild(label);
			wrapper.appendChild(this.ul);
			this.root = wrapper;
			this.label = label;
		}

		items.forEach(item => this.addItem(item));
	}

	/**
	 * Opens this tree (no-op if already open or if it has no label to toggle).
	 */
	expand() {
		if (this.label && this.label.getAttribute('aria-expanded') !== 'true')
			this.label.click();
	}

	/**
	 * Finds a direct child (a sub-tree or a leaf item) whose name/text matches
	 * (case/whitespace-insensitive).
	 * @param {string} name
	 * @returns {Tree | { text?: string, onClick?: () => void } | null}
	 */
	findChildByName(name) {
		const target = name.trim().toLowerCase();
		for (const item of this.items) {
			if (item instanceof Tree && item.name && item.name.trim().toLowerCase() === target)
				return item;
			if (!(item instanceof Tree) && !(item instanceof HTMLElement) && item.text && item.text.trim().toLowerCase() === target)
				return item;
		}
		return null;
	}

	/**
	 * Expands this tree, then walks down descendants matching the given names in
	 * order, expanding each one, e.g. `tree.revealPath('Morrowind', 'Vvardenfell')`
	 * or `tree.revealPath(['Morrowind', 'Vvardenfell'])`.
	 * @param {...(string | string[])} names
	 */
	revealPath(...names) {
		/** @type {string[]} */
		const path = names.length === 1 && Array.isArray(names[0]) ? names[0] : /** @type {string[]} */ (names);

		this.expand();
		// Allow the path to optionally start with this tree's own name.
		const rest = this.name && path[0]?.trim().toLowerCase() === this.name.trim().toLowerCase()
			? path.slice(1)
			: path;

		let current = /** @type {Tree | null} */ (this);
		for (const name of rest) {
			if (!current)
				return;
			const child = current.findChildByName(name);
			if (child instanceof Tree) {
				child.expand();
				current = child;
			}
			else {
				// Not a sub-tree — it's a leaf item, so just fire its click handler.
				child?.onClick?.();
				current = null;
			}
		}
	}

	addItem(item) {
		this.emptyItem?.remove();
		this.emptyItem = null;
		const li = document.createElement('li');

		if (item instanceof Tree) {
			li.appendChild(item.root);
		}
		else if (item instanceof HTMLElement) {
			this.ul.appendChild(item);
		}
		else /*if (item.text && item.onClick)*/ {
			const span = document.createElement('span');
			span.textContent = item.text || item.toString();
			span.style.cursor = 'pointer';
			span.addEventListener('click', item.onClick);
			li.appendChild(span);
		}

		this.ul.appendChild(li);
		this.items.push(item);
		return this;
	}

	getElement() {
		return this.root;
	}
}