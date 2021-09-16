/**
 * Tile metadata.
 */
interface TileMeta {
	/**
	 * The tile's name.
	 */
	name: string;
	/**
	 * The tile's description.
	 */
	description: string;
	/**
	 * The tile's tags.
	 */
	tags: string[];
}

/**
 * A generic tile.
 */
export interface Tile {
	/**
	 * The tile's metadata.
	 */
	meta: TileMeta;

	/**
	 * The width of this tile in pixels.
	 */
	size: number;
	/**
	 * Pixel data contained in this tile. This array is a 2D array of pixel data,
	 * and its length will always be equal to the size of the tile squared.
	 */
	pixels: number[];
}
