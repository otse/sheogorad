// 🧙‍♀️ Code magic within

import Sheogorad from "./sheogorad.js";
import Wnd from "./wnd.js";
import WndCard from "./wnd card.js";

const swathOfText = `
<img src="https://images.uesp.net/thumb/6/65/MW-place-Seyda_Neen.jpg/1600px-MW-place-Seyda_Neen.jpg" style="width: 100%; height: auto; margin-bottom: 10px;" alt="Seyda Neen, the port town you start in on Vvardenfell. It looks like a place where you would get scurvy.">
Vvardenfell is what happens when a volcano decides it wants to run a country and everyone else just kind of… adapts.
<p>
At the center sits <rune-link>Red Mountain</rune-link>, eternally coughing up ash like it’s got a 4,000-year smoking habit. The sky is either “mildly apocalyptic beige” or “actively trying to sandblast your face off.” Locals call this weather. Visitors call it a mistake.
<p>
The architecture looks like it was designed by five different species who refused to share notes. You’ve got giant bug-shell houses, fungal skyscrapers grown like cursed vegetables, and Vivec City—a floating stack of concrete blocks that feels like brutalism had a religious awakening.
<p>
Transportation? Giant fleas. Yes, the native taxi system is a screaming insect you climb into while questioning every life choice that led you there.
<p>
Wildlife ranges from “annoying crab with commitment issues” to “why is that dinosaur yelling at me?” Meanwhile, the locals—primarily the Dunmer—maintain a calm, judgmental vibe, as if you personally caused the ash storms.
<p>
Religion is intense, politics are messier than the terrain, and everyone seems involved in at least one prophecy whether they like it or not.
<p>
In short, Vvardenfell is a dusty, hostile, strangely beautiful fever dream where the bugs are big, the gods are bigger, and the weather absolutely hates you. And somehow… you’ll miss it when you leave.
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

		new WndCard(title, `<div class="rune-scroll">${body}</div>`, {
			width: 360,
			height: 240
		});
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

	static articleMarkup(value) {
		const title = value.name ? `<h1>${LorePanel.escapeHtml(value.name)}</h1>` : '';
		const type = value.type
			? `<div class="lore-entry-type">${LorePanel.escapeHtml(value.type)}</div>`
			: '';
		const summary = value.summary
			? `<p class="lore-entry-summary">${LorePanel.escapeHtml(value.summary)}</p>`
			: '';
		const region = value.region
			? `<p class="lore-entry-region">Region: <rune-link>${LorePanel.escapeHtml(value.region)}</rune-link></p>`
			: '';
		const related = value.related?.length
			? `<section><h2>Related</h2><div class="lore-entry-links">${value.related
				.map((entry) => `<rune-link>${LorePanel.escapeHtml(entry)}</rune-link>`)
				.join('')}</div></section>`
			: '';
		const tags = value.tags?.length
			? `<section><h2>Tags</h2><div class="lore-entry-tags">${value.tags
				.map((tag) => `<span>${LorePanel.escapeHtml(tag)}</span>`)
				.join('')}</div></section>`
			: '';

		return `<article class="lore-entry">${title}${type}${summary}${region}${related}${tags}</article>`;
	}

	static escapeHtml(value) {
		return value.replace(/[&<>'"]/g, (character) => ({
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			"'": '&#39;',
			'"': '&quot;'
		}[character]));
	}
	ensureWnd() {
		if (!this.wnd || this.wnd.isDestroyed) {
		this.wnd = new Wnd(
			`Lore Panel`,
			`<div class="rune-inner rune-scroll">${swathOfText}</div>`,
			{ width: 400, height: 600 });
		}
	}
	close() {
		if (this.wnd) {
			this.wnd.close();
		}
	}
	setContent(content) {
		const mate = `<div class="rune-inner rune-scroll">${swathOfText}</div>`;
	}
	
}