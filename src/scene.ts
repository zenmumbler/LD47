import { Animation } from "./assets";

export interface Entity {
	name: string;
}

export interface Positioned {
	x: number;
	y: number;
}

export function isPositioned(o: any): o is Positioned {
	return o && typeof(o) === "object" && typeof o.x === "number" && typeof o.y === "number";
}

export interface Actor {
	update(): void;
}

export function isActor(o: any): o is Actor {
	return o && typeof (o) === "object" && typeof o.update === "function";
}

export interface Sprite {
	animations: Record<string, Animation>;
	curAnim: string;
	frameStart: number;
	frameIndex: number;
	flipHoriz: boolean;

	onAnimCycleEnd?(): void;
}

export function isSprite(o: any): o is Sprite {
	return o && typeof (o) === "object" && o.animation && typeof o.frameStart === "number" && typeof o.frameIndex === "number";
}

export function startAnimation(spr: Sprite, animName: string) {
	spr.curAnim = animName;
	spr.frameStart = Date.now();
	spr.frameIndex = 0;
}

const sprites = new Map<string, Entity & Sprite & Positioned>();
const actors = new Map<string, Entity & Actor>();

export function addEntity(ent: Entity) {
	if (isActor(ent)) {
		actors.set(ent.name, ent);
	}
	if (isSprite(ent) && isPositioned(ent)) {
		sprites.set(ent.name, ent);
	}
}

export function shiftAnimationTimes(deltaTime: number) {
	for (const [_, sprite] of sprites) {
		sprite.frameStart += deltaTime;
	}
}

export function updateAnimations(now: number) {
	for (const [_, sprite] of sprites) {
		// update current frame
		const anim = sprite.animations[sprite.curAnim];
		let frame = anim.frames[sprite.frameIndex];
		if (now - sprite.frameStart > frame.duration) {
			sprite.frameStart += frame.duration;
			sprite.frameIndex = (sprite.frameIndex + 1) % anim.frames.length;
			frame = anim.frames[sprite.frameIndex];
			if (sprite.frameIndex === 0 && sprite.onAnimCycleEnd) {
				sprite.onAnimCycleEnd();
			}
		}
	}
}

export function updateActors() {
	for (const [_, actor] of actors) {
		actor.update();
	}
}

export function visibleSprites() {
	return sprites;
}
