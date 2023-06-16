import type { FederatedPointerEvent, Graphics, IPointData, Point } from "pixi.js";
import { Container, Sprite } from "pixi.js";
import { GraphicsHelper } from "../../engine/utils/GraphicsHelper";
import { Character } from "./Character";
import { BOARD_SIZE, CELL_SIZE, GRID_SIZE } from "../utils/constants";
import { Tween } from "tweedle.js";
import { Enemy, EnemyEvents } from "./Enemy";
import Random from "../../engine/random/Random";
import { Manager } from "../..";
import { GameOver } from "../popups/GameOver";
import type { Box2DContact, Box2DPostSolveContact, Box2DPreSolveContact } from "../../engine/utils/Box2DHelper";
import { Box2DBodyType, Box2DHelper } from "../../engine/utils/Box2DHelper";

// https://aurelienribon.wordpress.com/2011/07/01/box2d-tutorial-collision-filtering/
export enum Box2DCategoryBits {
	GROUND = 0x0001,
	WALLS_AND_CEIL = 0x0002,
	ENEMIES = 0x0004,
	BALL = 0x008,
	AIM_RAYCAST = 0x0010,
}
// https://aurelienribon.wordpress.com/2011/07/01/box2d-tutorial-collision-filtering/
export enum Box2DMaskBits {
	GROUND = Box2DCategoryBits.BALL,
	WALLS_AND_CEIL = Box2DCategoryBits.BALL,
	ENEMIES = Box2DCategoryBits.BALL,
	BALL = Box2DCategoryBits.GROUND | Box2DCategoryBits.WALLS_AND_CEIL | Box2DCategoryBits.ENEMIES,
	AIM_RAYCAST = Box2DCategoryBits.WALLS_AND_CEIL | Box2DCategoryBits.ENEMIES,
}

export enum GameEvents {
	/** This event is emitted with a number that represents the score */
	UPDATE_SCORE = "updateScore",
}

export class Game extends Container {
	private background: Graphics;
	private grid: Sprite;
	private margins: number;

	private character: Character;

	private ball: Graphics;

	private ground: Box2D.b2Body;
	private leftWall: Box2D.b2Body;
	private rightWall: Box2D.b2Body;
	private ceil: Box2D.b2Body;

	private aiming: boolean;
	private aim: Container;

	private enemiesGrid: Array<Array<Enemy>>;
	private enemies: Array<Enemy>;

	private score: number;

	constructor() {
		super();

		this.aiming = false;

		this.grid = Sprite.from("package-1/cellBackground.png");
		this.grid.width = BOARD_SIZE.x;
		this.grid.height = BOARD_SIZE.y;

		this.background = GraphicsHelper.pixel(0x954425);

		this.margins = 50 * this.grid.scale.x;
		this.background.scale.set(this.grid.width + this.margins * 2, this.grid.height + this.margins * 2);
		this.grid.position.set(this.margins);
		this.grid.eventMode = "static";
		this.grid.on("pointerdown", this.onPointerDown.bind(this));
		this.grid.on("pointermove", this.onPointerMove.bind(this));
		this.grid.on("pointerup", this.onPointerUp.bind(this));
		this.grid.on("pointerupoutside", this.onPointerUp.bind(this));

		Box2DHelper.createb2World({ x: 0, y: 0 });

		this.character = new Character();
		this.character.scale.set(1 / 30);

		const ballRadius: number = 0.15;

		this.ball = GraphicsHelper.circle(0, 0, 15, 0x000000);
		this.ball.scale.set(0.01);

		const ballInternal: Graphics = GraphicsHelper.circle(0, 0, 7.5, 0xaa0000);
		this.ball.addChild(ballInternal);

		this.enemiesGrid = new Array<Array<Enemy>>(GRID_SIZE.x);
		for (let i = 0; i < GRID_SIZE.x; i++) {
			this.enemiesGrid[i] = new Array<Enemy>(GRID_SIZE.y);
		}
		this.enemies = new Array<Enemy>();

		this.aim = new Container();

		const aimGraphic: Graphics = GraphicsHelper.pixel(0xffffff);
		aimGraphic.scale.y = 1 / 60;
		aimGraphic.scale.x = Math.sqrt(BOARD_SIZE.x * BOARD_SIZE.x + BOARD_SIZE.y * BOARD_SIZE.y);
		this.aim.addChild(aimGraphic);
		this.aim.visible = false;

		const aimMask: Graphics = GraphicsHelper.pixel(0xffffff);
		aimMask.scale.set(BOARD_SIZE.x, BOARD_SIZE.y);
		aimMask.position.set(this.margins);
		this.addChild(aimMask);
		this.aim.mask = aimMask;

		Box2DHelper.createCircleBody({
			type: Box2DBodyType.Dynamic,
			initialPosition: { x: this.character.x, y: this.character.y },
			radius: ballRadius,
			isSensor: false,
			mass: 5,
			restitution: 1,
			displayObject: this.ball,
			categoryBits: Box2DCategoryBits.BALL,
			maskBits: Box2DMaskBits.BALL,
			onBeginContact: this.onBallBeginContact.bind(this),
			onEndContact: this.onBallEndContact.bind(this),
			onPreSolve: this.onBallPreSolve.bind(this),
			onPostSolve: this.onBallPostSolve.bind(this),
		});

		this.ground = Box2DHelper.createBoxBody({
			type: Box2DBodyType.Static,
			initialPosition: { x: this.background.scale.x * 0.5, y: this.grid.height + this.margins * 1.5 + ballRadius * 0.5 },
			size: { width: this.background.scale.x, height: this.margins - ballRadius },
			isSensor: true,
			mass: 0,
			displayObject: GraphicsHelper.pixel(0, 0),
			categoryBits: Box2DCategoryBits.GROUND,
			maskBits: Box2DMaskBits.GROUND,
		});

		this.leftWall = Box2DHelper.createBoxBody({
			type: Box2DBodyType.Static,
			initialPosition: { x: this.margins * 0.5, y: this.background.scale.y * 0.5 },
			size: { width: this.margins, height: this.background.scale.y },
			isSensor: false,
			mass: 0,
			displayObject: GraphicsHelper.pixel(0, 0),
			categoryBits: Box2DCategoryBits.WALLS_AND_CEIL,
			maskBits: Box2DMaskBits.WALLS_AND_CEIL,
		});

		this.rightWall = Box2DHelper.createBoxBody({
			type: Box2DBodyType.Static,
			initialPosition: { x: this.grid.width + this.margins * 1.5, y: this.background.scale.y * 0.5 },
			size: { width: this.margins, height: this.background.scale.y },
			isSensor: false,
			mass: 0,
			displayObject: GraphicsHelper.pixel(0, 0),
			categoryBits: Box2DCategoryBits.WALLS_AND_CEIL,
			maskBits: Box2DMaskBits.WALLS_AND_CEIL,
		});

		this.ceil = Box2DHelper.createBoxBody({
			type: Box2DBodyType.Static,
			initialPosition: { x: this.background.scale.x * 0.5, y: this.margins * 0.5 },
			size: { width: this.background.scale.x, height: this.margins },
			isSensor: false,
			mass: 0,
			displayObject: GraphicsHelper.pixel(0, 0),
			categoryBits: Box2DCategoryBits.WALLS_AND_CEIL,
			maskBits: Box2DMaskBits.WALLS_AND_CEIL,
		});

		this.addChild(this.background);
		this.addChild(this.grid);
		this.addChild(this.ball);
		this.addChild(this.aim);
		this.addChild(this.character);

		this.restartGame();
	}

	public update(dt: number): void {
		Box2DHelper.update(dt);
	}

	private onPointerDown(e: FederatedPointerEvent): void {
		if (this.aiming) {
			return;
		}

		this.aiming = true;
		this.aim.visible = true;
		this.aim.position.set(this.character.x, this.character.y);

		const pointerLocalPos: Point = e.getLocalPosition(this.grid, e.data.global.clone());
		const differenceX: number = pointerLocalPos.x * this.grid.scale.x + this.margins - this.character.x;
		if (differenceX < 0) {
			this.character.playAnimation("aimingLeft");
		} else {
			this.character.playAnimation("aimingRight");
		}

		this.onPointerMove(e);
	}

	private onPointerMove(e: FederatedPointerEvent): void {
		if (!this.aiming) {
			return;
		}

		const pointerLocalPos: Point = e.getLocalPosition(this.grid, e.data.global);
		const difference: IPointData = {
			x: pointerLocalPos.x * this.grid.scale.x + this.margins - this.character.x,
			y: pointerLocalPos.y * this.grid.scale.y + this.margins - this.character.y,
		};
		const angle: number = Math.atan2(difference.y, difference.x);
		this.aim.rotation = angle;
	}

	private onPointerUp(e: FederatedPointerEvent): void {
		if (!this.aiming) {
			return;
		}

		const pointerLocalPos: Point = e.getLocalPosition(this.grid, e.data.global);
		const difference: IPointData = {
			x: pointerLocalPos.x * this.grid.scale.x + this.margins - this.character.x,
			y: pointerLocalPos.y * this.grid.scale.y + this.margins - this.character.y,
		};
		const angle: number = Math.atan2(difference.y, difference.x);
		const force: number = 5;
		const impulse: IPointData = { x: Math.cos(angle) * force, y: Math.sin(angle) * force };
		const ballBody: Box2D.b2Body = Box2DHelper.getBody(this.ball);
		ballBody.ApplyLinearImpulseToCenter(Box2DHelper.getVec2(impulse), true);
		this.ball.visible = true;
		this.aim.visible = false;
		this.aiming = false;
		this.grid.eventMode = "none";

		this.character.playAnimation("waiting");
	}

	private onBallBeginContact(contact: Box2DContact): void {
		if (this.grid.eventMode == "static") {
			return;
		}

		if (contact.anotherBody == this.ground) {
			this.onBallTouchGround();
		} else {
			for (const enemy of this.enemies) {
				if (contact.anotherBody == enemy.body) {
					this.onEnemyHit(enemy);
				}
			}
		}
	}
	private onBallEndContact(_contact: Box2DContact): void {}
	private onBallPreSolve(contact: Box2DPreSolveContact): void {
		if (contact.anotherBody == this.leftWall) {
		} else if (contact.anotherBody == this.rightWall) {
		} else if (contact.anotherBody == this.ceil) {
		}
	}

	private onBallPostSolve(_contact: Box2DPostSolveContact): void {}

	public onDestroy(): void {
		Box2DHelper.clearWorld();
	}

	private onBallTouchGround(): void {
		const ballBody: Box2D.b2Body = Box2DHelper.getBody(this.ball);

		ballBody.SetLinearVelocity(Box2DHelper.getVec2({ x: 0, y: 0 }));
		ballBody.SetAngularVelocity(0);
		const newCharacterPosition: IPointData = { x: ballBody.GetPosition().x, y: this.character.y };
		setTimeout(() => {
			ballBody.SetTransform(Box2DHelper.getVec2(newCharacterPosition), 0);
			if (this.advanceEnemyLines()) {
				this.score++;
				// @ts-expect-error
				this.emit(GameEvents.UPDATE_SCORE, this.score);
				this.spawnEnemies(Math.floor(Math.random() * 3) + 1);

				// ballBody.SetTransform(Box2DHelper.getVec2(this.background.scale.x * 0.5, this.background.scale.y * 0.5), 0);
				this.aim.position.set(newCharacterPosition.x, newCharacterPosition.y);
				this.ball.position.set(newCharacterPosition.x, newCharacterPosition.y);
				const distance: number = Math.abs(this.character.x - newCharacterPosition.x);

				const left: boolean = this.character.x > newCharacterPosition.x;
				this.character.playAnimation(left ? "walkLeft" : "walkRight");
				new Tween(this.character.position)
					.to({ x: newCharacterPosition.x }, distance * 300)
					.start()
					.onComplete(() => {
						this.character.playAnimation("idle");
						this.ball.visible = false;
						this.grid.eventMode = "static";
					});
			} else {
				this.character.playAnimation("fallDown", () => {
					this.openGameOverPopup();
				});
			}
		});
	}

	private spawnEnemies(enemyCount: number): void {
		const randomPositions = Random.shared.shuffleArray([0, 1, 2, 3, 4, 5]);

		for (let i = 0; i < enemyCount; i++) {
			const randomPos: number = randomPositions[i];
			const enemyGridPos: IPointData = { x: randomPos, y: 1 };
			const enemy: Enemy = new Enemy(enemyGridPos);
			// @ts-expect-error
			enemy.on(EnemyEvents.DIE, () => {
				const indexOf: number = this.enemies.indexOf(enemy);
				if (indexOf != -1) {
					this.enemies.splice(indexOf, 1);
				}
				this.enemiesGrid[enemy.gridPos.x][enemy.gridPos.y] = null;
				enemy.destroy({ children: true });
			});
			enemy.position.set(this.margins + CELL_SIZE.x * (enemyGridPos.x + 0.5), this.margins + CELL_SIZE.y * 1.5);
			Box2DHelper.updatePositionFromDisplayObject(enemy);
			this.enemies.push(enemy);
			this.enemiesGrid[enemyGridPos.x][enemyGridPos.y] = enemy;
			this.addChild(enemy);
		}

		this.addChild(this.aim);
		this.addChild(this.character);
	}

	private async openGameOverPopup(): Promise<void> {
		const gameOverPopup: GameOver = await Manager.openPopup(GameOver, [this.score]);
		// @ts-expect-error
		gameOverPopup.on("restart", () => {
			gameOverPopup.closeHandler();
			this.restartGame();
		});
	}

	private onEnemyHit(enemy: Enemy): void {
		enemy.hit();
	}

	/** we return true if everything is ok, false if we lost */
	private advanceEnemyLines(): boolean {
		let maxEnemyY: number = 0;

		for (let i = 0; i < GRID_SIZE.y; i++) {
			for (let j = 0; j < GRID_SIZE.x; j++) {
				const enemy: Enemy = this.enemiesGrid[j][i];
				if (enemy) {
					maxEnemyY = Math.max(maxEnemyY, i);
				}
			}
		}

		if (maxEnemyY == GRID_SIZE.y - 1) {
			return false;
		}

		for (let i = maxEnemyY; i >= 0; i--) {
			for (let j = 0; j < GRID_SIZE.x; j++) {
				const enemy: Enemy = this.enemiesGrid[j][i];
				if (enemy != null) {
					enemy.updateGridPos({ x: j, y: i + 1 });
					this.enemiesGrid[j][i + 1] = enemy;
					this.enemiesGrid[j][i] = null;

					enemy.position.set(this.margins + CELL_SIZE.x * (j + 0.5), this.margins + CELL_SIZE.y * (i + 1.5));
					Box2DHelper.updatePositionFromDisplayObject(enemy);
				}
			}
		}

		return true;
	}

	private restartGame(): void {
		for (const enemy of this.enemies) {
			enemy.destroy({ children: true });
		}
		for (let i = 0; i < GRID_SIZE.x; i++) {
			for (let j = 0; j < GRID_SIZE.y; j++) {
				this.enemiesGrid[i][j] = null;
			}
		}
		this.character.playAnimation("idle");
		this.ball.visible = false;

		this.character.position.set(this.margins + this.grid.width / 2, this.margins + this.grid.height);
		this.ball.position.set(this.character.x, this.character.y);

		Box2DHelper.updatePositionFromDisplayObject(this.ball);

		this.score = 0;
		this.spawnEnemies(2);

		this.grid.eventMode = "static";
		// @ts-expect-error
		this.emit(GameEvents.UPDATE_SCORE, this.score);
	}
}
