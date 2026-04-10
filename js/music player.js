import Sheogorad from "./sheogorad.js";
import Wnd from "./wnd.js";

export default class MusicPlayer {
	constructor() {
		this.wnd = new Wnd(
			`${this.icon} ${formatNpcName(this.name)}`,
			`Details about ${formatNpcName(this.name)}`,
			{ width: 200, height: 100 });
	}
}