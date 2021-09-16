import { Tile } from "@selkie/tiles";

/**
 * A tile contained within a palette.
 */
interface PaletteTile {
	tile: Tile;
	x: number;
	y: number;
}

/**
 * A palette of tiles.
 */
interface Palette {
	/**
	 * The name of this palette.
	 */
	name: string;
	/**
	 * The tiles contained within this palette.
	 */
	tiles: PaletteTile[];
}
