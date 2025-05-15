import { resetBall, drawScore, drawField, drawPaddle, drawBall, update, winLose, resizeCanvas, isMobileDevice, enableTouchControls, disableTouchControls } from "./pong2src.js";
import { gameState } from "./gamestate.js";

export function runPongGame(player1Name, player2Name, isTournament) {

const canvas = document.getElementById('gameCanvas');
gameState.canvas = canvas;
const context = canvas.getContext('2d');

gameState.animationId = null;

gameState.paddles.player1.name = player1Name;
gameState.paddles.player2.name = player2Name;

gameState.paddles.hits = 0;
gameState.scores.player1 = 0;
gameState.scores.player2 = 0;
gameState.running = false;
gameState.ended = false;
gameState.ifAi = false;
gameState.ifTournament = isTournament;

let paddleWidth = canvas.width * 0.013;
gameState.paddles.height = canvas.height * 0.15;
let ballRadius = canvas.width * 0.008;

gameState.balls.ball.x = canvas.width / 2;
gameState.balls.ball.y = canvas.height / 2;
gameState.balls.ball.radius = ballRadius;
gameState.balls.ball.dx = 0;
gameState.balls.ball.dy = 0;
gameState.balls.ball.TimeoutId = null;

gameState.paddles.player1.x = 10;
gameState.paddles.player1.y = canvas.height / 2 - gameState.paddles.height / 2;
gameState.paddles.player1.width = paddleWidth;
gameState.paddles.player1.height = gameState.paddles.height;
gameState.paddles.player1.dy = 0;

gameState.paddles.player2.x = canvas.width - paddleWidth - 10;
gameState.paddles.player2.y = canvas.height / 2 - gameState.paddles.height / 2;
gameState.paddles.player2.width = paddleWidth;
gameState.paddles.player2.height = gameState.paddles.height;
gameState.paddles.player2.dy = 0;

gameState.lastScorer = '';
gameState.leftTouchZone = null;
gameState.rightTouchZone = null;


function drawFrame() {
	drawField(context, gameState.paddles.player1.name, gameState.paddles.player2.name);
	drawScore(context);
	drawPaddle(context, gameState.paddles.player1, "white");
	drawPaddle(context, gameState.paddles.player2, "white");
	drawBall(context, gameState.balls.ball);
}

// Funzione per aggiornare il gioco e disegnare
function gameLoop() {
	drawFrame();
	winLose(context, true);
	if (!gameState.running || gameState.ended)
		return;
	update(gameState.balls.ball, gameState.paddles.player1, gameState.paddles.player2, gameState.lastScorer);
	gameState.animationId = requestAnimationFrame(gameLoop);
}

function stopGame() {
	gameState.running = false;
	cancelAnimationFrame(gameState.animationId);
	disableTouchControls();
}

window.pongGame = {
	pause: function() {
		if (gameState.running) {
			stopGame();
		}
	},
	play: function() {
		if (gameState.running || gameState.ended)
			return;
		gameState.running = true;
		if (isMobileDevice(window, navigator)) {
			enableTouchControls(gameState.paddles.player1, gameState.paddles.player2);
		}
		gameLoop();
	},
	reset: function() {
		gameState.running = false;
		gameState.ended = false;
		gameState.scores.player1 = 0;
		gameState.scores.player2 = 0;
		gameState.lastScorer = '';
		resetBall(gameState.balls.ball, gameState.lastScorer, gameState.paddles.player1, gameState.paddles.player2);
		drawFrame();
		if (gameState.animationId) {
			cancelAnimationFrame(gameState.animationId);
		}
		disableTouchControls();
	},
	clear: function() {
		context.clearRect(0, 0, canvas.width, canvas.height);
	}
};

if (isMobileDevice(window, navigator)) {
	enableTouchControls(gameState.paddles.player1, gameState.paddles.player2);
}

window.addEventListener('resize', function() {
	if (gameState.running)
		return;
	resizeCanvas(window, paddleWidth, gameState.balls.ball, 
		gameState.paddles.player1, gameState.paddles.player2, gameState.lastScorer);
		if (isMobileDevice(window, navigator)) {
			disableTouchControls();
			enableTouchControls(gameState.paddles.player1, gameState.paddles.player2);
		}
	if (gameState.ended) {
		drawFrame();
		winLose(context, false);
		return;
	}
	gameLoop();
});

resizeCanvas(window, paddleWidth, gameState.balls.ball, 
	gameState.paddles.player1, gameState.paddles.player2, gameState.lastScorer);
	
drawFrame();
}