/** @param {string} text */
export function slugify(text) {
	return String(text)
		.toLowerCase()
		.replace(/'/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/** @param {string} id */
export function titleCase(id) {
	return String(id)
		.replace(/[_-]+/g, ' ')
		.replace(/\b\w/g, (character) => character.toUpperCase());
}