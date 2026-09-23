// 🧙‍♀️ Code magic within

import Sheogorad from "../sheogorad.js";
import Wnd from "../wnd.js";
import WndCard from "../wnd card.js";
import Wndd from "../wndd.js";

const swathOfText = `
<img src="art/638b44a70bc44ac4ad982110203105d5-74ec7314ca1a4b69.png" style="width: 100%; height: auto; margin-bottom: 10px;" alt="Seyda Neen, the port town you start in on Vvardenfell. It looks like a place where you would get scurvy.">
Browse through Vvardenfell using Stone Tablets.
`;

export default class LorePanel extends Wndd {
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

		const card = new WndCard(
			article.title,
			`<div style="display: flex; flex-direction: column;">
			${article.title}
			<div class="rn-divider"></div>
			<div class="rn-scroll">${LorePanel.articleMarkup(article.value)}</div>
			</div>`,
			{
				width: 360,
				height: 240
			});

		card.moveWithinTranslateTerritory(
			event.clientX - window.innerWidth / 2,
			event.clientY - window.innerHeight / 2);

		LorePanel.linkifyArticles(card.wndContent, article.title);
		LorePanel.bindRunes(card.wndContent);

		const parentWndEl = /** @type {(HTMLElement & { _wndInstance?: Wnd }) | null} */ (rune.closest('.rn-wnd'));
		const parentWnd = parentWndEl && parentWndEl._wndInstance;
		if (parentWnd)
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

	/** @type {Map<string, Article> | null} */
	static _articleIndex = null;

	/**
	 * Walks the lore tree once and caches every named entry, keyed by lowercased name.
	 * @returns {Map<string, Article>}
	 */
	static articleIndex() {
		if (LorePanel._articleIndex)
			return LorePanel._articleIndex;

		const index = new Map();

		function visit(value) {
			if (Array.isArray(value)) {
				value.forEach((item) => visit(item));
				return;
			}
			if (!value || typeof value !== 'object')
				return;

			if (typeof value.name === 'string') {
				const key = value.name.toLowerCase();
				if (!index.has(key))
					index.set(key, { title: value.name, value: /** @type {LoreEntry} */ (value) });
			}

			Object.entries(value).forEach(([key, child]) => {
				if (key !== 'name')
					visit(child);
			});
		}

		visit(Sheogorad.lore);
		LorePanel._articleIndex = index;
		return index;
	}

	/**
	 * @param {string} query
	 * @returns {Article | null}
	 */
	static findBestArticle(query) {
		return LorePanel.articleIndex().get(query.toLowerCase().trim()) || null;
	}

	/**
	 * Every lore article name, longest first so greedy matching prefers full names.
	 * @returns {string[]}
	 */
	static collectArticleNames() {
		return [...LorePanel.articleIndex().values()]
			.map((article) => article.title)
			.sort((a, b) => b.length - a.length);
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
	_create() {
		const wnd = new WndCard(
			`Tome of Info`,
			`<div class="rn-bordered rn-scroll">${swathOfText}</div>`,
			{ width: 400, height: 310 });
		wnd.moveTo(0, -250);
		LorePanel.linkifyArticles(wnd.wndContent);
		LorePanel.bindRunes(wnd.wndContent);
		return wnd;
	}
}