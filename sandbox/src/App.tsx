import React, { useState } from "react";

import { SelkieTileEditor } from "@selkie/tile-editor";

function App() {
	const [count, setCount] = useState(0);

	return (
		<div className="App">
			<SelkieTileEditor tileSize={16} maxScale={500} minScale={50} />
		</div>
	);
}

export default App;
