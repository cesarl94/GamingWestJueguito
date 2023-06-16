import { Sprite } from "pixi.js";
import type { IScene } from "../../engine/scenemanager/IScene";
import { PixiScene } from "../../engine/scenemanager/scenes/PixiScene";
import { ScaleHelper } from "../../engine/utils/ScaleHelper";
import { GUI } from "../gameplay/GUI";
import { Game, GameEvents } from "../gameplay/Game";

export class GameScene extends PixiScene {
	public static readonly BUNDLES = ["package-1", "sfx", "music"];
	private game: Game;
	private gui: GUI;

	private fondo: Sprite;

	constructor() {
		super();

		this.fondo = Sprite.from("fondo");
		this.fondo.anchor.set(0.5);
		this.addChild(this.fondo);

		this.game = new Game();
		this.addChild(this.game);

		this.gui = new GUI();
		this.addChild(this.gui);

		// @ts-expect-error
		this.game.on(GameEvents.UPDATE_SCORE, (score: number) => {
			this.gui.setScore(score);
		});

		this.pauseUpdateOnFocusLost = false;
		this.pauseTweenOnFocusLost = false;
	}

	public override update(dt: number): void {
		this.game.update(dt);
	}

	public override onResize(w: number, h: number): void {
		ScaleHelper.setScaleRelativeToScreen(this.fondo, w, h, 1, 1, Math.max);
		this.fondo.position.set(w / 2, h / 2);

		ScaleHelper.setScaleRelativeToScreen(this.game, w, h, 1, 1);
		this.game.position.set(w / 2 - this.game.width / 2, h / 2 - this.game.height / 2);

		this.gui.onResize(w, h);
	}

	public override onDestroy(_navigatingTo: new (...args: any[]) => IScene): void {
		this.game.onDestroy();
	}
}
