// 🧙‍♀️ Code magic within

/**
 * Fills in a cloned <template> using declarative `data-bind-*` attributes
 * instead of hand-written querySelector calls at every call site.
 *
 * Supported attributes, usable on any element inside `root`:
 *   data-bind="path.to.value"                 -> sets textContent
 *   data-bind-html="path.to.value"             -> sets innerHTML (trusted content only)
 *   data-bind-attr="attr:path, attr2:path2"    -> sets one or more attributes
 *   data-bind-style="prop:path, prop2:path2"   -> sets one or more inline style properties
 *
 * Paths that resolve to undefined are left alone, so partial data is fine.
 *
 * @param {ParentNode} root
 * @param {Record<string, any>} data
 */
export function bindTemplate(root, data) {
	const resolve = (path) => path.split('.').reduce((value, key) => (value == null ? undefined : value[key]), data);
	const pairs = (spec) => spec.split(',').map((pair) => pair.split(':').map((part) => part.trim()));

	root.querySelectorAll('[data-bind], [data-bind-html], [data-bind-attr], [data-bind-style]').forEach((el) => {
		const textPath = el.getAttribute('data-bind');
		if (textPath !== null) {
			const value = resolve(textPath);
			if (value !== undefined)
				el.textContent = value;
		}

		const htmlPath = el.getAttribute('data-bind-html');
		if (htmlPath !== null) {
			const value = resolve(htmlPath);
			if (value !== undefined)
				el.innerHTML = value;
		}

		const attrSpec = el.getAttribute('data-bind-attr');
		if (attrSpec !== null) {
			for (const [attr, path] of pairs(attrSpec)) {
				const value = resolve(path);
				if (value !== undefined)
					el.setAttribute(attr, value);
			}
		}

		const styleSpec = el.getAttribute('data-bind-style');
		if (styleSpec !== null) {
			for (const [prop, path] of pairs(styleSpec)) {
				const value = resolve(path);
				if (value !== undefined)
					el.style[prop] = value;
			}
		}
	});
}
