function FlappyGame() {
	const that = this;
	let w = document.documentElement.clientWidth, h = document.documentElement.clientHeight;
	const FPS = 60;
	this.gameOver = false;
	this.score = 0;

	const BIRD_SIZE = 20;
	let birdX = w * 0.3;
	let birdY = h / 2;
	let birdVY = 0;
	const GRAVITY = 0.5;
	const FLAP_VELOCITY = -8;

	const PIPE_WIDTH = 60;
	const PIPE_GAP = 150;
	const PIPE_SPEED = 3;
	const PIPE_SPACING = 280;
	let pipes = [];
	let frameCount = 0;

	const GROUND_HEIGHT = Math.floor(h * 0.1);
	const GROUND_Y = h - GROUND_HEIGHT;

	function resetGame() {
		that.gameOver = false;
		that.score = 0;
		that.points.innerHTML = "0";
		birdY = h / 2;
		birdVY = 0;
		pipes = [];
		frameCount = 0;
	}

	function addPipe() {
		const minPipeHeight = 60;
		const maxPipeHeight = GROUND_Y - PIPE_GAP - minPipeHeight;
		const topHeight = minPipeHeight + Math.random() * (maxPipeHeight - minPipeHeight);
		pipes.push({
			x: w,
			topHeight: topHeight,
			bottomY: topHeight + PIPE_GAP,
			scored: false
		});
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

	function flap() {
		if (!that.gameOver) {
			birdVY = FLAP_VELOCITY;
		}
	}

	const eventKeydown = function(event) {
		if (that.gameOver) {
			if (event.key === "r" || event.key === "R") {
				resetGame();
			}
			return;
		}
		if (event.key === " ") {
			flap();
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

	const eventClick = function(event) {
		if (that.gameOver) return;
		flap();
		if (event.preventDefault) event.preventDefault();
		if (event.stopPropagation) event.stopPropagation();
		event.returnValue = false;
		event.cancelBubble = true;
		return false;
	};
	document.addEventListener("click", eventClick, false);

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

		ctx.fillStyle = "#8B4513";
		ctx.fillRect(0, GROUND_Y, w, GROUND_HEIGHT);
		ctx.fillStyle = "#228B22";
		ctx.fillRect(0, GROUND_Y, w, 4);

		for (let i = 0; i < pipes.length; i++) {
			const p = pipes[i];
			ctx.fillStyle = "#2E7D32";
			ctx.fillRect(p.x, 0, PIPE_WIDTH, p.topHeight);
			ctx.fillRect(p.x, p.bottomY, PIPE_WIDTH, GROUND_Y - p.bottomY);
			ctx.fillStyle = "#4CAF50";
			ctx.fillRect(p.x - 4, p.topHeight - 20, PIPE_WIDTH + 8, 20);
			ctx.fillRect(p.x - 4, p.bottomY, PIPE_WIDTH + 8, 20);
		}

		ctx.beginPath();
		ctx.arc(birdX, birdY, BIRD_SIZE / 2, 0, Math.PI * 2);
		ctx.fillStyle = "#FFD700";
		ctx.fill();
		ctx.strokeStyle = "#FFA000";
		ctx.lineWidth = 2;
		ctx.stroke();

		if (that.gameOver) {
			ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
			ctx.fillRect(0, 0, w, h);
			ctx.fillStyle = "white";
			ctx.font = "36px Arial, sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("Game Over", w / 2, h / 2 - 30);
			ctx.font = "24px Arial, sans-serif";
			ctx.fillText("Score: " + that.score, w / 2, h / 2 + 10);
			ctx.font = "18px Arial, sans-serif";
			ctx.fillText("Press R to restart", w / 2, h / 2 + 50);
		}
	}

	function update() {
		if (!that.gameOver) {
			birdVY += GRAVITY;
			birdY += birdVY;

			if (birdY + BIRD_SIZE / 2 > GROUND_Y) {
				birdY = GROUND_Y - BIRD_SIZE / 2;
				that.gameOver = true;
			}
			if (birdY - BIRD_SIZE / 2 < 0) {
				birdY = BIRD_SIZE / 2;
				birdVY = 0;
			}

			frameCount++;
			if (frameCount % Math.floor(PIPE_SPACING / PIPE_SPEED) === 0) {
				addPipe();
			}

			for (let i = pipes.length - 1; i >= 0; i--) {
				pipes[i].x -= PIPE_SPEED;
				if (pipes[i].x + PIPE_WIDTH < 0) {
					pipes.splice(i, 1);
					continue;
				}
				if (!pipes[i].scored && pipes[i].x + PIPE_WIDTH < birdX) {
					pipes[i].scored = true;
					that.score++;
					that.points.innerHTML = that.score;
				}
			}

			for (let i = 0; i < pipes.length; i++) {
				const p = pipes[i];
				if (birdX + BIRD_SIZE / 2 > p.x &&
					birdX - BIRD_SIZE / 2 < p.x + PIPE_WIDTH) {
					if (birdY - BIRD_SIZE / 2 < p.topHeight ||
						birdY + BIRD_SIZE / 2 > p.bottomY) {
						that.gameOver = true;
						break;
					}
				}
			}
		}
		draw();
		setTimeout(update, 1000 / FPS);
	}

	setTimeout(update, 1000 / FPS);

	this.destroy = function() {
		document.removeEventListener("keydown", eventKeydown, false);
		document.removeEventListener("click", eventClick, false);
		window.removeEventListener("resize", eventResize, false);
		this.gameContainer.parentNode.removeChild(this.gameContainer);
	};
}

if (!window.GAME_INSTANCES) window.GAME_INSTANCES = [];
window.GAME_INSTANCES.push(new FlappyGame());
