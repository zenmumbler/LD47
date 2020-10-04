import { Input } from "./input";
import { Animation } from "./assets";
import { Entity, Actor, Positioned, Sprite, startAnimation } from "./scene";
import { tileIDAt, TileLayer } from "./tilemap";

export class Player implements Entity, Actor, Positioned, Sprite {
	name = "player";
	x = 380;
	y = 236;
	width = 8;
	height = 8;
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

	private tryMove(mx: number, my: number) {
		const halfWidth = this.width >> 1;
		const halfHeight = this.height >> 1;

		const sx = this.x + (mx >= 0 ? halfWidth : -halfWidth);
		const sy = this.y + (my >= 0 ? halfHeight : -halfHeight);
		let dx = sx + mx;
		let dy = sy + my;

		const stx = (sx - (mx >= 0 ? 1 : 0)) >> this.tileShift;
		const sty = (sy - (my >= 0 ? 1 : 0)) >> this.tileShift;
		const dtx = (dx - (mx >= 0 ? 1 : 0)) >> this.tileShift;
		const dty = (dy - (my >= 0 ? 1 : 0)) >> this.tileShift;

		const limitX = (dtx + (mx < 0 ? 1 : 0)) << this.tileShift;
		const limitY = (dty + (my < 0 ? 1 : 0)) << this.tileShift;

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

		this.x = dx + (mx >= 0 ? -halfWidth : halfWidth);
		this.y = dy + (my >= 0 ? -halfHeight : halfHeight);
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
		this.tryMove(dx, dy);
	}

	update() {
		const usesDirectionKey = Input.left || Input.right || Input.up || Input.down;

		if (Input.use) {
			//
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
