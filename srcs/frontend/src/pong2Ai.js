import { resetBall, drawScore, drawField, drawPaddle, drawBall, update, winLose, resizeCanvas, isMobileDevice, enableTouchControls, disableTouchControls } from "./pong2src.js";
import { gameState } from "./gamestate.js";

export function runPongAiGame(playerName) {

const canvas = document.getElementById('gameCanvas');
gameState.canvas = canvas;
const context = canvas.getContext('2d');

gameState.animationId = null;

gameState.paddles.player.name = playerName;
gameState.paddles.Ai.name = 'AM';

gameState.paddles.hits = 0;
gameState.scores.player1 = 0;
gameState.scores.player2 = 0;
gameState.running = false;
gameState.ended = false;
gameState.ifAi = true;
gameState.ifTournament = false;

let paddleWidth = canvas.width * 0.013;
gameState.paddles.height = canvas.height * 0.15;
let ballRadius = canvas.width * 0.008;

gameState.balls.ballAi.x = canvas.width / 2;
gameState.balls.ballAi.y = canvas.height / 2;
gameState.balls.ballAi.radius = ballRadius;
gameState.balls.ballAi.dx = 0;
gameState.balls.ballAi.dy = 0;
gameState.balls.ballAi.TimeoutId = null;

gameState.paddles.player.x = 10;
gameState.paddles.player.y = canvas.height / 2 - gameState.paddles.height / 2;
gameState.paddles.player.width = paddleWidth;
gameState.paddles.player.height = gameState.paddles.height;
gameState.paddles.player.dy = 0;

gameState.paddles.Ai.x = canvas.width - paddleWidth - 10;
gameState.paddles.Ai.y = canvas.height / 2;
gameState.paddles.Ai.width = paddleWidth;
gameState.paddles.Ai.height = gameState.paddles.height;
gameState.paddles.Ai.dy = 0;

gameState.lastScorer = '';
gameState.leftTouchZone = null;
gameState.rightTouchZone = null;

function drawFrame() {
	drawField(context, gameState.paddles.player.name, gameState.paddles.Ai.name);
	drawScore(context);
	drawPaddle(context, gameState.paddles.player, "white");
	drawPaddle(context, gameState.paddles.Ai, "red");
	drawBall(context,gameState.balls.ballAi);
}

// Funzione per aggiornare il gioco e disegnare
function gameLoop() {
	drawFrame();
	winLose(context, true);
	if (!gameState.running || gameState.ended)
		return;
	update(gameState.balls.ballAi, gameState.paddles.player, gameState.paddles.Ai, gameState.lastScorer);
	gameState.animationId = requestAnimationFrame(gameLoop);
}

function stopGame() {
	gameState.running = false;
	cancelAnimationFrame(gameState.animationId);
	disableTouchControls();
}

window.pongGameAi = {
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
			enableTouchControls(gameState.paddles.player, gameState.paddles.Ai);
		}
		gameLoop();
	},
	reset: function() {
		gameState.running = false;
		gameState.ended = false;
		gameState.scores.player1 = 0;
		gameState.scores.player2 = 0;
		gameState.lastScorer = '';
		resetBall(gameState.balls.ballAi, gameState.lastScorer, gameState.paddles.player, gameState.paddles.Ai);
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
	enableTouchControls(gameState.paddles.player, gameState.paddles.Ai);
}

window.addEventListener('resize', function() {
	if (gameState.running)
		return;
	resizeCanvas(window, paddleWidth, gameState.balls.ballAi, 
		gameState.paddles.player, gameState.paddles.Ai, gameState.lastScorer);
		if (isMobileDevice(window, navigator)) {
			disableTouchControls();
			enableTouchControls(gameState.paddles.player, gameState.paddles.Ai);
		}
	if (gameState.ended) {
		drawFrame();
		winLose(context, false);
		return;
	}
	gameLoop();
});

resizeCanvas(window, paddleWidth,gameState.balls.ballAi, 
	gameState.paddles.player, gameState.paddles.Ai, gameState.lastScorer);

drawFrame();

}