import Sheogorad from "./sheogorad.js";
import Wnd from "./wnd.js";

const swathOfText = `
<img src="https://images.uesp.net/thumb/6/65/MW-place-Seyda_Neen.jpg/1600px-MW-place-Seyda_Neen.jpg" style="width: 100%; height: auto; margin-bottom: 10px;" alt="Seyda Neen, the port town you start in on Vvardenfell. It looks like a place where you would get scurvy.">
Vvardenfell is what happens when a volcano decides it wants to run a country and everyone else just kind of… adapts.
<p>
At the center sits Red Mountain, eternally coughing up ash like it’s got a 4,000-year smoking habit. The sky is either “mildly apocalyptic beige” or “actively trying to sandblast your face off.” Locals call this weather. Visitors call it a mistake.
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
	wnd = null;
	constructor() {
	}
	tryMake() {
		if (!this.wnd || this.wnd.isDestroyed) {
		this.wnd = new Wnd(
			`Lore Panel`,
			`<div class="darkstone-inner darkstone-inner-scroll">${swathOfText}</div>`,
			{ width: 400, height: 200 });
		}
	}
	close() {
		if (this.wnd) {
			this.wnd.close();
		}
	}
	
}