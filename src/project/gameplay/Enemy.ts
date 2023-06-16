import type { IPointData } from "pixi.js";
import { Container, Sprite } from "pixi.js";
import { CELL_SIZE } from "../utils/constants";
import { Box2DCategoryBits, Box2DMaskBits } from "./Game";
import { ProgressBar } from "@pixi/ui";
import { Box2DBodyType, Box2DHelper } from "../../engine/utils/Box2DHelper";

export enum EnemyEvents {
	DIE = "die",
}

export class Enemy extends Container {
	public readonly body: Box2D.b2Body;
	public readonly type: "A" | "B";

	private totalHealth: number;
	private health: number;

	public gridPos: IPointData;

	private progressBar: ProgressBar;

	constructor(gridPos: IPointData) {
		super();

		this.gridPos = gridPos;
		this.type = Math.random() < 0.5 ? "A" : "B";

		this.totalHealth = this.type == "A" ? 1 : 2;
		this.health = this.totalHealth;

		const sprite: Sprite = Sprite.from(`package-1/normalEnemy${this.type == "A" ? "Even" : "Odd"}.png`);
		sprite.anchor.set(0.5);
		this.addChild(sprite);

		this.width = CELL_SIZE.x;
		this.height = CELL_SIZE.y;

		this.body = Box2DHelper.createBoxBody({
			displayObject: this,
			isSensor: false,
			mass: 1,
			size: { width: CELL_SIZE.x, height: CELL_SIZE.y },
			type: Box2DBodyType.Kinematic,
			categoryBits: Box2DCategoryBits.ENEMIES,
			maskBits: Box2DMaskBits.ENEMIES,
		});

		this.progressBar = new ProgressBar({
			bg: Sprite.from("package-1/healthBarBackground.png"),
			fill: Sprite.from("package-1/healthBar.png"),
			progress: 100,
		});
		this.progressBar.width = sprite.texture.width;
		this.progressBar.position.set(-256, -256 * 1.15);

		this.progressBar.visible = this.type == "B";

		this.addChild(this.progressBar);
	}

	public updateGridPos(gridPos: IPointData): void {
		this.gridPos = gridPos;
	}

	public hit(): void {
		this.health--;
		this.progressBar.progress = (this.health / this.totalHealth) * 100;
		if (this.health <= 0) {
			// @ts-expect-error
			this.emit(EnemyEvents.DIE);
		}
	}
}
