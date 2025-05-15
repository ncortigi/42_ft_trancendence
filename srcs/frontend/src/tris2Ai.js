import { gameState, TIMER_DURATION } from "./gamestate.js";
import { draw, resizeCanvasTris, checkWin, startTimer } from "./tris2src.js";

export function aiMove() {
	const gridSize = 3;
	const ctx = gameState.canvas.getContext("2d");
	const freeTiles = [];
	const player = "X";
	const ai = "O";

	for (let row = 0; row < gridSize; row++) {
		for (let col = 0; col < gridSize; col++) {
			if (!gameState.boardTris[row][col]) {
				freeTiles.push({ row, col });
			}
		}
	}

	const isBoardEmpty = gameState.boardTris.flat().every(cell => cell === null);

	// Funzione per controllare se c'è una possibile vittoria in due mosse
	function checkPotentialWin(board, role) {
		if (isBoardEmpty) {
			const center = Math.floor(gridSize / 2);
			return { row: center, col: center };
		}
		for (let row = 0; row < gridSize; row++) {
			for (let col = 0; col < gridSize; col++) {
				if (board[row][col] === null) {
					board[row][col] = role;
					const win = checkWin(board);
					board[row][col] = null;
					if (win) {
						return { row, col };
					}
				}
			}
		}
		return null;
	}

	let bestMove = checkPotentialWin(gameState.boardTris, ai);

	if (!bestMove) bestMove = checkPotentialWin(gameState.boardTris, player);

	if (!bestMove) {
		const corners = freeTiles.filter(({ row, col }) => row % 2 === 0 && col % 2 === 0);
		if (corners.length > 0) {
			const playerMoves = freeTiles.filter(({ row, col }) => gameState.boardTris[row][col] === player);
			if (playerMoves.length > 0) {
				const playerMove = playerMoves[0];
				const oppositeCorner = corners.find(({ row, col }) => row !== playerMove.row && col !== playerMove.col);
				if (oppositeCorner) {
					bestMove = oppositeCorner;
				}
			}
		}
	}

	if (!bestMove) {
		const corners = freeTiles.filter(({ row, col }) => row % 2 === 0 && col % 2 === 0);
		if (corners.length > 0) {
			bestMove = corners[Math.floor(Math.random() * corners.length)];
		}
	}

	if (!bestMove)
		bestMove = freeTiles[Math.floor(Math.random() * freeTiles.length)];
	
	if (bestMove) {
		const { row, col } = bestMove;
		gameState.boardTris[row][col] = ai;

		const win = checkWin();
		if (win) {
			gameState.scoresTris.roundWinner = ai;
			gameState.scoresTris.winCondition = win;
			gameState.scoresTris.playerO.score++;
			gameState.canClick = false;
			gameState.scoresTris.roundRunning = false;
			gameState.trisTimeout.newRound = setTimeout(startNewRoundAi, 2000);
		} else if (gameState.boardTris.flat().every(cell => cell)) {
			gameState.scoresTris.roundWinner = "draw";
			gameState.scoresTris.draw++;
			gameState.canClick = false;
			gameState.scoresTris.roundRunning = false;
			gameState.trisTimeout.newRound = setTimeout(startNewRoundAi, 2000);
		} else {
			gameState.scoresTris.currentPlayer = player;
			gameState.trisTimeout.timer =  TIMER_DURATION - gameState.scoresTris.gamePlayed;
		}
	}

	draw(ctx);
}

export function startNewRoundAi() {
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
	if (gameState.scoresTris.currentPlayer === "O")
		aiMove();
	if (gameState.scoresTris.currentPlayer === "X")
		gameState.canClick = true;
	resizeCanvasTris(ctx);
	startTimer(ctx);
}

export function runTrisAiGame(playerNameArg) {

const canvasTris = document.getElementById("gameCanvas");
gameState.canvas = canvasTris;
const ctx = canvasTris.getContext("2d");

gameState.trisTimeout.timer = TIMER_DURATION;
gameState.trisTimeout.tInterval = null;
gameState.trisTimeout.newRound = null;
gameState.trisTimeout.finalWinner = null;
gameState.trisTimeout.aiM = null;
gameState.canClick = false;
gameState.running = false;
gameState.ended = false;
gameState.ifAi = true;
gameState.ifTournament = false;

const gridSize = 3;
gameState.tileSize = 0;

gameState.boardTris = Array(gridSize).fill().map(() => Array(gridSize).fill(null));
gameState.scoresTris.currentPlayer = null;
gameState.scoresTris.roundWinner = null;

gameState.scoresTris.playerX = { role: 'X', score: 0, name: playerNameArg };
gameState.scoresTris.playerO = { role: 'O', score: 0, name: "AM" };
gameState.scoresTris.draw = 0;
gameState.scoresTris.winner = '';
gameState.scoresTris.winCondition = { type: '', index: 0 };

gameState.canvas.addEventListener("click", function(event) {
	const x = event.offsetX;
	const y = event.offsetY;
	
	if (!gameState.canClick || gameState.scoresTris.roundWinner || (gameState.ifAi && gameState.scoresTris.currentPlayer === "O"))
		return;
	const row = Math.floor((y - (gameState.canvas.height - gameState.tileSize * gridSize) / 3) / gameState.tileSize);
	const col = Math.floor((x - (gameState.canvas.width - gameState.tileSize * gridSize) / 2) / gameState.tileSize);
	
	if (row < 0 || row >= gridSize || col < 0 || col >= gridSize || gameState.boardTris[row][col])
		return;

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
	gameState.trisTimeout.newRound = setTimeout(startNewRoundAi, 2000);
} else if (gameState.boardTris.flat().every(cell => cell)) {
	gameState.scoresTris.roundWinner = "draw";
	gameState.scoresTris.draw++;
	gameState.canClick = false;
	gameState.scoresTris.roundRunning = false;
	gameState.trisTimeout.newRound = setTimeout(startNewRoundAi, 2000);
} else {
	gameState.scoresTris.currentPlayer = gameState.scoresTris.currentPlayer === "X" ? "O" : "X";
	if (gameState.scoresTris.currentPlayer === "X")
		gameState.trisTimeout.timer = TIMER_DURATION - gameState.scoresTris.gamePlayed;

	if (gameState.scoresTris.currentPlayer === "O") {
		if (gameState.trisTimeout.aiM)
			clearTimeout(gameState.trisTimeout.aiM);
		gameState.trisTimeout.aiM = setTimeout(aiMove, 500);
	}
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
	gameState.trisTimeout.aiM = null;
	gameState.canClick = false;
	gameState.running = false;
	gameState.ended = false;
	gameState.scoresTris.winCondition = { type: '', index: 0 };
	gameState.scoresTris.roundWinner = null;
	gameState.scoresTris.currentPlayer = null;
	gameState.scoresTris.roundRunning = false;
	gameState.boardTris = Array(gridSize).fill().map(() => Array(gridSize).fill(null));
}

window.trisGameAi = {
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
			if (gameState.trisTimeout.aiM)
				clearTimeout(gameState.trisTimeout.aiM);
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
		if (gameState.trisTimeout.aiM)
			clearTimeout(gameState.trisTimeout.aiM);
		gameState.running = true;
		startNewRoundAi();
	},
	reset: function() {
		if (gameState.trisTimeout.newRound)
			clearTimeout(gameState.trisTimeout.newRound);
		if (gameState.trisTimeout.finalWinner)
			clearTimeout(gameState.trisTimeout.finalWinner);
		if (gameState.trisTimeout.tInterval)
			clearInterval(gameState.trisTimeout.tInterval);
		if (gameState.trisTimeout.aiM)
			clearTimeout(gameState.trisTimeout.aiM);
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