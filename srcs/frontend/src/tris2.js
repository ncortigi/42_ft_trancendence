import { gameState, TIMER_DURATION } from "./gamestate.js";
import { draw, resizeCanvasTris, checkWin, startTimer } from "./tris2src.js";

export function startNewRound() {
	const gridSize = 3;
	const ctx = gameState.canvas.getContext("2d");
	if (gameState.trisTimeout.newRound)
		clearTimeout(gameState.trisTimeout.newRound);
	if (gameState.trisTimeout.finalWinner)
		clearTimeout(gameState.trisTimeout.finalWinner);
	if (gameState.trisTimeout.tInterval)
		clearInterval(gameState.trisTimeout.tInterval);
	if (gameState.scoresTris.roundRunning === false) {
		gameState.boardTris = Array(gridSize).fill().map(() => Array(gridSize).fill(null));
		gameState.scoresTris.currentPlayer = Math.random() > 0.5 ? "X" : "O";
		gameState.scoresTris.roundWinner = null;
		gameState.trisTimeout.timer = TIMER_DURATION - gameState.scoresTris.gamePlayed;
	}
	gameState.scoresTris.roundRunning = true;
	gameState.canClick = true;
	resizeCanvasTris(ctx);
	startTimer(ctx);
}

export function runTrisGame(playerXNameArg, playerONameArg, isTournament) {
	
const canvasTris = document.getElementById("gameCanvas");
gameState.canvas = canvasTris;
const ctx = canvasTris.getContext("2d");

gameState.trisTimeout.timer = TIMER_DURATION;
gameState.trisTimeout.tInterval = null;
gameState.trisTimeout.newRound = null;
gameState.trisTimeout.finalWinner = null;
gameState.canClick = false;
gameState.running = false;
gameState.ended = false;
gameState.ifAi = false;
gameState.ifTournament = isTournament;

const gridSize = 3;
gameState.tileSize = 0;

gameState.boardTris = Array(gridSize).fill().map(() => Array(gridSize).fill(null));
gameState.scoresTris.currentPlayer = null;
gameState.scoresTris.roundWinner = null;

gameState.scoresTris.playerX = { role: 'X', score: 0, name: playerXNameArg };
gameState.scoresTris.playerO = { role: 'O', score: 0, name: playerONameArg };
gameState.scoresTris.draw = 0;
gameState.scoresTris.winner = '';
gameState.scoresTris.winCondition = { type: '', index: 0 };

gameState.canvas.addEventListener("click", function(event) {
	const x = event.offsetX;
	const y = event.offsetY;
	
	if (!gameState.canClick || gameState.scoresTris.roundWinner) return;
	
	const row = Math.floor((y - (gameState.canvas.height - gameState.tileSize * gridSize) / 3) / gameState.tileSize);
	const col = Math.floor((x - (gameState.canvas.width - gameState.tileSize * gridSize) / 2) / gameState.tileSize);
	
	if (row < 0 || row >= gridSize || col < 0 || col >= gridSize || gameState.boardTris[row][col]) return;
	
	gameState.boardTris[row][col] = gameState.scoresTris.currentPlayer;
	
	const win = checkWin();
	if (win) {
		if (gameState.trisTimeout.newRound)
			clearTimeout(gameState.trisTimeout.newRound);
		gameState.scoresTris.roundWinner = gameState.scoresTris.currentPlayer;
		gameState.scoresTris.winCondition = win;
		if (gameState.scoresTris.currentPlayer === "X")
			gameState.scoresTris.playerX.score++;
		else
			gameState.scoresTris.playerO.score++;
		gameState.canClick = false;
		gameState.scoresTris.roundRunning = false;
		gameState.trisTimeout.newRound = setTimeout(startNewRound, 2000);
	} else if (gameState.boardTris.flat().every(cell => cell)) {
		gameState.scoresTris.roundWinner = "draw";
		gameState.scoresTris.draw++;
		gameState.canClick = false;
		gameState.scoresTris.roundRunning = false;
		gameState.trisTimeout.newRound = setTimeout(startNewRound, 2000);
	} else {
		gameState.scoresTris.currentPlayer = gameState.scoresTris.currentPlayer === "X" ? "O" : "X";
		gameState.trisTimeout.timer = TIMER_DURATION - gameState.scoresTris.gamePlayed;
	}
	
	draw(ctx);
});

function resetStats() {
	gameState.scoresTris.playerX.score = 0;
	gameState.scoresTris.playerO.score = 0;
	gameState.scoresTris.draw = 0;
	gameState.scoresTris.winner = '';
	gameState.trisTimeout.newRound = null;
	gameState.trisTimeout.finalWinner = null;
	gameState.trisTimeout.tInterval = null;
	gameState.canClick = false;
	gameState.running = false;
	gameState.ended = false;
	gameState.scoresTris.winCondition = { type: '', index: 0 };
	gameState.scoresTris.roundWinner = null;
	gameState.scoresTris.currentPlayer = null;
	gameState.scoresTris.roundRunning = false;
	gameState.boardTris = Array(gridSize).fill().map(() => Array(gridSize).fill(null));
}

window.trisGame = {
	pause: function() {
		if (gameState.running) {
			gameState.running = false;
			gameState.canClick = false;
			if (gameState.trisTimeout.newRound)
				clearTimeout(gameState.trisTimeout.newRound);
			if (gameState.trisTimeout.finalWinner)
				clearTimeout(gameState.trisTimeout.finalWinner);
			if (gameState.trisTimeout.tInterval)
				clearInterval(gameState.trisTimeout.tInterval);
		}
	},
	play: function() {
		if (gameState.running || gameState.ended)
			return;
		if (gameState.trisTimeout.newRound)
			clearTimeout(gameState.trisTimeout.newRound);
		if (gameState.trisTimeout.finalWinner)
			clearTimeout(gameState.trisTimeout.finalWinner);
		if (gameState.trisTimeout.tInterval)
			clearInterval(gameState.trisTimeout.tInterval);
		gameState.canClick = true;
		gameState.running = true;
		startNewRound();
	},
	reset: function() {
		if (gameState.trisTimeout.newRound)
			clearTimeout(gameState.trisTimeout.newRound);
		if (gameState.trisTimeout.finalWinner)
			clearTimeout(gameState.trisTimeout.finalWinner);
		if (gameState.trisTimeout.tInterval)
			clearInterval(gameState.trisTimeout.tInterval);
		resetStats();
		draw(ctx);
	},
	clear: function() {
		ctx.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);
	}
};

resizeCanvasTris(ctx);

window.addEventListener("resize", function() {
	if (gameState.running)
		return;
	resizeCanvasTris(ctx);
});
}