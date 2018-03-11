
const Puzzle = (function () {
	const BLOCK_SIZE = 40;
	const MAP_SIZE = 5;

	// Shape

	function Shape(parent, map, backgroundColor) {
		this.parent = parent;
		this.backgroundColor = backgroundColor;

		this.list = [];
		this.position = {
			x: 0,
			y: 0
		};

		map.forEach((row, y) => {
			row.forEach((col, x) => {
				if (col !== 0) {
					this.list.push({
						x,
						y
					});
				}
			});
		});

		this._mount();
		this.setPosition(0, MAP_SIZE)
	}

	Shape.prototype._mount = function () {
		const el = document.createElement('div');
		this.parent.appendChild(el);
		el.setAttribute('touch-action', 'none');
		el.classList.add('puzzle-shape');
		el.style.position = 'absolute';

		this.el = el;

		this.list.forEach(pos => {
			this._mountBlock(pos.x, pos.y);
		});
	}

	Shape.prototype._mountBlock = function (x, y) {
		const block = document.createElement('div');
		this.el.appendChild(block);
		block.classList.add('puzzle-shape__block');
		block.style.position = 'absolute';
		block.style.backgroundColor = this.backgroundColor;
		block.style.width = BLOCK_SIZE + 'px';
		block.style.height = BLOCK_SIZE + 'px';
		block.style.left = (x * BLOCK_SIZE) + 'px';
		block.style.top = (y * BLOCK_SIZE) + 'px';
	}

	Shape.prototype.startDrag = function () {
		Shape.Z_INDEX += 1;
		this.el.style.zIndex = Shape.Z_INDEX;
	}

	Shape.prototype.stopDrag = function () {
		// to do
	}

	Shape.prototype.setPosition = function (x, y) {
		const position = this.position;

		position.x = x || 0;
		position.y = y || 0;

		this.el.style.left = (position.x * BLOCK_SIZE) + 'px';
		this.el.style.top = (position.y * BLOCK_SIZE) + 'px';
	}

	Shape.Z_INDEX = 1;


	// Map

	function Map(parent, size) {
		this.parent = parent;
		this.size = size;

		this._mount();
	}

	Map.prototype._mount = function () {
		const cssSize = BLOCK_SIZE * MAP_SIZE + 'px';

		const el = document.createElement('div');
		this.parent.appendChild(el);
		el.classList.add('puzzle-map');
		el.style.position = 'relative';
		el.style.width = cssSize;
		el.style.height = cssSize;

		this.el = el;

		const size = this.size;

		for (let y = 0; y < size; ++ y) {
			for (let x = 0; x < size; ++ x) {
				this._mountBlock(x, y);
			}
		}
	}

	Map.prototype._mountBlock = function (x, y) {
		const block = document.createElement('div');
		this.el.appendChild(block);
		block.classList.add('puzzle-map__block');
		block.style.position = 'absolute';
		block.style.width = BLOCK_SIZE + 'px';
		block.style.height = BLOCK_SIZE + 'px';
		block.style.left = (x * BLOCK_SIZE) + 'px';
		block.style.top = (y * BLOCK_SIZE) + 'px';
	}


	// Puzzle

	function Puzzle(parent) {
		this.parent = parent

		this.onFinishedCallback = null

		this._mount()

		this.map = new Map(this.el, MAP_SIZE);

		this.shapes = [
			new Shape(this.el, [
				[1, 1, 1],
				[0, 1, 0],
			], '#ff9800'),

			new Shape(this.el, [
				[1, 0],
				[1, 1]
			], '#cddc39'),

			new Shape(this.el, [
				[0, 0, 1],
				[1, 1, 1]
			], '#4caf50'),

			new Shape(this.el, [
				[1, 1],
				[1, 1],
			], '#f44336'),

			new Shape(this.el, [
				[1],
				[1],
			], '#3f51b5'),

			new Shape(this.el, [
				[0, 1],
				[1, 1],
				[1, 0]
			], '#9c27b0'),

			new Shape(this.el, [
				[0, 1, 1],
				[1, 1, 0]
			], '#e91e63'),
		];

		this.draggable = {
			shape: null,
			offset: {
				x: 0,
				y: 0
			}
		};

		this.shapes.forEach(shape => {
			const el = shape.el

			el.addEventListener('pointerdown', e => this._onStartDrag(e, shape));
			el.addEventListener('pointerup', e => this._onStopDrag(e, shape));
			el.addEventListener('pointercancel', e => this._onStopDrag(e, shape));
			el.addEventListener('pointermove', e => this._onDrag(e, shape));
		});
	}

	Puzzle.prototype._mount = function () {
		const el = document.createElement('div');
		this.parent.appendChild(el);
		el.classList.add('puzzle');
		el.style.position = 'relative';
		el.style.height = (BLOCK_SIZE * MAP_SIZE * 1.5) + 'px'

		this.el = el;
	}

	Puzzle.prototype._check = function () {
		const list = Array.from({ length: 16 });

		this.shapes.forEach(shape => {
			const pos = shape.position;

			shape.list.forEach(block => {
				const x = pos.x + block.x;
				const y = pos.y + block.y;
				const index = y * MAP_SIZE + x;

				if (index >= 0 && index < MAP_SIZE * MAP_SIZE) {
					list[index] = true;
				}
			});
		});

		let isFilled = list.every(el => (el === true));

		if (isFilled) {
			this.onFinishedCallback && this.onFinishedCallback()
		}
	}

	Puzzle.prototype._getMousePosition = function (e) {
		const bounding = this.el.getBoundingClientRect();
		const x = ~~((e.clientX - bounding.left) / BLOCK_SIZE);
		const y = ~~((e.clientY - bounding.top) / BLOCK_SIZE);

		return {
			x,
			y
		};
	}

	Puzzle.prototype._onStartDrag = function (e, shape) {
		shape.startDrag();

		this.draggable.shape = shape;

		const mouse = this._getMousePosition(e);
		const offset = this.draggable.offset;

		offset.x = mouse.x - shape.position.x;
		offset.y = mouse.y - shape.position.y;
	}

	Puzzle.prototype._onStopDrag = function (e, shape) {
		shape.stopDrag();

		this.draggable.shape = null;

		this._check();
	}

	Puzzle.prototype._onDrag = function (e, shape) {
		if (this.draggable.shape !== shape) {
			return;
		}

		shape.el.setPointerCapture(e.pointerId);

		const mouse = this._getMousePosition(e);
		const offset = this.draggable.offset;

		shape.setPosition(mouse.x - offset.x, mouse.y - offset.y);
	}

	return Puzzle;
})();
