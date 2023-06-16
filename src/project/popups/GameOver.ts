import { Container, Rectangle } from "pixi.js";
import type { Graphics } from "pixi.js";
import { Text } from "pixi.js";
import { PixiScene } from "../../engine/scenemanager/scenes/PixiScene";
import { GraphicsHelper } from "../../engine/utils/GraphicsHelper";
import { ScaleHelper } from "../../engine/utils/ScaleHelper";
import i18next from "i18next";
import { Button } from "@pixi/ui";
import { Easing, Tween } from "tweedle.js";

export class GameOver extends PixiScene {
	public static readonly BUNDLES = ["package-1", "sfx", "music"];

	private inputsBlocker: Container;
	private container: Container;

	constructor(score: number) {
		super();

		this.inputsBlocker = new Container();
		this.inputsBlocker.eventMode = "static";
		this.addChild(this.inputsBlocker);

		this.container = new Container();
		this.addChild(this.container);

		const bg: Graphics = GraphicsHelper.roundedRect(500, 300, 25, 0xda8c3e);
		this.container.addChild(bg);

		const bg2: Graphics = GraphicsHelper.roundedRect(460, 100, 25, 0x8c5a2e);
		bg2.position.set(20, 20);
		this.container.addChild(bg2);

		const title: Text = new Text(i18next.t("gameOver"), { fontFamily: "Rounded Elegance", fontSize: 50, fill: 0, align: "center" });
		title.anchor.set(0.5);
		title.position.set(bg.width * 0.5, 20 + bg2.height * 0.5);
		this.container.addChild(title);

		const scoreText: Text = new Text(i18next.t("yourScore") + score.toString(), { fontFamily: "Rounded Elegance", fontSize: 35, fill: 0, align: "center" });
		scoreText.anchor.set(0.5);
		scoreText.position.set(bg.width * 0.5, 20 + bg2.height + 20 + scoreText.height * 0.5);
		this.container.addChild(scoreText);

		const restartContainer: Container = new Container();

		const restartBg: Graphics = GraphicsHelper.roundedRect(200, 50, 25, 0x8c5a2e);
		restartBg.pivot.set(restartBg.width * 0.5, restartBg.height * 0.5);
		restartContainer.addChild(restartBg);

		const restartText: Text = new Text(i18next.t("restart"), { fontFamily: "Rounded Elegance", fontSize: 25, fill: 0, align: "center" });
		restartText.anchor.set(0.5);
		restartContainer.addChild(restartText);

		restartContainer.position.set(bg.width * 0.5, bg.height - 20 - restartContainer.height * 0.5);
		this.container.addChild(restartContainer);

		const restartButton = new Button(restartContainer);

		this.container.pivot.set(this.container.width * 0.5, this.container.height * 0.5);

		restartButton.onPress.connect(() => {
			// @ts-expect-error
			this.emit("restart");
		});

		new Tween(this.container)
			.to({ scale: { x: 1, y: 1 } }, 500)
			.from({ scale: { x: 0, y: 0 } })
			.start()
			.easing(Easing.Elastic.Out);
	}

	public override onResize(w: number, h: number): void {
		this.inputsBlocker.hitArea = new Rectangle(0, 0, w, h);
		ScaleHelper.setScaleRelativeToScreen(this.container, w, h, 0.5, 0.3);
		this.container.position.set(w / 2, h / 2);
	}
}
