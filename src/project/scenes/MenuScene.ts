import { Container } from "pixi.js";
import { Sprite } from "pixi.js";
import { PixiScene } from "../../engine/scenemanager/scenes/PixiScene";
import { Button } from "@pixi/ui";
import { Manager } from "../..";
import { ScaleHelper } from "../../engine/utils/ScaleHelper";
import { GameScene } from "./GameScene";

export class MenuScene extends PixiScene {
	public static readonly BUNDLES = ["package-1", "sfx", "music"];

	private generalContainer: Container;
	private playButton: Button;
	private glow: Sprite;

	constructor() {
		super();

		this.generalContainer = new Container();
		this.addChild(this.generalContainer);

		this.glow = Sprite.from("package-1/glow.png");
		this.glow.anchor.set(0.5);
		this.glow.alpha = 0.3;
		this.generalContainer.addChild(this.glow);

		const playButtonSpr: Sprite = Sprite.from("package-1/btn_play.png");
		playButtonSpr.anchor.set(0.5);
		this.playButton = new Button(playButtonSpr);

		this.playButton.onPress.connect(() => {
			Manager.changeScene(GameScene);
		});

		this.generalContainer.addChild(this.playButton.view);
	}

	public override update(_dt: number): void {
		this.glow.rotation += _dt * 0.0001;
	}

	public override onResize(_newW: number, _newH: number): void {
		ScaleHelper.setScaleRelativeToScreen(this.generalContainer, _newW, _newH, 0.7, 0.7);
		this.generalContainer.position.set(_newW / 2, _newH / 2);
	}
}
