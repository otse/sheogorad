// Small helpers for turning free-text names into stable, URL-safe ids.

export function slugify(text) {
	return String(text)
		.toLowerCase()
		.replace(/'/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export function titleCase(id) {
	return String(id)
		.replace(/[_-]+/g, ' ')
		.replace(/\b\w/g, ch => ch.toUpperCase());
}
