/*
 * This is a kind of Wnd but it's just a Card.
 */

import Wnd from "./wnd.js";

export default class WndCard {

    /** @type {Wnd | null} */
    wnd = null;

    constructor(title, content, options = {}) {
        this.wnd = new Wnd(title, content, { ...options, wndcard: true });

        if (!this.wnd.el)
            return;

        this.wnd.el.removeAttribute('closable');
        this.wnd.el.removeAttribute('minimizable');
        this.wnd.el.querySelectorAll('.rune-title-bar-button').forEach((button) => button.remove());
    }
}