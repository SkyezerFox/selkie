import React, { createRef } from "react";

interface Pixel {
	x: number;
	y: number;
	color: number;
}

interface State {
	offsetX: number;
	offsetY: number;
	scale: number;
	pixels: Pixel[];
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
		x = Math.floor(x / this.state.scale);
		y = Math.floor(y / this.state.scale);
		// check the pixel does not already exist
		if (this.state.pixels.find((pixel) => pixel.x === x && pixel.y === y)) {
			return;
		}
		this.setState({ pixels: this.state.pixels.concat({ x, y, color: 0xff0000 }) });
	}

	/**
	 * Handle the canvas being panned using the wheel event.
	 * @param ev
	 */
	handleCanvasPan(ev: WheelEvent): void {
		const { deltaX, deltaY } = ev;
		this.setState({ offsetX: this.state.offsetX + deltaX * 0.1, offsetY: this.state.offsetY + deltaY * 0.1 });
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
		const canvasX1 = clamp(x1 * this.state.scale + this.state.offsetX, 0, this.canvas.width);
		const canvasY1 = clamp(y1 * this.state.scale + this.state.offsetY, 0, this.canvas.height);
		const canvasX2 = clamp(x2 * this.state.scale + this.state.offsetX, 0, this.canvas.width);
		const canvasY2 = clamp(y2 * this.state.scale + this.state.offsetY, 0, this.canvas.height);
		// perform culling
		if (canvasX1 === canvasX2 && canvasY1 === canvasY2) {
			return;
		}

		console.log("draw");
		// draw the line
		this.ctx.beginPath();
		this.ctx.moveTo(canvasX1, canvasY1);
		this.ctx.lineTo(canvasX2, canvasY2);
		this.ctx.stroke();
	}

	/**
	 * Render the tile to the canvas.
	 */
	protected renderCanvas(): void {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		for (const pixel of this.state.pixels) {
			this.ctx.beginPath();
			this.ctx.rect(
				pixel.x * this.state.scale + this.state.offsetX,
				pixel.y * this.state.scale + this.state.offsetY,
				this.state.scale,
				this.state.scale
			);
			this.ctx.fillStyle = `#${pixel.color.toString(16)}`;
			this.ctx.fill();
		}

		// draw the grid
		this.ctx.beginPath();
		for (let x = 0; x < this.props.tileSize; x++) {
			this.drawLine(x, 0, x, this.props.tileSize - 1);
		}

		for (let y = 0; y < this.props.tileSize; y++) {
			this.ctx.moveTo(0 + this.state.offsetY, y);
			this.ctx.lineTo(this.canvas.width, y);
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
