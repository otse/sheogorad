// 🧙‍♀️ Code magic within

export default class Tree {
	constructor(items = [], options = {}) {
		this.ul = document.createElement('ul');
		this.ul.className = options.className || 'rnt-tree';
		this.ul.hidden = true;
		this.root = this.ul;
		this.items = [];

		if (options.name) {
			const wrapper = document.createElement('div');
			const label = document.createElement('span');
			const caret = document.createElement('span');
			caret.classList.add('rnt-caret');
			const expandedClass = 'rnt-expanded';
			caret.textContent = '';
			label.appendChild(caret);
			label.appendChild(document.createTextNode(options.name));
			label.style.cursor = 'pointer';
			label.classList.add('rnt-label');
			if (options.labelClassName) {
				label.classList.add(options.labelClassName);
			}

			// Start collapsed and keep both hidden/display in sync for reliability.

			label.addEventListener('click', () => {
				const shouldShow = !label.classList.contains(expandedClass);
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
				animation.onfinish = () => {
					if (this.ulAnimation !== animation) {
						return;
					}
					this.ul.hidden = !shouldShow;
					this.ul.style.height = shouldShow ? 'auto' : '';
					this.ul.style.overflow = '';
					this.ulAnimation = null;
				};
				label.classList.toggle(expandedClass, shouldShow);
				caret.textContent = shouldShow ? ' ↳' : ''; // ☇ ↴↳
				if (options.onClick) {
					options.onClick();
				}
			});

			wrapper.appendChild(label);
			wrapper.appendChild(this.ul);
			this.root = wrapper;
		}

		items.forEach(item => this.addItem(item));
	}

	addItem(item) {
		const li = document.createElement('li');

		if (item instanceof Tree) {
			li.appendChild(item.root);
		} else /*if (item.text && item.onClick)*/ {
			const span = document.createElement('span');
			span.className = 'rnt-clickable';
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