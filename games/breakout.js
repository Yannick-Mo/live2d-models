function BreakoutGame() {
	const that = this;
	let w = document.documentElement.clientWidth, h = document.documentElement.clientHeight;
	const FPS = 60;
	this.gameOver = false;
	this.won = false;
	this.score = 0;
	this.lives = 3;

	const PADDLE_WIDTH = 120;
	const PADDLE_HEIGHT = 14;
	const PADDLE_Y_OFFSET = 40;
	let paddleX = 0;

	const BALL_SIZE = 10;
	let ballX = 0, ballY = 0;
	let ballDX = 0, ballDY = 0;
	let ballOnPaddle = true;

	const BRICK_ROWS = 5;
	const BRICK_COLS = 10;
	const BRICK_W = 70;
	const BRICK_H = 20;
	const BRICK_PADDING = 4;
	const BRICK_TOP_OFFSET = 80;
	const BRICK_COLORS = ["#f44336", "#FF9800", "#FFEB3B", "#4CAF50", "#2196F3"];
	let bricks = [];

	function initBricks() {
		bricks = [];
		for (let row = 0; row < BRICK_ROWS; row++) {
			bricks[row] = [];
			for (let col = 0; col < BRICK_COLS; col++) {
				bricks[row][col] = true;
			}
		}
	}

	function resetBall() {
		ballOnPaddle = true;
		ballX = paddleX + PADDLE_WIDTH / 2;
		ballY = h - PADDLE_Y_OFFSET - PADDLE_HEIGHT - BALL_SIZE / 2;
		ballDX = 0;
		ballDY = 0;
	}

	function launchBall() {
		ballOnPaddle = false;
		const angle = -Math.PI / 4 + (Math.random() * Math.PI / 4);
		const speed = 7;
		ballDX = Math.cos(angle) * speed;
		ballDY = Math.sin(angle) * speed;
	}

	function checkWin() {
		for (let r = 0; r < BRICK_ROWS; r++) {
			for (let c = 0; c < BRICK_COLS; c++) {
				if (bricks[r][c]) return false;
			}
		}
		return true;
	}

	function resetGame() {
		that.gameOver = false;
		that.won = false;
		that.score = 0;
		that.lives = 3;
		that.points.innerHTML = "0";
		that.livesDisplay.innerHTML = "3";
		paddleX = (w - PADDLE_WIDTH) / 2;
		initBricks();
		resetBall();
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
	const lifeSep = document.createTextNode("  Lives: ");
	this.navigation.appendChild(lifeSep);
	this.livesDisplay = document.createElement("span");
	this.livesDisplay.innerHTML = "3";
	this.navigation.appendChild(this.livesDisplay);
	this.gameContainer.appendChild(this.navigation);

	const eventKeydown = function(event) {
		if (that.gameOver || that.won) {
			if (event.key === "r" || event.key === "R") {
				resetGame();
			}
			return;
		}
		switch (event.key) {
		case "ArrowLeft":
			paddleX = Math.max(0, paddleX - 20);
			if (ballOnPaddle) ballX = paddleX + PADDLE_WIDTH / 2;
			break;
		case "ArrowRight":
			paddleX = Math.min(w - PADDLE_WIDTH, paddleX + 20);
			if (ballOnPaddle) ballX = paddleX + PADDLE_WIDTH / 2;
			break;
		case " ":
			if (ballOnPaddle) launchBall();
			break;
		}
		if (["ArrowLeft", "ArrowRight", " "].includes(event.key)) {
			if (event.preventDefault) event.preventDefault();
			if (event.stopPropagation) event.stopPropagation();
			event.returnValue = false;
			event.cancelBubble = true;
			return false;
		}
		if (event.key === "Escape") {
			that.destroy();
		}
	};
	document.addEventListener("keydown", eventKeydown, false);

	const eventMouseMove = function(event) {
		if (event.clientX !== undefined) {
			paddleX = event.clientX - PADDLE_WIDTH / 2;
			if (paddleX < 0) paddleX = 0;
			if (paddleX > w - PADDLE_WIDTH) paddleX = w - PADDLE_WIDTH;
			if (ballOnPaddle) ballX = paddleX + PADDLE_WIDTH / 2;
		}
	};
	document.addEventListener("mousemove", eventMouseMove, false);

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
		ctx.fillStyle = "#111";
		ctx.fillRect(0, 0, w, h);

		const totalWidth = BRICK_COLS * (BRICK_W + BRICK_PADDING) - BRICK_PADDING;
		const offsetX = (w - totalWidth) / 2;
		for (let row = 0; row < BRICK_ROWS; row++) {
			for (let col = 0; col < BRICK_COLS; col++) {
				if (bricks[row][col]) {
					const bx = offsetX + col * (BRICK_W + BRICK_PADDING);
					const by = BRICK_TOP_OFFSET + row * (BRICK_H + BRICK_PADDING);
					ctx.fillStyle = BRICK_COLORS[row];
					ctx.fillRect(bx, by, BRICK_W, BRICK_H);
					ctx.strokeStyle = "rgba(255,255,255,0.2)";
					ctx.strokeRect(bx, by, BRICK_W, BRICK_H);
				}
			}
		}

		ctx.fillStyle = "white";
		ctx.fillRect(paddleX, h - PADDLE_Y_OFFSET, PADDLE_WIDTH, PADDLE_HEIGHT);

		ctx.beginPath();
		ctx.arc(ballX, ballY, BALL_SIZE / 2, 0, Math.PI * 2);
		ctx.fillStyle = "white";
		ctx.fill();

		if (that.won) {
			ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
			ctx.fillRect(0, 0, w, h);
			ctx.fillStyle = "white";
			ctx.font = "36px Arial, sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("You Win!", w / 2, h / 2 - 20);
			ctx.font = "18px Arial, sans-serif";
			ctx.fillText("Press R to restart", w / 2, h / 2 + 20);
		} else if (that.gameOver) {
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
		if (!that.gameOver && !that.won) {
			if (ballOnPaddle) {
				ballX = paddleX + PADDLE_WIDTH / 2;
				ballY = h - PADDLE_Y_OFFSET - PADDLE_HEIGHT - BALL_SIZE / 2;
			} else {
				ballX += ballDX;
				ballY += ballDY;

				if (ballX - BALL_SIZE / 2 < 0) {
					ballX = BALL_SIZE / 2;
					ballDX = -ballDX;
				}
				if (ballX + BALL_SIZE / 2 > w) {
					ballX = w - BALL_SIZE / 2;
					ballDX = -ballDX;
				}
				if (ballY - BALL_SIZE / 2 < 0) {
					ballY = BALL_SIZE / 2;
					ballDY = -ballDY;
				}

				if (ballY + BALL_SIZE / 2 > h) {
					that.lives--;
					that.livesDisplay.innerHTML = that.lives;
					if (that.lives <= 0) {
						that.gameOver = true;
					} else {
						resetBall();
					}
				}

				if (ballDY > 0 &&
					ballY + BALL_SIZE / 2 >= h - PADDLE_Y_OFFSET &&
					ballY + BALL_SIZE / 2 <= h - PADDLE_Y_OFFSET + PADDLE_HEIGHT + 5 &&
					ballX >= paddleX - BALL_SIZE / 2 &&
					ballX <= paddleX + PADDLE_WIDTH + BALL_SIZE / 2) {
					const hitPos = (ballX - paddleX) / PADDLE_WIDTH;
					const angle = (hitPos - 0.5) * Math.PI * 0.6;
					const speed = Math.sqrt(ballDX * ballDX + ballDY * ballDY);
					ballDX = Math.sin(angle) * speed;
					ballDY = -Math.cos(angle) * speed;
					ballY = h - PADDLE_Y_OFFSET - BALL_SIZE / 2;
				}

				const totalWidth = BRICK_COLS * (BRICK_W + BRICK_PADDING) - BRICK_PADDING;
				const offsetX = (w - totalWidth) / 2;
				let hitBrick = false;
				for (let row = 0; row < BRICK_ROWS && !hitBrick; row++) {
					for (let col = 0; col < BRICK_COLS && !hitBrick; col++) {
						if (bricks[row][col]) {
							const bx = offsetX + col * (BRICK_W + BRICK_PADDING);
							const by = BRICK_TOP_OFFSET + row * (BRICK_H + BRICK_PADDING);
							if (ballX + BALL_SIZE / 2 > bx &&
								ballX - BALL_SIZE / 2 < bx + BRICK_W &&
								ballY + BALL_SIZE / 2 > by &&
								ballY - BALL_SIZE / 2 < by + BRICK_H) {
								bricks[row][col] = false;
								that.score += 10;
								that.points.innerHTML = that.score;

								const overlapLeft = (ballX + BALL_SIZE / 2) - bx;
								const overlapRight = (bx + BRICK_W) - (ballX - BALL_SIZE / 2);
								const overlapTop = (ballY + BALL_SIZE / 2) - by;
								const overlapBottom = (by + BRICK_H) - (ballY - BALL_SIZE / 2);
								if (Math.min(overlapLeft, overlapRight) < Math.min(overlapTop, overlapBottom)) {
									ballDX = -ballDX;
								} else {
									ballDY = -ballDY;
								}
								hitBrick = true;

								if (checkWin()) {
									that.won = true;
								}
							}
						}
					}
				}
			}
		}
		draw();
		setTimeout(update, 1000 / FPS);
	}

	paddleX = (w - PADDLE_WIDTH) / 2;
	initBricks();
	resetBall();
	setTimeout(update, 1000 / FPS);

	this.destroy = function() {
		document.removeEventListener("keydown", eventKeydown, false);
		document.removeEventListener("mousemove", eventMouseMove, false);
		window.removeEventListener("resize", eventResize, false);
		this.gameContainer.parentNode.removeChild(this.gameContainer);
	};
}

if (!window.GAME_INSTANCES) window.GAME_INSTANCES = [];
window.GAME_INSTANCES.push(new BreakoutGame());
