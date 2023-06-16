import i18next from "i18next";
import { Container, Text } from "pixi.js";
import { ScaleHelper } from "../../engine/utils/ScaleHelper";

export class GUI extends Container {
	private scoreText: Text;
	constructor() {
		super();

		this.scoreText = new Text(`${i18next.t("score")}0`, { fontFamily: "Rounded Elegance", fontSize: 50, fill: 0xffffff, align: "center" });
		this.addChild(this.scoreText);
	}

	public setScore(score: number): void {
		this.scoreText.text = `${i18next.t("score")}${score}`;
	}

	public onResize(_w: number, h: number): void {
		const scale: number = ScaleHelper.screenScale1D(this.scoreText.getLocalBounds().height, h, 0.05);
		this.scoreText.scale.set(scale);
		this.scoreText.position.set(10 * scale);
	}
}
