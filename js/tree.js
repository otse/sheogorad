// 🧙‍♀️ Code magic within

export default class Tree {
	constructor(items = [], options = {}) {
		this.ul = document.createElement('ul');
		this.ul.className = 'tree-view';
		this.ul.hidden = true;
		this.root = this.ul;
		this.items = [];
		this.emptyItem = null;

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
		}

		items.forEach(item => this.addItem(item));
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