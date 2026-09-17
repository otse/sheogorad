/*
 * This is a kind of Wnd but it's just a Card.
 */

import Wnd from "./wnd.js";

export default class WndCard extends Wnd {

    constructor(title, content, options = {}) {
        super(title, content, { ...options, wndcard: true });

        if (!this.el)
            return;

        this.el.removeAttribute('closable');
        this.el.removeAttribute('minimizable');
        this.el.querySelectorAll('.rn-title-bar-button').forEach((button) => button.remove());
    }
}