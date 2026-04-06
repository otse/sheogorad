export default class Tree {
	constructor(items = [], options = {}) {
		this.ul = document.createElement('ul');
		this.ul.className = options.className || 'tree';
		this.ul.hidden = true;
		this.root = this.ul;
		this.items = [];

		if (options.name) {
			const wrapper = document.createElement('div');
			const label = document.createElement('span');
			const caret = document.createElement('span');
			const expandedClass = 'expanded';
			caret.textContent = '';
			label.appendChild(document.createTextNode(options.name));
			label.appendChild(caret);
			label.style.cursor = 'pointer';
			label.classList.add('label');
			if (options.labelClassName) {
				label.classList.add(options.labelClassName);
			}

			// Start collapsed and keep both hidden/display in sync for reliability.

			label.addEventListener('click', () => {
				const shouldShow = this.ul.hidden;
				this.ul.hidden = !shouldShow;
				this.ul.style.display = shouldShow ? 'block' : 'none';
				label.classList.toggle(expandedClass, shouldShow);
				caret.textContent = shouldShow ? ' ↴' : ''; // ☇
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
			span.className = 'clickable';
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