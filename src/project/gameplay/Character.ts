import { Container, Texture } from "pixi.js";
import { StateMachineAnimator } from "../../engine/animation/StateMachineAnimation";
import { Tween } from "tweedle.js";
import { BOARD_SIZE } from "../utils/constants";

export class Character extends Container {
	private animation: StateMachineAnimator;

	private lastPlay: string;
	private movingTween: Tween<any>;
	public get isMoving(): boolean {
		return this.movingTween != null;
	}
	public get currentAnimation(): string {
		return this.lastPlay;
	}
	private blocked: boolean;

	constructor() {
		super();

		this.animation = new StateMachineAnimator(true);

		/* eslint-disable */
		this.animation.addState("attack", this.getTexturesByID([[0, 0], [1, 0], [2, 0]]), 10, false);
		this.animation.addState("walkRight", this.getTexturesByID([[0, 1], [1, 1], [2, 1]]), 10, true);
		this.animation.addState("walkLeft", this.getTexturesByID([[0, 2], [1, 2], [2, 2]]), 10, true);
		this.animation.addState("idle", this.getTexturesByID([[2, 3]]), 10, false);
		this.animation.addState("waiting", this.getTexturesByID([[2, 4]]), 10, false);
		this.animation.addState("waitingToIdleRight", this.getTexturesByID([[2, 1], [0, 3], [1, 3], [2, 3]]), 10, false);
		this.animation.addState("waitingToIdleLeft", this.getTexturesByID([[2, 2], [0, 4], [1, 4], [2, 3]]), 10, false);
		this.animation.addState("walkRightToIdle", this.getTexturesByID([[0, 3], [1, 3], [2, 3]]), 10, false);
		this.animation.addState("walkLeftToIdle", this.getTexturesByID([[0, 4], [1, 4], [2, 3]]), 10, false);
		this.animation.addState("aimingRight", this.getTexturesByID([[1, 3], [0, 3], [2, 1], [0, 0]]), 10, false);
		this.animation.addState("aimingLeft", this.getTexturesByID([[1, 4], [0, 4], [2, 2], [0, 0]]), 10, false);
		this.animation.addState("fallDown", this.getTexturesByID([[0, 5]]), 10, false);
		/* eslint-enable */

		const frame: Texture = Texture.from("package-1/character/raven-01-01.png");
		this.animation.position.set(frame.width * -0.5, frame.height * -0.5);

		this.addChild(this.animation);
		this.lastPlay = "idle";
		this.blocked = false;
		this.animation.playState(this.lastPlay);
	}

	private getTexturesByID(ids: Array<[number, number]>): Array<Texture> {
		const rv: Array<Texture> = new Array<Texture>(ids.length);

		for (let i = 0; i < ids.length; i++) {
			const x: string = (ids[i][0] + 1).toString().padStart(2, "0");
			const y: string = (ids[i][1] + 1).toString().padStart(2, "0");
			rv[i] = Texture.from(`package-1/character/raven-${x}-${y}.png`);
		}

		return rv;
	}

	public reset(): void {
		this.animation.playState(this.lastPlay);
		this.position.set(BOARD_SIZE.x * 0.5, BOARD_SIZE.y);
	}

	public playAnimation(name: string, onComplete?: () => void, aux: string = "Right"): void {
		if (this.blocked) {
			return;
		}
		if (name == "idle") {
			switch (this.lastPlay) {
				case "walkLeft":
					name = "walkLeftToIdle";
					break;
				case "walkRight":
					name = "walkRightToIdle";
					break;
				case "waiting":
					name = `waitingToIdle${aux}`;
					break;
			}
		}
		this.lastPlay = name;
		this.animation.playState(name);
		this.animation.onComplete = onComplete;
	}

	public moveTo(xPosition: number, onArrive?: Function): void {
		const difference: number = xPosition - this.x;
		this.movingTween = new Tween(this.position)
			.to({ x: xPosition }, Math.abs(difference) * 5)
			.onComplete(() => {
				this.movingTween = null;
				if (onArrive != null) {
					onArrive();
				}
			})
			.start();

		this.playAnimation(`walk${difference < 0 ? "Left" : "Right"}`);
	}

	public fallDown(): void {
		this.movingTween?.stop();
		this.movingTween = null;
		this.playAnimation("idle", () => {
			this.blocked = false;
			this.playAnimation("fallDown");
			this.blocked = true;
		});
		this.blocked = true;
	}

	public getUp(xPosition: number): void {
		this.blocked = false;
		if (Math.abs(this.x - xPosition) > 1) {
			this.moveTo(xPosition, () => {
				this.playAnimation("idle");
			});
		} else {
			this.playAnimation("idle");
		}
	}
}
