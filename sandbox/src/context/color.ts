import React from "react";

interface ColorContext {
	color: number;
	update: (value: number) => void;
}

/**
 * The current color of tiles to create.
 */
export const ColorContext = React.createContext<ColorContext>({
	color: 0xff66ff,
	update: (value) => {
		return;
	},
});
