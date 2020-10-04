import { Input } from "./input";
import { Animation } from "./assets";
import { Entity, Actor, Positioned, Sprite, startAnimation } from "./scene";

export class Player implements Entity, Actor, Positioned, Sprite {
	name = "player";
	x = 100;
	y = 100;
	animations: Record<string, Animation>;
	curAnim!: string;
	frameStart = 0;
	frameIndex = 0;
	flipHoriz = false;
	mode = "idle";
	movementSpeed = 4;

	constructor() {
		this.animations = {
			
		};
		startAnimation(this, "idle");
		this.x = 100;
		this.y = 100;
	}

	moveCharacter () {
		if (Input.left) {
			this.x -= this.movementSpeed;
		}
		else if (Input.right) {
			this.x += this.movementSpeed;
		}
		if (Input.up) {
			this.y -= this.movementSpeed;
		}
		else if (Input.down) {
			this.y += this.movementSpeed;
		}
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
