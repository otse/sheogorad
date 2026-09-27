// 🧙‍♀️ Code magic within

export default class Tree {
	constructor(items = [], options = {}) {
		this.ul = document.createElement('ul');
		this.ul.className = options.className || 'tree-view';
		this.ul.hidden = true;
		this.root = this.ul;
		this.items = [];
		this.emptyItem = null;

		if (options.name) {
			const wrapper = document.createElement('div');
			const label = document.createElement('span');
			const elbowItem = document.createElement('li');
			elbowItem.className = 'tree-elbow-item';
			const expandedClass = 'tree-expanded';
			elbowItem.textContent = '↳';
			this.ul.appendChild(elbowItem);
			label.appendChild(document.createTextNode(options.name));
			label.style.cursor = 'pointer';
			label.classList.add('tree-label');
			if (options.labelClassName) {
				label.classList.add(options.labelClassName);
			}

			// Start collapsed and keep both hidden/display in sync for reliability.

			label.addEventListener('click', () => {
				const shouldShow = !label.classList.contains(expandedClass);
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
				//elbow.textContent = shouldShow ? ' ↳' : ''; // ☇ ↴↳
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
		this.emptyItem?.remove();
		this.emptyItem = null;
		const li = document.createElement('li');

		if (item instanceof Tree) {
			li.appendChild(item.root);
		} else /*if (item.text && item.onClick)*/ {
			const span = document.createElement('span');
			span.className = 'tree-clickable';
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