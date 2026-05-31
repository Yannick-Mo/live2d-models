function SnakeGame() {
	const that = this;
	let w = document.documentElement.clientWidth, h = document.documentElement.clientHeight;
	const GRID_SIZE = 20;
	const FPS = 10;
	this.gameOver = false;
	this.score = 0;
	const centerX = Math.floor(GRID_SIZE / 2);
	const centerY = Math.floor(GRID_SIZE / 2);
	this.snake = [];
	for (let i = 0; i < 3; i++) {
		this.snake.push({x: centerX - i, y: centerY});
	}
	this.direction = {x: 1, y: 0};
	this.nextDirection = {x: 1, y: 0};
	this.food = {x: 0, y: 0};

	function spawnFood() {
		const occupied = new Set();
		for (const seg of that.snake) {
			occupied.add(seg.x + "," + seg.y);
		}
		const empty = [];
		for (let x = 0; x < GRID_SIZE; x++) {
			for (let y = 0; y < GRID_SIZE; y++) {
				if (!occupied.has(x + "," + y)) {
					empty.push({x, y});
				}
			}
		}
		if (empty.length) {
			that.food = empty[Math.floor(Math.random() * empty.length)];
		}
	}

	function resetGame() {
		that.gameOver = false;
		that.score = 0;
		that.snake = [];
		for (let i = 0; i < 3; i++) {
			that.snake.push({x: centerX - i, y: centerY});
		}
		that.direction = {x: 1, y: 0};
		that.nextDirection = {x: 1, y: 0};
		that.points.innerHTML = "0";
		spawnFood();
	}

	this.gameContainer = document.createElement("div");
	document.body.appendChild(this.gameContainer);
	this.canvas = document.createElement("canvas");
	this.canvas.setAttribute("width", w);
	this.canvas.setAttribute("height", h);
	Object.assign(this.canvas.style, {
		width: w + "px",
		height: h + "px",
		position: "fixed",
		top: "0px",
		left: "0px",
		bottom: "0px",
		right: "0px",
		zIndex: "10000"
	});
	this.gameContainer.appendChild(this.canvas);
	this.ctx = this.canvas.getContext("2d");
	this.ctx.fillStyle = "black";
	this.ctx.strokeStyle = "black";

	this.navigation = document.createElement("div");
	this.navigation.id = "ASTEROIDS-NAVIGATION";
	Object.assign(this.navigation.style, {
		fontFamily: "Arial,sans-serif",
		position: "fixed",
		zIndex: "10001",
		top: "0px",
		left: "0px",
		padding: "10px",
		color: "white",
		fontSize: "18px"
	});
	this.navigation.innerHTML = "Score: ";
	this.points = document.createElement("span");
	this.points.innerHTML = "0";
	this.navigation.appendChild(this.points);
	this.gameContainer.appendChild(this.navigation);

	const eventKeydown = function(event) {
		if (event.key === "Escape") {
			that.destroy();
			return;
		}
		if (that.gameOver) {
			if (event.key === "r" || event.key === "R") {
				resetGame();
			}
			return;
		}
		switch (event.key) {
		case "ArrowUp":
			if (that.direction.y !== 1) that.nextDirection = {x: 0, y: -1};
			break;
		case "ArrowDown":
			if (that.direction.y !== -1) that.nextDirection = {x: 0, y: 1};
			break;
		case "ArrowLeft":
			if (that.direction.x !== 1) that.nextDirection = {x: -1, y: 0};
			break;
		case "ArrowRight":
			if (that.direction.x !== -1) that.nextDirection = {x: 1, y: 0};
			break;
		}
		if (["ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft"].includes(event.key)) {
			if (event.preventDefault) event.preventDefault();
			if (event.stopPropagation) event.stopPropagation();
			event.returnValue = false;
			event.cancelBubble = true;
			return false;
		}
	};
	document.addEventListener("keydown", eventKeydown, false);

	const eventResize = function() {
		that.canvas.style.display = "none";
		w = document.documentElement.clientWidth;
		h = document.documentElement.clientHeight;
		that.canvas.setAttribute("width", w);
		that.canvas.setAttribute("height", h);
		Object.assign(that.canvas.style, {
			display: "block",
			width: w + "px",
			height: h + "px"
		});
	};
	window.addEventListener("resize", eventResize, false);

	function draw() {
		const ctx = that.ctx;
		const cellSize = Math.min(Math.floor(w / GRID_SIZE), Math.floor(h / GRID_SIZE));
		const offX = Math.floor((w - cellSize * GRID_SIZE) / 2);
		const offY = Math.floor((h - cellSize * GRID_SIZE) / 2);
		ctx.fillStyle = "#111";
		ctx.fillRect(0, 0, w, h);
		ctx.strokeStyle = "#222";
		ctx.lineWidth = 0.5;
		for (let x = 0; x <= GRID_SIZE; x++) {
			ctx.beginPath();
			ctx.moveTo(offX + x * cellSize, offY);
			ctx.lineTo(offX + x * cellSize, offY + GRID_SIZE * cellSize);
			ctx.stroke();
		}
		for (let y = 0; y <= GRID_SIZE; y++) {
			ctx.beginPath();
			ctx.moveTo(offX, offY + y * cellSize);
			ctx.lineTo(offX + GRID_SIZE * cellSize, offY + y * cellSize);
			ctx.stroke();
		}
		ctx.fillStyle = "#f44336";
		ctx.fillRect(offX + that.food.x * cellSize + 1, offY + that.food.y * cellSize + 1, cellSize - 2, cellSize - 2);
		for (let i = 0; i < that.snake.length; i++) {
			const seg = that.snake[i];
			ctx.fillStyle = i === 0 ? "#66BB6A" : "#388E3C";
			ctx.fillRect(offX + seg.x * cellSize + 1, offY + seg.y * cellSize + 1, cellSize - 2, cellSize - 2);
		}
		if (that.gameOver) {
			ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
			ctx.fillRect(0, 0, w, h);
			ctx.fillStyle = "white";
			ctx.font = "36px Arial, sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("Game Over", w / 2, h / 2 - 20);
			ctx.font = "18px Arial, sans-serif";
			ctx.fillText("Press R to restart", w / 2, h / 2 + 20);
		}
	}

	function update() {
		if (!that.gameOver) {
			that.direction = {x: that.nextDirection.x, y: that.nextDirection.y};
			const head = that.snake[0];
			const newHead = {x: head.x + that.direction.x, y: head.y + that.direction.y};
			if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
				that.gameOver = true;
			} else {
				for (const seg of that.snake) {
					if (seg.x === newHead.x && seg.y === newHead.y) {
						that.gameOver = true;
						break;
					}
				}
			}
			if (!that.gameOver) {
				that.snake.unshift(newHead);
				if (newHead.x === that.food.x && newHead.y === that.food.y) {
					that.score += 10;
					that.points.innerHTML = that.score;
					spawnFood();
				} else {
					that.snake.pop();
				}
			}
		}
		draw();
		setTimeout(update, 1000 / FPS);
	}

	spawnFood();
	setTimeout(update, 1000 / FPS);

	this.destroy = function() {
		document.removeEventListener("keydown", eventKeydown, false);
		window.removeEventListener("resize", eventResize, false);
		this.gameContainer.parentNode.removeChild(this.gameContainer);
	};
}

if (!window.GAME_INSTANCES) window.GAME_INSTANCES = [];
window.GAME_INSTANCES.push(new SnakeGame());
