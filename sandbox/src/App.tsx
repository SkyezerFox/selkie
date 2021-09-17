import React from "react";

import { SelkieTileEditor } from "@selkie/tile-editor";
import { ColorPicker } from "./components/ColorPicker";
import { ColorContext } from "./context/color";

export const App = (): JSX.Element => {
	const [color, update] = React.useState(0xff66ff);

	return (
		<div>
			<ColorContext.Provider value={{ color, update }}>
				<ColorPicker></ColorPicker>
				<SelkieTileEditor tileSize={16} maxScale={500} minScale={10} />
			</ColorContext.Provider>
		</div>
	);
};
