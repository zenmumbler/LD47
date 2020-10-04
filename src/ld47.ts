/*
untitled - ld47 entry
(c) 2020-Present by @zenmumbler
https://github.com/zenmumbler/ld47
*/

import { Input } from "./input";
import { renderStaticTileLayer, renderSprites, drawCenteredScaled } from "./render";
import { addEntity, shiftAnimationTimes, updateActors, updateAnimations, visibleSprites } from "./scene";
import { loadTMXMap, TMXMap } from "./tilemap";
import { Player } from "./objects";

let running = true;
let context: CanvasRenderingContext2D;
let map: TMXMap;
let bg: HTMLCanvasElement;
let player: Player;

function frame() {
	const now = Date.now();
	Input.update();

	updateAnimations(now);
	updateActors();

	const { x, y } = player;

	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	drawCenteredScaled(bg, x, y, 2, context);
	renderSprites(context, visibleSprites(), 4);

	Input.keyboard.resetPerFrameData();
	if (running) {
		requestAnimationFrame(frame);
	}
}

async function main() {
	const canvas = document.querySelector("canvas")!;
	context = canvas.getContext("2d")!;
	context.imageSmoothingEnabled = false;

	let deactivationTime = 0;
	Input.onActiveChange = newActive => {
		const now = Date.now();
		running = newActive;
		if (running) {
			const deltaTime = now - deactivationTime;
			shiftAnimationTimes(deltaTime);
			frame();
		}
		else {
			deactivationTime = now;
		}
	};

	map = await loadTMXMap("data/map0.xml");
	bg = renderStaticTileLayer(map, "main");

	player = new Player();
	addEntity(player);

	frame();
}

window.addEventListener("load", main);
