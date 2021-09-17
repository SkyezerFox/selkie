import React from "react";

import { SketchPicker } from "react-color";
import { ColorContext } from "../context/color";

export const ColorPicker: React.FC = () => {
	const ctx = React.useContext(ColorContext);
	return <SketchPicker onChangeComplete={(ev) => ctx.update(parseInt(ev.hex, 16))} />;
};
