import { Entity, Sprite, Positioned } from "./scene";
import { TMXMap, TileLayer } from "./tilemap";

function tileForGID(map: TMXMap, gid: number): { src: CanvasImageSource, tx: number, ty: number, tw: number, th: number } {
	let tsi = map.tileSets.length - 1;
	while (tsi > 0) {
		if (gid >= map.tileSets[tsi].firstGID) {
			break;
		}
		tsi--;
	}

	const ts = map.tileSets[tsi];
	const tsti = gid - ts.firstGID;
	const tileY = (tsti / ts.columns) | 0;
	const tileX = tsti % ts.columns;
	return {
		src: ts.image,
		tx: tileX * ts.tileWidth,
		ty: tileY * ts.tileHeight,
		tw: ts.tileWidth,
		th: ts.tileHeight
	};
}

function drawLayerInto(map: TMXMap, layer: TileLayer, ctx: CanvasRenderingContext2D) {
	const mtw = map.tileWidth;
	const mth = map.tileHeight;
	
	let offset = 0;
	for (let y = 0; y < layer.height; ++y) {
		for (let x = 0; x < layer.width; ++x) {
			const gid = layer.tileIDs[offset];
			if (gid > 0) {
				const { src, tx, ty, tw, th } = tileForGID(map, gid);
				ctx.drawImage(src, tx, ty, tw, th, x * mtw, y * mth, tw, th);
			}
			offset += 1;
		}
	}
}

export function renderStaticTileLayer(map: TMXMap, layerName: string) {
	const width = map.width * map.tileWidth;
	const height = map.height * map.tileHeight;

	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d")!;

	for (const layer of map.layers) {
		if (layer.type === "tile" && layer.name === layerName) {
			drawLayerInto(map, layer, ctx);
		}
	}

	return canvas;
}

export function drawCenteredScaled(src: CanvasImageSource, centerX: number, centerY: number, scale: number, target: CanvasRenderingContext2D) {
	const ow = (src.width as number) | 0;
	const oh = (src.height as number) | 0;
	let tw = target.canvas.width;
	let th = target.canvas.height;
	let ssw = (tw / scale) | 0;
	let ssh = (th / scale) | 0;
	let ssx = centerX - (ssw >> 1);
	let ssy = centerY - (ssh >> 1);
	let tx = 0;
	let ty = 0;
	if (ssx < 0) {
		tx = -(ssx * scale);
		tw += (ssx * scale);
		ssw += ssx;
		ssx = 0;
	}
	if (ssx + ssw > ow) {
		const overflow = ssx + ssw - ow;
		ssw -= overflow;
		tw -= scale * overflow;
	}
	if (ssy < 0) {
		ty = -(ssy * scale);
		th += (ssy * scale);
		ssh += ssy;
		ssy = 0;
	}
	if (ssy + ssh > oh) {
		const overflow = ssy + ssh - oh;
		ssh -= overflow;
		th -= scale * overflow;
	}
	target.drawImage(src, ssx, ssy, ssw, ssh, tx, ty, tw, th);
}

export function renderSprites(context: CanvasRenderingContext2D, sprites: Map<string, Entity & Sprite & Positioned>, scale: number) {
	// sort sprites
	const sortedSprites = [...sprites.values()];
	sortedSprites.sort((a, b) => {
		// round each coord to a pixel
		const ax = a.x | 0;
		const ay = a.y | 0;
		const bx = b.x | 0;
		const by = b.y | 0;
		// sort top-bottom -> left->right
		return (ay - by) || (ax - bx);
	});

	// draw sprites
	for (const sprite of sortedSprites) {
		const anim = sprite.animations[sprite.curAnim];
		const frame = anim.frames[sprite.frameIndex];
		const sheet = anim.sheet;
		const dimx = sheet.tileWidth;
		const dimy = sheet.tileHeight;
		const tileX = frame.tileIndex % sheet.columns;
		const tileY = (frame.tileIndex / sheet.columns) | 0;

		if (sprite.flipHoriz) {
			context.drawImage(
				sheet.hFlipImage,
				sheet.image.width - (tileX + 1) * dimx, tileY * dimy,
				dimx, dimy,
				(sprite.x + anim.offsetX) * scale - dimx, (sprite.y + anim.offsetY) * scale,
				dimx * scale, dimy * scale
			);
		}
		else {
			context.drawImage(
				sheet.image,
				tileX * dimx, tileY * dimy,
				dimx, dimy,
				(sprite.x + anim.offsetX) * scale, (sprite.y + anim.offsetY) * scale,
				dimx * scale, dimy * scale
			);
		}
	}
}
