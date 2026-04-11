import Sheogorad from "./sheogorad.js";
import Wnd from "./wnd.js";

export default class MusicPlayer {
	constructor() {
		this.wnd = new Wnd(
			`Music Player`,
			`Yes`,
			{ width: 200, height: 100 });
	}
}