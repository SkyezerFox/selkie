import { Palette } from "@selkie/palette";

export interface Project {
	/**
	 * The project's name.
	 */
	name: string;

	/**
	 * Palettes contained within this project.
	 */
	palettes: Palette[];
}
