

// 🧙‍♀️ Code magic within

import Sheogorad from "../sheogorad.js";
import Menu from "../menu.js";
import MenuBase from "../menu-base.js";

export default class MenuThingsToDo extends MenuBase {
	hasNewData() {
		return false;
	}
	_create() {
		const template = /** @type {HTMLTemplateElement} */ (document.getElementById('things-to-do-wnd-template'));
		const clone = /** @type {DocumentFragment} */ (template.content.cloneNode(true));

		const wnd = new Menu(
			`Things To Do`,
			clone,
			{ width: 400, height: 310 });
		wnd.moveTo(0 - 400 / 2, 0 - 310 / 2);
		return wnd;
	}
}