import React, { createRef } from "react";

/**
 * State held by the tile editor.
 */
interface State {
	offsetX: number;
	offsetY: number;
	scale: number;
	pixels: number[];
}

/**
 * Clamp a value within the specified range.
 * @param value
 * @param min
 * @param max
 * @returns
 */
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

/**
 * The core tile editor component.
 */
export class SelkieTileEditor extends React.Component<
	{
		tileSize: number;
		maxScale: number;
		minScale: number;
	},
	State
> {
	state = {
		scale: 50,
		pixels: [],
		offsetX: 0,
		offsetY: 0,
	} as State;

	ref = createRef<HTMLCanvasElement>();

	/**
	 * The canvas element.
	 */
	get canvas(): HTMLCanvasElement {
		const ref = this.ref.current;
		if (!ref) {
			throw new Error("No canvas found");
		}
		return ref;
	}

	/**
	 * The rendering context of the canvas.
	 */
	get ctx(): CanvasRenderingContext2D {
		const ctx = this.canvas.getContext("2d");
		if (!ctx) {
			throw new Error("Attempted to access the canvas context when it did not exist!");
		}
		return ctx;
	}

	/**
	 * The container holding the canvas element.
	 */
	get container(): HTMLDivElement {
		return this.canvas.parentElement as HTMLDivElement;
	}

	/**
	 * Update the width and height of the canvas.
	 * @param width
	 * @param height
	 */
	updateCanvasDimensions(width = this.container.offsetWidth, height = this.container.offsetHeight): void {
		this.canvas.width = width;
		this.canvas.height = height;
	}

	private updateDimensions = (() => this.updateCanvasDimensions()).bind(this);

	handleCanvasClick(ev: MouseEvent): void {
		let { clientX: x, clientY: y } = ev;
		[x, y] = this.canvasToPixel(x, y);
		this.setPixel(x, y, 0xff0000);
	}

	/**
	 * Convert an (x, y) coordinate into a pixel array index.
	 * @param size The size of the tile in pixels
	 * @param x The x coordinate
	 * @param y The y coordinate
	 * @returns
	 */
	pixelToIndex(x: number, y: number): number {
		return x + y * this.props.tileSize;
	}

	/**
	 * Convert a pixel array index into an (x, y) coordinate.
	 * @param index The index of the pixel
	 */
	indexToPixel(index: number): [number, number] {
		return [index % this.props.tileSize, Math.floor(index / this.props.tileSize)];
	}

	/**
	 * Convert an (x, y) pixel coordinate into an (x, y) canvas coordinate.
	 * @param x The x coordinate
	 * @param y The y coordinate
	 * @returns
	 */
	pixelToCanvas(x: number, y: number): [number, number] {
		return [x * this.state.scale + this.state.offsetX, y * this.state.scale + this.state.offsetY];
	}

	/**
	 * Convert an (x, y) canvas coordinate into an (x, y) pixel coordinate.
	 * @param x The x coordinate
	 * @param y The y coordinate
	 * @returns
	 */
	canvasToPixel(x: number, y: number): [number, number] {
		return [(x - this.state.offsetX) / this.state.scale, (y - this.state.offsetY) / this.state.scale];
	}

	/**
	 * Set the color of the pixel at the target coordinates.
	 * @param x The x coordinate
	 * @param y The y coordinate
	 * @param color The new pixel color
	 */
	setPixel(x: number, y: number, color: number): void {
		// floor to sensible values
		x = Math.floor(x);
		y = Math.floor(y);
		// get pixel and update state
		const index = this.pixelToIndex(x, y);
		this.state.pixels[index] = color;
		this.setState({ pixels: this.state.pixels });
	}

	/**
	 * Handle the canvas being panned using the wheel event.
	 * @param ev
	 */
	handleCanvasPan(ev: WheelEvent): void {
		const { deltaX, deltaY } = ev;
		this.setState({ offsetX: this.state.offsetX + deltaX * -0.5, offsetY: this.state.offsetY + deltaY * -0.5 });
	}

	componentDidMount(): void {
		this.container.addEventListener("resize", this.updateDimensions);
		this.canvas.addEventListener("click", this.handleCanvasClick.bind(this));
		this.canvas.addEventListener("wheel", this.handleCanvasPan.bind(this));
		this.updateDimensions();
		this.renderCanvas();
	}

	/**
	 * Draw a line in tile space.
	 * @param x1
	 * @param y1
	 * @param x2
	 * @param y2
	 */
	drawLine(x1: number, y1: number, x2: number, y2: number) {
		const [x1c, y1c] = this.pixelToCanvas(x1, y1);
		const [x2c, y2c] = this.pixelToCanvas(x2, y2);
		// perform culling
		if (x1c === x2c && y1c === y2c) {
			return;
		}
		// draw the line
		this.ctx.beginPath();
		this.ctx.moveTo(x1c, y1c);
		this.ctx.lineTo(x2c, y2c);
		this.ctx.stroke();
	}

	/**
	 * Render the tile to the canvas.
	 */
	protected renderCanvas(): void {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		// iterate over pixel arrays and draw each pixel
		for (let i = 0; i < this.state.pixels.length; i++) {
			const [x, y] = this.pixelToCanvas(...this.indexToPixel(i));
			const color = this.state.pixels[i];
			if (color === undefined) {
				continue;
			}
			this.ctx.fillStyle = `#${color.toString(16)}`;
			this.ctx.fillRect(x, y, this.state.scale, this.state.scale);
		}
		this.ctx.fill();

		// draw the grid
		this.ctx.beginPath();
		for (let x = 0; x < this.props.tileSize; x++) {
			this.drawLine(x, 0, x, this.props.tileSize - 1);
		}

		for (let y = 0; y < this.props.tileSize; y++) {
			this.drawLine(0, y, this.props.tileSize - 1, y);
		}
		this.ctx.stroke();
	}

	componentDidUpdate(): void {
		this.renderCanvas();
	}

	componentWillUnmount(): void {
		this.container.removeEventListener("resize", this.updateDimensions);
		this.canvas.removeEventListener("click", this.handleCanvasClick.bind(this));
		this.canvas.removeEventListener("wheel", this.handleCanvasPan.bind(this));
	}

	render(): JSX.Element {
		return (
			<div>
				<canvas ref={this.ref}></canvas>
			</div>
		);
	}
}
