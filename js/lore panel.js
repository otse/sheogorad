// 🧙‍♀️ Code magic within

import Sheogorad from "./sheogorad.js";
import Wnd from "./wnd.js";
import WndCard from "./wnd card.js";

const swathOfText = `
<img src="https://images.uesp.net/thumb/6/65/MW-place-Seyda_Neen.jpg/1600px-MW-place-Seyda_Neen.jpg" style="width: 100%; height: auto; margin-bottom: 10px;" alt="Seyda Neen, the port town you start in on Vvardenfell. It looks like a place where you would get scurvy.">
Browse through Vvardenfell using Stone Tablets.
`;

export default class LorePanel {
	/** @type {Wnd | null} */
	wnd = null;
	constructor() {
	}
	static handleLink(event) {
		event.preventDefault();
		event.stopPropagation();

		const rune = /** @type {HTMLElement} */ (event.currentTarget || event.target);
		const query = rune.textContent.trim();
		if (!query)
			return;

		const article = LorePanel.findBestArticle(query);
		if (!article)
			return;

		const title = article ? article.title : query;
		const body = article
			? LorePanel.articleMarkup(article.value)
			: `<p>No canon article found for <strong>${LorePanel.escapeHtml(query)}</strong>.</p>`;

		const card = new WndCard(
			title,
			`<div style="display: flex; flex-direction: column;">
			${title}
			<div class="rn-divider"></div>
			<div class="rn-scroll">${body}</div>
			</div>`,
			{
				width: 360,
				height: 240
			});

		if (card)
			card.moveWithinTranslateTerritory(
				event.clientX - window.innerWidth / 2,
				event.clientY - window.innerHeight / 2);

		if (card) {
			LorePanel.linkifyArticles(card.wndContent, title);
			LorePanel.bindRunes(card.wndContent);
		}

		const parentWndEl = /** @type {(HTMLElement & { _wndInstance?: Wnd }) | null} */ (rune.closest('.rn-wnd'));
		const parentWnd = parentWndEl && parentWndEl._wndInstance;
		if (parentWnd && card)
			parentWnd.addChild(card);
	}

	/**
	 * @typedef {{
	 *   name?: string,
	 *   type?: string,
	 *   summary?: string,
	 *   region?: string,
	 *   related?: string[],
	 *   tags?: string[]
	 * }} LoreEntry
	 */
	/** @typedef {{ title: string, value: LoreEntry } } Article */

	/**
	 * @param {string} query
	 * @returns {Article | null}
	 */
	static findBestArticle(query) {
		const normalizedQuery = query.toLowerCase().trim();

		/** @type {Article | null} */
		let best = null;
		let bestScore = 0;

		function visit(value, path = []) {
			if (Array.isArray(value)) {
				value.forEach((item, index) => visit(item, [...path, String(index)]));
				return;
			}
			if (!value || typeof value !== 'object')
				return;

			const label = typeof value.name === 'string'
				? value.name
				: path[path.length - 1];
			if (label) {
				const normalizedLabel = label.toLowerCase().replace(/_/g, ' ');
				let score = 0;
				if (normalizedLabel === normalizedQuery)
					score = 100;
				else if (normalizedLabel.includes(normalizedQuery) || normalizedQuery.includes(normalizedLabel))
					score = 60;
				else {
					const matchingWords = normalizedQuery.split(/\s+/)
						.filter((word) => word.length > 2 && normalizedLabel.includes(word));
					score = matchingWords.length * 10;
				}
				if (score > bestScore) {
					bestScore = score;
					best = { title: label.replace(/_/g, ' '), value: /** @type {LoreEntry} */ (value) };
				}
			}

			Object.entries(value).forEach(([key, child]) => {
				if (key !== 'name')
					visit(child, [...path, key]);
			});
		}

		visit(Sheogorad.lore);
		return best;
	}

	/**
	 * Collects every lore article name, longest first so greedy matching prefers full names.
	 * @returns {string[]}
	 */
	static collectArticleNames() {
		const names = new Set();

		function visit(value) {
			if (Array.isArray(value)) {
				value.forEach((item) => visit(item));
				return;
			}
			if (!value || typeof value !== 'object')
				return;

			if (typeof value.name === 'string')
				names.add(value.name);

			Object.entries(value).forEach(([key, child]) => {
				if (key !== 'name')
					visit(child);
			});
		}

		visit(Sheogorad.lore);
		return [...names].sort((a, b) => b.length - a.length);
	}

	/**
	 * Walks the text nodes of a rendered container and wraps any word/phrase matching a
	 * known lore article name in an <rn-link> tag, so it becomes a clickable lore link.
	 * @param {HTMLElement} container
	 * @param {string} [excludeName] Article name to skip, e.g. the article currently being viewed.
	 */
	static linkifyArticles(container, excludeName) {
		const names = LorePanel.collectArticleNames()
			.filter((name) => !excludeName || name.toLowerCase() !== excludeName.toLowerCase());
		if (!names.length)
			return;

		const pattern = new RegExp(
			`\\b(${names.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
			'gi');

		const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
			acceptNode(node) {
				const parentTag = node.parentElement && node.parentElement.tagName.toLowerCase();
				if (parentTag && parentTag.startsWith('rn-'))
					return NodeFilter.FILTER_REJECT;
				return (node.textContent || '').trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
			}
		});

		/** @type {Text[]} */
		const textNodes = [];
		let current;
		while ((current = walker.nextNode()))
			textNodes.push(/** @type {Text} */ (current));

		textNodes.forEach((textNode) => {
			const text = textNode.textContent;
			pattern.lastIndex = 0;
			if (!pattern.test(text))
				return;
			pattern.lastIndex = 0;

			const fragment = document.createDocumentFragment();
			let lastIndex = 0;
			let match;
			while ((match = pattern.exec(text))) {
				if (match.index > lastIndex)
					fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));

				const link = document.createElement('rn-link');
				link.textContent = match[0];
				fragment.appendChild(link);

				lastIndex = match.index + match[0].length;
			}
			if (lastIndex < text.length)
				fragment.appendChild(document.createTextNode(text.slice(lastIndex)));

			textNode.replaceWith(fragment);
		});
	}

	static articleMarkup(value) {
		const summary = value.summary
			? `<span class="lore-entry-summary">${LorePanel.escapeHtml(value.summary)}</span>`
			: '';
		return `<article class="lore-entry">${summary}</article>`;
	}

	static escapeHtml(value) {
		return value.replace(/[&'"]/g, (character) => ({
			'&': '&amp;',
			//'<': '&lt;',
			//'>': '&gt;',
			"'": '&#39;',
			'"': '&quot;'
		}[character]));
	}
	// Makes <rn-*> elements inside lore panel content clickable lore links
	static bindRunes(contentContainer) {
		contentContainer.querySelectorAll('*').forEach((element) => {
			if (!element.tagName.toLowerCase().startsWith('rn-') || element.dataset.loreBound)
				return;
			element.addEventListener('click', (event) => LorePanel.handleLink(event));
			element.dataset.loreBound = 'true';
		});
	}
	ensureWnd() {
		if (!this.wnd || this.wnd.isDestroyed) {
			this.wnd = new WndCard(
				`Tome of Info`,
				`<div class="rn-bordered rn-scroll">${swathOfText}</div>`,
				{ width: 400, height: 250 });
				this.wnd.moveTo(0, -250);
				LorePanel.linkifyArticles(this.wnd.wndContent);
				LorePanel.bindRunes(this.wnd.wndContent);
		}
	}
	close() {
		if (this.wnd) {
			this.wnd.close();
		}
	}
	setContent(content) {
		const mate = `<div class="rn-bordered rn-scroll">${swathOfText}</div>`;
	}

}