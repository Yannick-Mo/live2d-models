function PongGame() {
	const that = this;
	let w = document.documentElement.clientWidth, h = document.documentElement.clientHeight;
	const FPS = 60;
	this.gameOver = false;
	this.won = false;
	this.playerScore = 0;
	this.aiScore = 0;

	const PADDLE_W = 12;
	const PADDLE_H = 80;
	const BALL_SIZE = 10;
	const WIN_SCORE = 5;
	const INITIAL_BALL_SPEED = 5;

	let playerY = 0, aiY = 0;
	let ballX = 0, ballY = 0;
	let ballDX = 0, ballDY = 0;
	let ballSpeed = INITIAL_BALL_SPEED;
	let ballAngle = 0;
	let aiTargetY = 0;

	function resetBall() {
		ballX = w / 2;
		ballY = h / 2;
		ballSpeed = INITIAL_BALL_SPEED;
		const angle = (Math.random() * Math.PI / 3) - Math.PI / 6;
		const dir = Math.random() < 0.5 ? 1 : -1;
		ballDX = Math.cos(angle) * ballSpeed * dir;
		ballDY = Math.sin(angle) * ballSpeed;
	}

	function resetGame() {
		that.gameOver = false;
		that.won = false;
		that.playerScore = 0;
		that.aiScore = 0;
		that.pScore.innerHTML = "0";
		that.aScore.innerHTML = "0";
		playerY = (h - PADDLE_H) / 2;
		aiY = (h - PADDLE_H) / 2;
		aiTargetY = aiY;
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
	this.ctx.fillStyle = "#111";
	this.ctx.strokeStyle = "#111";

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
	this.navigation.innerHTML = "Player: ";
	this.pScore = document.createElement("span");
	this.pScore.innerHTML = "0";
	this.navigation.appendChild(this.pScore);
	const sep = document.createTextNode("  AI: ");
	this.navigation.appendChild(sep);
	this.aScore = document.createElement("span");
	this.aScore.innerHTML = "0";
	this.navigation.appendChild(this.aScore);
	this.gameContainer.appendChild(this.navigation);

	const eventKeydown = function(event) {
		if (that.gameOver || that.won) {
			if (event.key === "r" || event.key === "R") {
				resetGame();
			}
			return;
		}
		if (event.key === "Escape") {
			that.destroy();
		}
		if (event.preventDefault) event.preventDefault();
		if (event.stopPropagation) event.stopPropagation();
		event.returnValue = false;
		event.cancelBubble = true;
		return false;
	};
	document.addEventListener("keydown", eventKeydown, false);

	const eventMouseMove = function(event) {
		if (event.clientY !== undefined) {
			playerY = event.clientY - PADDLE_H / 2;
			if (playerY < 0) playerY = 0;
			if (playerY > h - PADDLE_H) playerY = h - PADDLE_H;
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

	let keysDown = {};
	const eventKeyUp = function(event) {
		delete keysDown[event.key];
	};
	const eventKeyDownTrack = function(event) {
		keysDown[event.key] = true;
	};
	document.addEventListener("keydown", eventKeyDownTrack, false);
	document.addEventListener("keyup", eventKeyUp, false);

	const PADDLE_SPEED = 6;

	function draw() {
		const ctx = that.ctx;
		ctx.fillStyle = "#111";
		ctx.fillRect(0, 0, w, h);

		ctx.setLineDash([8, 10]);
		ctx.strokeStyle = "rgba(255,255,255,0.3)";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(w / 2, 0);
		ctx.lineTo(w / 2, h);
		ctx.stroke();
		ctx.setLineDash([]);

		ctx.fillStyle = "white";
		ctx.fillRect(10, playerY, PADDLE_W, PADDLE_H);
		ctx.fillRect(w - 10 - PADDLE_W, aiY, PADDLE_W, PADDLE_H);

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
			ctx.fillText("AI Wins!", w / 2, h / 2 - 20);
			ctx.font = "18px Arial, sans-serif";
			ctx.fillText("Press R to restart", w / 2, h / 2 + 20);
		}
	}

	function update() {
		if (!that.gameOver && !that.won) {
			if (keysDown["ArrowUp"]) {
				playerY -= PADDLE_SPEED;
				if (playerY < 0) playerY = 0;
			}
			if (keysDown["ArrowDown"]) {
				playerY += PADDLE_SPEED;
				if (playerY > h - PADDLE_H) playerY = h - PADDLE_H;
			}

			aiTargetY = ballY - PADDLE_H / 2;
			if (aiTargetY < 0) aiTargetY = 0;
			if (aiTargetY > h - PADDLE_H) aiTargetY = h - PADDLE_H;
			const aiDiff = aiTargetY - aiY;
			if (Math.abs(aiDiff) > 3) {
				aiY += Math.sign(aiDiff) * Math.min(Math.abs(aiDiff), 4);
			}

			ballX += ballDX;
			ballY += ballDY;

			if (ballY - BALL_SIZE / 2 < 0) {
				ballY = BALL_SIZE / 2;
				ballDY = -ballDY;
			}
			if (ballY + BALL_SIZE / 2 > h) {
				ballY = h - BALL_SIZE / 2;
				ballDY = -ballDY;
			}

			if (ballX - BALL_SIZE / 2 < 0) {
				that.aiScore++;
				that.aScore.innerHTML = that.aiScore;
				if (that.aiScore >= WIN_SCORE) {
					that.gameOver = true;
				} else {
					resetBall();
				}
			}
			if (ballX + BALL_SIZE / 2 > w) {
				that.playerScore++;
				that.pScore.innerHTML = that.playerScore;
				if (that.playerScore >= WIN_SCORE) {
					that.won = true;
				} else {
					resetBall();
				}
			}

			if (ballDX < 0 &&
				ballX - BALL_SIZE / 2 <= 10 + PADDLE_W &&
				ballX - BALL_SIZE / 2 >= 10 &&
				ballY >= playerY &&
				ballY <= playerY + PADDLE_H) {
				const relY = (ballY - (playerY + PADDLE_H / 2)) / (PADDLE_H / 2);
				const angle = relY * Math.PI / 4;
				ballSpeed *= 1.05;
				ballDX = Math.cos(angle) * ballSpeed;
				ballDY = Math.sin(angle) * ballSpeed;
				ballX = 10 + PADDLE_W + BALL_SIZE / 2;
			}

			if (ballDX > 0 &&
				ballX + BALL_SIZE / 2 >= w - 10 - PADDLE_W &&
				ballX + BALL_SIZE / 2 <= w - 10 &&
				ballY >= aiY &&
				ballY <= aiY + PADDLE_H) {
				const relY = (ballY - (aiY + PADDLE_H / 2)) / (PADDLE_H / 2);
				const angle = relY * Math.PI / 4;
				ballSpeed *= 1.05;
				ballDX = -Math.cos(angle) * ballSpeed;
				ballDY = Math.sin(angle) * ballSpeed;
				ballX = w - 10 - PADDLE_W - BALL_SIZE / 2;
			}
		}
		draw();
		setTimeout(update, 1000 / FPS);
	}

	playerY = (h - PADDLE_H) / 2;
	aiY = (h - PADDLE_H) / 2;
	aiTargetY = aiY;
	resetBall();
	setTimeout(update, 1000 / FPS);

	this.destroy = function() {
		document.removeEventListener("keydown", eventKeydown, false);
		document.removeEventListener("keydown", eventKeyDownTrack, false);
		document.removeEventListener("keyup", eventKeyUp, false);
		document.removeEventListener("mousemove", eventMouseMove, false);
		window.removeEventListener("resize", eventResize, false);
		this.gameContainer.parentNode.removeChild(this.gameContainer);
	};
}

if (!window.GAME_INSTANCES) window.GAME_INSTANCES = [];
window.GAME_INSTANCES.push(new PongGame());
