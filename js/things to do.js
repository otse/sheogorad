

// 🧙‍♀️ Code magic within

import Sheogorad from "./sheogorad.js";
import Wnd from "./wnd.js";

export default class ThingsToDo {
    /** @type {Wnd | null} */
    wnd = null;

    ensureWnd() {
        if (!this.wnd || this.wnd.isDestroyed) {
            const thingsToDoPanel = /** @type {HTMLTemplateElement} */
                (document.getElementById('things-to-do-wnd-template'));

            const clone = /** @type {DocumentFragment} */
                (thingsToDoPanel.content.cloneNode(true));

            this.wnd = new Wnd(
                `Things To Do`,
                clone,
                { width: 400, height: 310 });
            this.wnd.moveTo(400, 100);
        }
    }
}