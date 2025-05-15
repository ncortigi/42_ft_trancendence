import { gameState, TIMER_DURATION } from "./gamestate.js";
import { handlePostTrisGame } from "./handleApi.js";
import { general } from "./classes.js";
import { updateMatchStats } from "./tournament.js";
import { getTranslation } from "./translate.js";
import { startNewRound } from "./tris2.js";
import { startNewRoundAi, aiMove } from "./tris2Ai.js";

let horizontalMarginRatio = 0.04;
const gridSize = 3;

function drawNames(_ctx) {
	const fontSize = gameState.canvas.width * 0.03;
	const margin = gameState.canvas.width * 0.015;
	_ctx.font = `${fontSize}px Arial`;
	_ctx.fillStyle = "white";

	const name1X = margin;
	const name1Y = margin + fontSize;
	const name2X = gameState.canvas.width - margin - _ctx.measureText(gameState.scoresTris.playerO.name).width;
	const name2Y = margin + fontSize;

	_ctx.fillText(gameState.scoresTris.playerX.name, name1X, name1Y);
	_ctx.fillText(gameState.scoresTris.playerO.name, name2X, name2Y);
}

function drawScore(_ctx) {
	const fontSize = gameState.canvas.width * 0.03;
	const margin = gameState.canvas.width * 0.015;
	_ctx.font = `${fontSize}px Arial`;
	_ctx.fillStyle = "white";

	const winsText = getTranslation('wins', general.lang);
	const drawsText = getTranslation('draws', general.lang);
	const score1X = margin;

	const score1Y = 5 + margin + fontSize * 2;
	const score2X = gameState.canvas.width - margin - _ctx.measureText(winsText + ` ${gameState.scoresTris.playerO.score}`).width;
	const score2Y = 5 + margin + fontSize * 2;
	const drawX = gameState.canvas.width - margin - _ctx.measureText(drawsText + ` ${gameState.scoresTris.draw}`).width;

	_ctx.fillText(winsText + ` ${gameState.scoresTris.playerX.score}`, score1X, score1Y);
	_ctx.fillText(winsText + ` ${gameState.scoresTris.playerO.score}`, score2X, score2Y);
	_ctx.fillText(drawsText + ` ${gameState.scoresTris.draw}`, drawX, gameState.canvas.height - margin);
}

function drawLine(_startX, _startY, _endX, _endY, _color, _ctx) {
	_ctx.beginPath();
	_ctx.moveTo(_startX, _startY);
	_ctx.lineTo(_endX, _endY);
	_ctx.strokeStyle = _color;
	_ctx.lineWidth = 5;
	_ctx.stroke();
}

function drawWinningLineDiagonal(_ctx) {
	const startX = (gameState.canvas.width - gameState.tileSize * gridSize) / 2;
	const startY = (gameState.canvas.height - gameState.tileSize * gridSize) / 2;
	const endX = startX + gameState.tileSize * gridSize;
	const endY = startY + gameState.tileSize * gridSize;

	drawLine(startX, startY, endX, endY, "red", _ctx);
}

function drawWinningLineAntiDiagonal(_ctx) {
	const startX = (gameState.canvas.width - gameState.tileSize * gridSize) / 2;
	const startY = (gameState.canvas.height - gameState.tileSize * gridSize) / 2 + gameState.tileSize * gridSize;
	const endX = startX + gameState.tileSize * gridSize;
	const endY = startY - gameState.tileSize * gridSize;

	drawLine(startX, startY, endX, endY, "red", _ctx);
}

function drawWinningLineHorizontal(row, _ctx) {
	const startX = (gameState.canvas.width - gameState.tileSize * gridSize) / 2;
	const startY = (gameState.canvas.height - gameState.tileSize * gridSize) / 2 + row * gameState.tileSize + gameState.tileSize / 2;
	const endX = startX + gameState.tileSize * gridSize;
	const endY = startY;
		
	drawLine(startX, startY, endX, endY, "red", _ctx);
}

function drawWinningLineVertical(_col, _ctx) {
	const startX = (gameState.canvas.width - gameState.tileSize * gridSize) / 2 + _col * gameState.tileSize + gameState.tileSize / 2;
	const startY = (gameState.canvas.height - gameState.tileSize * gridSize) / 2;
	const endX = startX;
	const endY = startY + gameState.tileSize * gridSize;

	drawLine(startX, startY, endX, endY, "red", _ctx);
}

function drawWin(_ctx, winCondition) {
	const fontSize = gameState.canvas.width * 0.035;
	const margin = gameState.canvas.width * 0.015;
	_ctx.font = `${fontSize}px Arial`;
	_ctx.fillStyle = "red";
	const drawText = getTranslation('draw', general.lang);
	const winText = getTranslation('you', general.lang) + " " + getTranslation('won', general.lang);
	const loseText = getTranslation('you', general.lang) + " " + getTranslation('lost', general.lang);
	const message = gameState.scoresTris.roundWinner === "draw" ? drawText : winText;
	const oppositeMessage = gameState.scoresTris.roundWinner === "draw" ? drawText : loseText;
	const leftX = margin;
	const oppRightX = gameState.canvas.width - margin - _ctx.measureText(oppositeMessage).width;
	const messRightX = gameState.canvas.width - margin - _ctx.measureText(message).width;
	const y = gameState.canvas.height / 2;

	if (gameState.scoresTris.roundWinner === "draw") {
		_ctx.fillText(message, leftX, y);
		_ctx.fillText(oppositeMessage, oppRightX, y);
	} else if (gameState.scoresTris.roundWinner === "X") {
		_ctx.fillText(message, leftX, y);
		_ctx.fillText(oppositeMessage, oppRightX, y);
	} else {
		_ctx.fillText(message, messRightX, y);
		_ctx.fillText(oppositeMessage, leftX, y);
	}

	if (winCondition.type !== '') {
		if (winCondition.type === 'row') {
			drawWinningLineHorizontal(winCondition.index, _ctx);
		} else if (winCondition.type === 'col') {
			drawWinningLineVertical(winCondition.index, _ctx);
		} else if (winCondition.type === 'diag') {
			drawWinningLineDiagonal(_ctx);
		} else if (winCondition.type === 'antiDiag') {
			drawWinningLineAntiDiagonal(_ctx);
		}
		gameState.scoresTris.winCondition = { type: '', index: 0 };
	}
	gameState.scoresTris.roundRunning = false;
	gameState.scoresTris.currentPlayer = null;
	gameState.scoresTris.roundWinner = null;
}

export function checkWin() {
	for (let i = 0; i < gridSize; i++) {
		if (gameState.boardTris[i].every(cell => cell === gameState.boardTris[i][0] && cell)) {
			return { type: 'row', index: i };
		}
		if (gameState.boardTris.every(row => row[i] === gameState.boardTris[0][i] && row[i])) {
			return { type: 'col', index: i };
		}
	}
	if ([gameState.boardTris[0][0], gameState.boardTris[1][1], gameState.boardTris[2][2]].every(cell => cell === gameState.boardTris[0][0] && cell)) {
		return { type: 'diag' };
	}
	if ([gameState.boardTris[0][2], gameState.boardTris[1][1], gameState.boardTris[2][0]].every(cell => cell === gameState.boardTris[0][2] && cell)) {
		return { type: 'antiDiag' };
	}
	return null;
}

function checkBestOfFiveWinner() {
	const totalGames = gameState.scoresTris.gamePlayed;

	// Caso 1: Uno dei due giocatori ha vinto almeno 3 partite su un massimo di 5
	if (totalGames <= 5) {
		if (gameState.scoresTris.playerX.score === 3 || gameState.scoresTris.playerO.score === 3) {
			const winner = gameState.scoresTris.playerX.score === 3
				? gameState.scoresTris.playerX.name
				: gameState.scoresTris.playerO.name;
			const tale = gameState.scoresTris.playerX.score === 3 ? "X" : "O";
			gameState.ended = true;
			gameState.running = false;
			return { coin: false, name: winner, tale: tale };
		}

		// Caso 2: Dopo 5 partite, se uno è in vantaggio, vince
		if (totalGames === 5) {
			if (gameState.scoresTris.playerX.score > gameState.scoresTris.playerO.score) {
				gameState.ended = true;
				gameState.running = false;
				return { coin: false, name: gameState.scoresTris.playerX.name, tale: "X" };
			} else if (gameState.scoresTris.playerO.score > gameState.scoresTris.playerX.score) {
				gameState.ended = true;
				gameState.running = false;
				return { coin: false, name: gameState.scoresTris.playerO.name, tale: "O" };
			}
		}
	}

	// Caso 3: Si va ad oltranza fino a 10 partite
	if (totalGames > 5 && totalGames < 10) {
		if (gameState.scoresTris.playerX.score > gameState.scoresTris.playerO.score) {
			return { coin: false, name: gameState.scoresTris.playerX.name, tale: "X" };
		} else if (gameState.scoresTris.playerO.score > gameState.scoresTris.playerX.score) {
			return { coin: false, name: gameState.scoresTris.playerO.name, tale: "O" };
		}
		return { coin: false, name: null, tale: null };
	}

	// Caso 4: Dopo 10 partite, se sono in pareggio, si lancia la moneta
	if (totalGames === 10) {
		let winnerName = null;
		let coin = false;
		let tale = null;
		if (gameState.scoresTris.playerX.score > gameState.scoresTris.playerO.score) {
			winnerName = gameState.scoresTris.playerX.name;
			coin = false;
			tale = "X";
		} else if (gameState.scoresTris.playerO.score > gameState.scoresTris.playerX.score) {
			winnerName = gameState.scoresTris.playerO.name;
			coin = false;
			tale = "O";
		} else {
			if (gameState.ifAi)
				winnerName = Math.random() > 0.7 ? gameState.scoresTris.playerX.name : gameState.scoresTris.playerO.name;
			else
				winnerName = Math.random() > 0.5 ? gameState.scoresTris.playerX.name : gameState.scoresTris.playerO.name;
			winnerName === gameState.scoresTris.playerX.name ? gameState.scoresTris.playerX.score++ : gameState.scoresTris.playerO.score++;
			coin = true;
			tale = winnerName === gameState.scoresTris.playerX.name ? "X" : "O";
		}
		gameState.ended = true;
		gameState.running = false;
		return { coin: coin, name: winnerName, tale: tale };
	}

	// Caso 5: Nessun vincitore ancora
	return { coin: false, name: null, tale: null };
}

async function postTrisGameStats() {
	if (gameState.ifAi && general.isAuthenticated) {
		await handlePostTrisGame(general.game.player1Id, general.game.player2Id, general.game.mode, gameState.scoresTris.playerX.score, gameState.scoresTris.playerO.score);
	} else if (!gameState.ifAi && general.isAuthenticated && (general.isAuthenticatedOther || gameState.ifTournament)) {
		if (gameState.ifTournament) {
			if (gameState.scoresTris.playerX.score > gameState.scoresTris.playerO.score) {
				updateMatchStats(general.game.player1Id, general.game.player2Id, gameState.scoresTris.playerX.score, gameState.scoresTris.playerO.score);
			} else {
				updateMatchStats(general.game.player2Id, general.game.player1Id, gameState.scoresTris.playerO.score, gameState.scoresTris.playerX.score);
			}
		}
		await handlePostTrisGame(general.game.player1Id, general.game.player2Id, general.game.mode, gameState.scoresTris.playerX.score, gameState.scoresTris.playerO.score);
	}
}

function drawCoinFlip(_ctx, winner) {
	const winnerTale = winner.tale;
	const coinRadius = gameState.canvas.width * 0.1;
	const centerX = gameState.canvas.width / 2;
	const centerY = gameState.canvas.height / 2;
	const flipDuration = 2000;
	const flips = 5;
	const startTime = performance.now();

	function drawFrame(timestamp) {
		const elapsed = timestamp - startTime;
		const progress = Math.min(elapsed / flipDuration, 1);
		const angle = progress * Math.PI * 2 * flips;

		// Calcola la larghezza apparente della moneta per simulare la rotazione
		const scale = Math.abs(Math.cos(angle));
		const currentTale = Math.floor(progress * flips) % 2 === 0 ? "X" : "O";

		_ctx.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);
		_ctx.fillStyle = "black";
		_ctx.fillRect(0, 0, gameState.canvas.width, gameState.canvas.height);

		// Disegna la moneta
		_ctx.save();
		_ctx.translate(centerX, centerY);
		_ctx.scale(scale, 1);

		_ctx.beginPath();
		_ctx.arc(0, 0, coinRadius, 0, 2 * Math.PI);
		_ctx.fillStyle = "gold";
		_ctx.fill();
		_ctx.strokeStyle = "white";
		_ctx.lineWidth = 5;
		_ctx.stroke();
		_ctx.closePath();

		// Disegna il lato della moneta
		_ctx.fillStyle = "white";
		_ctx.font = `${coinRadius * 0.6}px Arial`;
		_ctx.textAlign = "center";
		_ctx.textBaseline = "middle";
		_ctx.fillText(progress < 1 ? currentTale : winnerTale, 0, 0);

		_ctx.restore();

		// Continua l'animazione o ferma
		if (progress < 1) {
			gameState.animationId = requestAnimationFrame(drawFrame);
		} else {
			_ctx.save();
			// Disegna la moneta ferma sul lato del vincitore
			_ctx.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);
			_ctx.fillStyle = "black";
			_ctx.fillRect(0, 0, gameState.canvas.width, gameState.canvas.height);

			_ctx.beginPath();
			_ctx.arc(centerX, centerY, coinRadius, 0, 2 * Math.PI);
			_ctx.fillStyle = "gold";
			_ctx.fill();
			_ctx.strokeStyle = "white";
			_ctx.lineWidth = 5;
			_ctx.stroke();
			_ctx.closePath();

			_ctx.fillStyle = "white";
			_ctx.font = `${coinRadius * 0.6}px Arial`;
			_ctx.textAlign = "center";
			_ctx.textBaseline = "middle";
			_ctx.fillText(winnerTale, centerX, centerY);
			_ctx.restore();

			if (gameState.animationId) {
				cancelAnimationFrame(gameState.animationId);
			}
			gameState.trisTimeout.finalWinner = setTimeout(() => {
				drawWonGame(_ctx, true);
			}, 2000);
		}
	}

	if (gameState.animationId) {
		cancelAnimationFrame(gameState.animationId);
	}
	gameState.animationId = requestAnimationFrame(drawFrame);
}

function drawWonGame(_ctx, send = false) {
	_ctx.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);
	_ctx.fillStyle = "black";
	_ctx.fillRect(0, 0, gameState.canvas.width, gameState.canvas.height);
	const fontSize = gameState.canvas.width * 0.06;
	_ctx.font = `${fontSize}px Arial`;
	_ctx.fillStyle = "red";
	const message = `${gameState.scoresTris.winner.name}` + getTranslation('gameWinner', general.lang);
	const textWidth = _ctx.measureText(message).width;
	_ctx.fillText(message, (gameState.canvas.width - textWidth) / 2, gameState.canvas.height / 2);
	if (send)
		postTrisGameStats();
}

export function draw(_ctx) {
	if (gameState.ended) {
		drawWonGame(_ctx);
		return;
	}
	gameState.scoresTris.winner = checkBestOfFiveWinner();
	if (gameState.scoresTris.winner.name) {
		if (gameState.trisTimeout.newRound)
			clearTimeout(gameState.trisTimeout.newRound);
		if (gameState.trisTimeout.finalWinner)
			clearTimeout(gameState.trisTimeout.finalWinner);
		gameState.trisTimeout.finalWinner = setTimeout(function() {
			if (gameState.scoresTris.winner.coin === true) {
				drawCoinFlip(_ctx, gameState.scoresTris.winner);
				gameState.ended = true;
				return;
			} else {
				gameState.ended = true;
				drawWonGame(_ctx, true);
				return;
			}
		}, 2000);
	}
	_ctx.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);
	_ctx.fillStyle = "black";
	_ctx.fillRect(0, 0, gameState.canvas.width, gameState.canvas.height);
		
	drawNames(_ctx);
	drawScore(_ctx);
	// Disegna la griglia
	const gridX = (gameState.canvas.width - gameState.tileSize * gridSize) / 2;
	const gridY = (gameState.canvas.height - gameState.tileSize * gridSize) / 2;

	_ctx.strokeStyle = "white";
	_ctx.lineWidth = 5;
	for (let i = 1; i < gridSize; i++) {
		drawLine(gridX + i * gameState.tileSize, gridY, gridX + i * gameState.tileSize, gridY + gameState.tileSize * gridSize, "white", _ctx);
		drawLine(gridX, gridY + i * gameState.tileSize, gridX + gameState.tileSize * gridSize, gridY + i * gameState.tileSize, "white", _ctx);
	}

	const symbolSize = gameState.tileSize / 2 * 0.6;
	for (let row = 0; row < gridSize; row++) {
		for (let col = 0; col < gridSize; col++) {
			const tile = gameState.boardTris[row][col];
			const offsetX = gridX + col * gameState.tileSize;
			const offsetY = gridY + row * gameState.tileSize;

			if (tile === "X") {
				const lineLength = symbolSize * 0.8;
				const centerX = offsetX + gameState.tileSize / 2;
				const centerY = offsetY + gameState.tileSize / 2;

				_ctx.beginPath();
				_ctx.moveTo(centerX - lineLength, centerY - lineLength);
				_ctx.lineTo(centerX + lineLength, centerY + lineLength);
				_ctx.moveTo(centerX + lineLength, centerY - lineLength);
				_ctx.lineTo(centerX - lineLength, centerY + lineLength);
				_ctx.strokeStyle = "white";
				_ctx.lineWidth = 5;
				_ctx.stroke();
			} else if (tile === "O") {
				_ctx.beginPath();
				_ctx.arc(offsetX + gameState.tileSize / 2, offsetY + gameState.tileSize / 2, symbolSize - 5, 0, 2 * Math.PI);
				_ctx.strokeStyle = "white";
				_ctx.lineWidth = 5;
				_ctx.stroke();
			}
		}
	}

	if (gameState.canClick && !gameState.scoresTris.roundWinner) {
		const fontSize = gameState.canvas.width * 0.02;
		let margin = gameState.canvas.width * 0.015;
		_ctx.font = `${fontSize}px Arial`;
		_ctx.fillStyle = "white";
		const playerName = gameState.scoresTris.currentPlayer === "X" ? gameState.scoresTris.playerX.name : gameState.scoresTris.playerO.name;

		const turnTrnsl = getTranslation('turn', general.lang);
		const turnText = general.lang === 'en' ? playerName + turnTrnsl : turnTrnsl + playerName;
		_ctx.fillText(turnText, margin, gameState.canvas.height - margin);
		margin = gameState.canvas.width * 0.03;
		const timeText = getTranslation('time', general.lang);
		if (gameState.scoresTris.currentPlayer === "X") {
			const textWidth = _ctx.measureText(timeText + " " + gameState.trisTimeout.timer).width;
			_ctx.fillText(timeText + " " + gameState.trisTimeout.timer, gridX - margin - textWidth, gridY + gameState.tileSize * gridSize / 2);
		} else if (gameState.scoresTris.currentPlayer === "O" && !gameState.ifAi) {
			const gridRightMargin = gridX + gameState.tileSize * gridSize;
			_ctx.fillText(timeText + " " + gameState.trisTimeout.timer, gridRightMargin + margin, gridY + gameState.tileSize * gridSize / 2);
		}
	}

	if (gameState.scoresTris.roundWinner)
		drawWin(_ctx, gameState.scoresTris.winCondition);
}

export function resizeCanvasTris(_ctx) {
	// Imposta un rapporto fisso
	const aspectRatio = 19 / 10;
	// Calcola le dimensioni del canvas in base alla finestra del browser
	const windowWidth = window.innerWidth * (1 - 2 * horizontalMarginRatio);
	const windowHeight = window.innerHeight - 110; // Sottrai l'altezza del footer

	let canvasWidth = windowWidth;
	let canvasHeight = windowWidth / aspectRatio;
	// Se l'altezza calcolata è maggiore dello spazio disponibile, ridimensiona in base all'altezza
	if (canvasHeight > windowHeight) {
		canvasHeight = windowHeight;
		canvasWidth = windowHeight * aspectRatio;

		// Controlla se la nuova larghezza è maggiore della larghezza disponibile
		if (canvasWidth > windowWidth) {
			canvasWidth = windowWidth;
			canvasHeight = windowWidth / aspectRatio;
		}
	}

	if (canvasWidth >= 414)
		gameState.canvas.width = canvasWidth;
	else
		gameState.canvas.width = 414;

	if (canvasHeight >= 217)
		gameState.canvas.height = canvasHeight;
	else
		gameState.canvas.height = 217;

	gameState.canvas.style.marginLeft = `${(window.innerWidth - canvasWidth) / 2}px`;
	gameState.canvas.style.marginTop = `0px`;
	const maxGridY = gameState.canvas.height * 0.05;
	gameState.tileSize = (gameState.canvas.height - maxGridY * 2) / gridSize;
	draw(_ctx);
}

function getRandomFreeTile() {
	const freeTiles = [];
	for (let row = 0; row < gridSize; row++) {
		for (let col = 0; col < gridSize; col++) {
			if (!gameState.boardTris[row][col]) {
				freeTiles.push({ row, col });
			}
		}
	}
	return freeTiles.length ? freeTiles[Math.floor(Math.random() * freeTiles.length)] : null;
}

function makeAutoMove(_ctx) {
	const tile = getRandomFreeTile();
	if (tile) {
		if (gameState.trisTimeout.newRound)
			clearTimeout(gameState.trisTimeout.newRound);
		gameState.boardTris[tile.row][tile.col] = gameState.scoresTris.currentPlayer;
		const winCondition = checkWin();
		if (winCondition) {
			gameState.scoresTris.roundWinner = gameState.scoresTris.currentPlayer;
			gameState.scoresTris.winCondition = winCondition;
			if (gameState.scoresTris.currentPlayer === "X")
				gameState.scoresTris.playerX.score++;
			else 
				gameState.scoresTris.playerO.score++;
			gameState.canClick = false;
			if (gameState.ifAi)
				gameState.trisTimeout.newRound = setTimeout(startNewRoundAi, 2000);
			else
				gameState.trisTimeout.newRound = setTimeout(startNewRound, 2000);
		} else if (gameState.boardTris.flat().every(cell => cell)) {
			gameState.scoresTris.roundWinner = "draw";
			gameState.scoresTris.draw++;
			gameState.canClick = false;
			if (gameState.ifAi)
				gameState.trisTimeout.newRound = setTimeout(startNewRoundAi, 2000);
			else
				gameState.trisTimeout.newRound = setTimeout(startNewRound, 2000);
		} else {
			gameState.scoresTris.currentPlayer = gameState.scoresTris.currentPlayer === "X" ? "O" : "X";
		}
		draw(_ctx);
	}
}

export function startTimer(_ctx) {
	if (gameState.ifAi && gameState.scoresTris.currentPlayer === "O")
		return;
	if (gameState.trisTimeout.tInterval)
		clearInterval(gameState.trisTimeout.tInterval);
	gameState.trisTimeout.tInterval = setInterval(function() {
		if (gameState.trisTimeout.timer > 0 && gameState.canClick) {
			gameState.trisTimeout.timer--;
			draw(_ctx);
		} else if (gameState.trisTimeout.timer === 0 && gameState.canClick) {
			gameState.trisTimeout.timer = TIMER_DURATION - gameState.scoresTris.gamePlayed;
			makeAutoMove(_ctx);
			if (gameState.ifAi && gameState.scoresTris.currentPlayer === "O") {
				if (gameState.trisTimeout.aiM)
					clearTimeout(gameState.trisTimeout.aiM);
				gameState.trisTimeout.aiM = setTimeout(aiMove, 550);
			}
		}
	}, 1000);
}