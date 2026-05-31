function TetrisGame() {
	const that = this;
	let w = document.documentElement.clientWidth, h = document.documentElement.clientHeight;
	const COLS = 10, ROWS = 20;
	const FPS = 60;
	this.gameOver = false;
	this.score = 0;
	this.lines = 0;
	let board = [];
	let currentPiece = null;
	let currentX = 0, currentY = 0;
	let dropCounter = 0;
	let dropInterval = 1000;
	let lastTime = 0;
	let restartHold = false;

	const PIECES = [
		{ shape: [[1,1,1,1]], color: "#00F0F0" }, // I
		{ shape: [[1,1],[1,1]], color: "#F0F000" }, // O
		{ shape: [[0,1,0],[1,1,1]], color: "#A000F0" }, // T
		{ shape: [[0,1,1],[1,1,0]], color: "#00F000" }, // S
		{ shape: [[1,1,0],[0,1,1]], color: "#F00000" }, // Z
		{ shape: [[1,0,0],[1,1,1]], color: "#0000F0" }, // J
		{ shape: [[0,0,1],[1,1,1]], color: "#F0A000" }  // L
	];

	function createBoard() {
		board = [];
		for (let y = 0; y < ROWS; y++) {
			board.push(new Array(COLS).fill(0));
		}
	}

	function randomPiece() {
		const p = PIECES[Math.floor(Math.random() * PIECES.length)];
		return { shape: p.shape.map(row => [...row]), color: p.color };
	}

	function rotateMatrix(matrix) {
		const rows = matrix.length, cols = matrix[0].length;
		const result = [];
		for (let x = 0; x < cols; x++) {
			result.push([]);
			for (let y = rows - 1; y >= 0; y--) {
				result[x].push(matrix[y][x]);
			}
		}
		return result;
	}

	function isValid(shape, offsetX, offsetY) {
		for (let y = 0; y < shape.length; y++) {
			for (let x = 0; x < shape[y].length; x++) {
				if (shape[y][x]) {
					const boardX = offsetX + x;
					const boardY = offsetY + y;
					if (boardX < 0 || boardX >= COLS || boardY >= ROWS || boardY < 0) return false;
					if (boardY >= 0 && board[boardY][boardX] !== 0) return false;
				}
			}
		}
		return true;
	}

	function spawnPiece() {
		currentPiece = randomPiece();
		currentX = Math.floor((COLS - currentPiece.shape[0].length) / 2);
		currentY = 0;
		if (!isValid(currentPiece.shape, currentX, currentY)) {
			that.gameOver = true;
		}
	}

	function lockPiece() {
		for (let y = 0; y < currentPiece.shape.length; y++) {
			for (let x = 0; x < currentPiece.shape[y].length; x++) {
				if (currentPiece.shape[y][x]) {
					const boardY = currentY + y;
					const boardX = currentX + x;
					if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
						board[boardY][boardX] = currentPiece.color;
					}
				}
			}
		}
		clearRows();
		spawnPiece();
	}

	function clearRows() {
		let cleared = 0;
		for (let y = ROWS - 1; y >= 0; y--) {
			if (board[y].every(cell => cell !== 0)) {
				board.splice(y, 1);
				board.unshift(new Array(COLS).fill(0));
				cleared++;
				y++;
			}
		}
		if (cleared > 0) {
			const points = [0, 100, 300, 500, 800];
			that.score += points[Math.min(cleared, 4)];
			that.lines += cleared;
			that.points.innerHTML = that.score;
			that.linesDisplay.innerHTML = that.lines;
		}
	}

	function resetGame() {
		that.gameOver = false;
		that.score = 0;
		that.lines = 0;
		that.points.innerHTML = "0";
		that.linesDisplay.innerHTML = "0";
		dropCounter = 0;
		dropInterval = 1000;
		lastTime = 0;
		createBoard();
		spawnPiece();
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
	const lineSep = document.createTextNode("  Lines: ");
	this.navigation.appendChild(lineSep);
	this.linesDisplay = document.createElement("span");
	this.linesDisplay.innerHTML = "0";
	this.navigation.appendChild(this.linesDisplay);
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
		case "ArrowLeft":
			if (currentPiece && isValid(currentPiece.shape, currentX - 1, currentY)) currentX--;
			break;
		case "ArrowRight":
			if (currentPiece && isValid(currentPiece.shape, currentX + 1, currentY)) currentX++;
			break;
		case "ArrowDown":
			if (currentPiece) {
				if (isValid(currentPiece.shape, currentX, currentY + 1)) {
					currentY++;
					dropCounter = 0;
				}
			}
			break;
		case "ArrowUp":
			if (currentPiece) {
				const rotated = rotateMatrix(currentPiece.shape);
				if (isValid(rotated, currentX, currentY)) {
					currentPiece.shape = rotated;
				}
			}
			break;
		case " ":
			if (currentPiece) {
				while (isValid(currentPiece.shape, currentX, currentY + 1)) {
					currentY++;
				}
				lockPiece();
				dropCounter = 0;
			}
			break;
		}
		if (["ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft", " "].includes(event.key)) {
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
		const cellSize = Math.min(Math.floor(w / (COLS + 6)), Math.floor(h / ROWS));
		const boardW = cellSize * COLS;
		const boardH = cellSize * ROWS;
		const offX = Math.floor((w - boardW) / 2);
		const offY = Math.floor((h - boardH) / 2);

		ctx.fillStyle = "#111";
		ctx.fillRect(0, 0, w, h);

		ctx.strokeStyle = "#333";
		ctx.lineWidth = 0.5;
		for (let x = 0; x <= COLS; x++) {
			ctx.beginPath();
			ctx.moveTo(offX + x * cellSize, offY);
			ctx.lineTo(offX + x * cellSize, offY + boardH);
			ctx.stroke();
		}
		for (let y = 0; y <= ROWS; y++) {
			ctx.beginPath();
			ctx.moveTo(offX, offY + y * cellSize);
			ctx.lineTo(offX + boardW, offY + y * cellSize);
			ctx.stroke();
		}

		for (let y = 0; y < ROWS; y++) {
			for (let x = 0; x < COLS; x++) {
				if (board[y][x] !== 0) {
					ctx.fillStyle = board[y][x];
					ctx.fillRect(offX + x * cellSize + 1, offY + y * cellSize + 1, cellSize - 2, cellSize - 2);
				}
			}
		}

		if (currentPiece) {
			for (let y = 0; y < currentPiece.shape.length; y++) {
				for (let x = 0; x < currentPiece.shape[y].length; x++) {
					if (currentPiece.shape[y][x]) {
						const drawY = currentY + y;
						if (drawY >= 0) {
							ctx.fillStyle = currentPiece.color;
							ctx.fillRect(offX + (currentX + x) * cellSize + 1, offY + drawY * cellSize + 1, cellSize - 2, cellSize - 2);
						}
					}
				}
			}
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

	function update(time) {
		if (!that.gameOver) {
			const delta = time - lastTime;
			lastTime = time;
			dropCounter += delta;
			if (dropCounter >= dropInterval) {
				if (isValid(currentPiece.shape, currentX, currentY + 1)) {
					currentY++;
				} else {
					lockPiece();
				}
				dropCounter = 0;
			}
		}
		draw();
		setTimeout(function() { update(performance.now()); }, 1000 / FPS);
	}

	createBoard();
	spawnPiece();
	setTimeout(function() { update(performance.now()); }, 1000 / FPS);

	this.destroy = function() {
		document.removeEventListener("keydown", eventKeydown, false);
		window.removeEventListener("resize", eventResize, false);
		this.gameContainer.parentNode.removeChild(this.gameContainer);
	};
}

if (!window.GAME_INSTANCES) window.GAME_INSTANCES = [];
window.GAME_INSTANCES.push(new TetrisGame());
