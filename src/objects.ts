import { Input } from "./input";
import { Animation } from "./assets";
import { Entity, Actor, Positioned, Sprite, startAnimation } from "./scene";
import { tileIDAt, TileLayer } from "./tilemap";

export class Player implements Entity, Actor, Positioned, Sprite {
	name = "player";
	x = 316;
	y = 308;
	width = 6;
	height = 6;
	animations: Record<string, Animation>;
	curAnim!: string;
	frameStart = 0;
	frameIndex = 0;
	flipHoriz = false;
	mode = "idle";
	movementSpeed = 1;
	collisionMap: TileLayer;
	tileDim: number;
	tileShift: number;

	constructor(collMap: TileLayer, collDim: number) {
		this.collisionMap = collMap;
		this.tileDim = collDim;
		this.tileShift = Math.log2(collDim);
		this.animations = {
			
		};
		startAnimation(this, "idle");
	}

	private tryMove(sx: number, sy: number, mx: number, my: number) {
		let dx = sx + mx;
		let dy = sy + my;

		const stx = sx >> this.tileShift;
		const sty = sy >> this.tileShift;
		const dtx = dx >> this.tileShift;
		const dty = dy >> this.tileShift;

		const limitX = ((dtx + (mx < 0 ? 1 : 0)) << this.tileShift) - (mx > 0 ? 1 : 0);
		const limitY = ((dty + (my < 0 ? 1 : 0)) << this.tileShift) - (my > 0 ? 1 : 0);

		const coll = this.collisionMap;
		if (dtx !== stx) {
			if (dty !== sty) {
				if (tileIDAt(coll, dtx, dty)) {
					if (! tileIDAt(coll, stx, dty)) {
						dx = limitX;
					}
					else if (! tileIDAt(coll, dtx, sty)) {
						dy = limitY;
					}
					else {
						dx = limitX;
						dy = limitY;
					}
				}
			}
			else {
				if (tileIDAt(coll, dtx, dty)) {
					dx = limitX;
				}
			}
		}
		else if (dty !== sty) {
			if (tileIDAt(coll, dtx, dty)) {
				dy = limitY;
			}
		}

		return { dx: dx - sx, dy: dy - sy };
	}

	moveCharacter () {
		let dx = 0;
		let dy = 0;
		if (Input.left) {
			dx -= this.movementSpeed;
		}
		else if (Input.right) {
			dx += this.movementSpeed;
		}
		if (Input.up) {
			dy -= this.movementSpeed;
		}
		else if (Input.down) {
			dy += this.movementSpeed;
		}

		const halfWidth = this.width >> 1;
		const halfHeight = this.height >> 1;

		if (dx !== 0 || dy !== 0) {
			const tests = [];
			tests.push(this.tryMove(
				this.x - halfWidth,
				this.y - halfHeight,
				dx, dy));
			tests.push(this.tryMove(
				this.x - halfWidth,
				this.y + halfHeight - 1,
				dx, dy));
			tests.push(this.tryMove(
				this.x + halfWidth - 1,
				this.y - halfHeight,
				dx, dy));
			tests.push(this.tryMove(
				this.x + halfWidth - 1,
				this.y + halfHeight - 1,
				dx, dy));
			
			const movement = tests.reduce((cur, next) => ({
				dx: Math.min(Math.abs(cur.dx), Math.abs(next.dx)) * Math.sign(cur.dx),
				dy: Math.min(Math.abs(cur.dy), Math.abs(next.dy)) * Math.sign(cur.dy)
			}), { dx, dy });

			this.x += movement.dx;
			this.y += movement.dy;
		}
	}

	update() {
		const usesDirectionKey = Input.left || Input.right || Input.up || Input.down;

		if (Input.use) {
			console.info("USE");
		}
		else if (usesDirectionKey) {
			// startAnimation(this, "walk");
			this.moveCharacter();
		}
		else if (this.mode === "walk") {
			// startAnimation(this, "walk");
			this.mode = "stand";
		}
	}

	onAnimCycleEnd() {
		// if (this.mode === "attack") {
		// 	startAnimation(this, "idle");
		// 	this.mode = "stand";
		// }
	}
}
