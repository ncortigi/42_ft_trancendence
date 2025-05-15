import { handlePostPongGame } from './handleApi.js';
import { general } from './classes.js';
import { gameState } from './gamestate.js';
import { updateMatchStats } from './tournament.js';
import { getTranslation } from './translate.js';

const horizontalMarginRatio = 0.04;
let maxSpeed = 0;
let minSpeed = 0;
let paddleSpeed = 0;
let nowBallSpeed = 0;
let botTimeoutId = null;
let justStarted = true;

export function setPaddleSpeed() {
	const availableHeight = gameState.canvas.height;
	const speed = availableHeight * 0.0086;
	return speed;
}

export function setBallSpeed() {
	const availableWidth = gameState.canvas.width;
	const speed = availableWidth * 0.008;
	const speedFactorMax = 0.016;
	const speedFactorMin = 0.008;
	maxSpeed = availableWidth * speedFactorMax;
	minSpeed = availableWidth * speedFactorMin;
	return speed;
}

export function resetBall(_ball, lastScorer, _player1Paddle, _player2Paddle) {
	if (_ball.timeoutId !== null) {
		clearTimeout(_ball.timeoutId);
	}
	if (botTimeoutId !== null) {
		clearTimeout(botTimeoutId);
	}
	// Imposta la palla nella posizione iniziale senza movimento
	_ball.x = gameState.canvas.width / 2;
	_ball.y = gameState.canvas.height / 2;
	_ball.radius = gameState.canvas.width * 0.008;
	_ball.dx = 0;
	_ball.dy = 0;
	_ball.moving = false;
	_player2Paddle.dy = 0;
	_player2Paddle.y = gameState.canvas.height / 2 - gameState.paddles.height / 2;
	_player1Paddle.dy = 0;
	_player1Paddle.y = gameState.canvas.height / 2 - gameState.paddles.height / 2;
	nowBallSpeed = setBallSpeed();
	
	_ball.timeoutId = setTimeout(() => {
		if (lastScorer === 'player1')
			_ball.dx = nowBallSpeed;
		else if (lastScorer === 'player2')
			_ball.dx = -nowBallSpeed;
		else
			_ball.dx = nowBallSpeed * (Math.random() < 0.5 ? 1 : -1);
		_ball.dy = nowBallSpeed * (Math.random() < 0.5 ? 1 : -1);
		_ball.moving = true;
		if (!justStarted) {
			justStarted = true;
		}
	}, 1000);
	if (justStarted)
		gameState.paddles.hits = 0;
}

export function resizeCanvas(window, paddleWidth, _ball, 
		_player1Paddle, _player2Paddle, lastScorer) {
	if (gameState.animationId) {
		cancelAnimationFrame(gameState.animationId);
	}
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

	// Calcola le nuove dimensioni delle racchette e della palla
	paddleWidth = gameState.canvas.width * 0.013;
	gameState.paddles.height = gameState.canvas.height * 0.15;
	// Aggiorna le dimensioni e le posizioni delle paddle
	_player1Paddle.x = 10;
	_player1Paddle.y = gameState.canvas.height / 2 - gameState.paddles.height / 2;
	_player1Paddle.width = paddleWidth;
	_player1Paddle.height = gameState.paddles.height;
	_player1Paddle.dy = 0;
	//
	_player2Paddle.x = gameState.canvas.width - paddleWidth - 10;
	_player2Paddle.y = gameState.canvas.height / 2 - gameState.paddles.height / 2;
	_player2Paddle.width = paddleWidth;
	_player2Paddle.height = gameState.paddles.height;
	_player2Paddle.dy = 0;
	// Aggiorna le velocità
	paddleSpeed = setPaddleSpeed();
	resetBall(_ball, lastScorer, _player1Paddle, _player2Paddle);
}

export function drawNames(context, player1Name, player2Name) {
	let playerFontSize = gameState.canvas.width * 0.03; // Dimensione del font come 3% della larghezza del canvas
	if (playerFontSize > 27) // Limita la dimensione dei nomi a un massimo di 27px
		playerFontSize = 27;
	context.fillStyle = 'white';
	context.font = `${playerFontSize}px Arial`;

	const playerNameOffset = gameState.canvas.height * 0.015;
	const player1TextWidth = context.measureText(player1Name).width;
	const playerNameDistanceFromCenter = gameState.canvas.width * 0.05;
	context.fillText(player1Name, gameState.canvas.width / 2 - playerNameDistanceFromCenter - player1TextWidth, gameState.canvas.height - playerNameOffset);
	context.fillText(player2Name, gameState.canvas.width / 2 + playerNameDistanceFromCenter, gameState.canvas.height - playerNameOffset);
}

export function drawField(context, player1Name, player2Name) {
	context.fillStyle = 'black';
	context.fillRect(0, 0, gameState.canvas.width, gameState.canvas.height);
	context.fillStyle = 'white';
	context.fillRect(gameState.canvas.width / 2 - 1, 0, 2, gameState.canvas.height);
	drawNames(context, player1Name, player2Name);
}

export function drawScore(context) {
	const fontSize = gameState.canvas.width * 0.03;
	context.fillStyle = 'white';
	context.font = `${fontSize}px Arial`;
	const scoreOffset = gameState.canvas.width * 0.06;

	const plyer1ScoreWidth = context.measureText(gameState.scores.player1).width;
	const plyer2ScoreWidth = context.measureText(gameState.scores.player2).width;
	context.fillText(gameState.scores.player1, gameState.canvas.width / 2 - scoreOffset - plyer1ScoreWidth / 2, fontSize + 10);
	context.fillText(gameState.scores.player2, gameState.canvas.width / 2 + scoreOffset - plyer2ScoreWidth / 2, fontSize + 10);
}

export function drawPaddle(context, paddle, color) {
	context.fillStyle = color;
	context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

export function drawBall(context, _ball) {
	context.beginPath();
	context.arc(_ball.x, _ball.y, _ball.radius, 0, Math.PI * 2);
	context.fillStyle = 'white';
	context.fill();
	context.closePath();
}

export function calcBallImpact(_ball, paddleY) {
	let impactPoint = _ball.y - (paddleY + gameState.paddles.height / 2);
	let normalizedImpact = impactPoint / (gameState.paddles.height / 2);
	let bounceAngle = normalizedImpact * (Math.PI / 4); // 45 gradi di angolo di rimbalzo massimo
	let speed = maxSpeed - (Math.abs(normalizedImpact) * (maxSpeed - minSpeed)); // Velocità basata sull'impatto

	_ball.dx = speed * Math.cos(bounceAngle);
	_ball.dy = speed * Math.sin(bounceAngle);
}

let botUpdateInterval = 1000;
let botTargetY;

export function calculateBallDestination() {
	// Evita il calcolo se la pallina è ferma o si muove verso sinistra
	if (gameState.balls.ballAi.dx <= 0) {
		if (justStarted)
			justStarted = false;
		return gameState.canvas.height / 2;
	}
	if (justStarted) {
		return gameState.canvas.height / 2;
	}
	// Calcola la traiettoria futura della pallina
	let simulatedX = gameState.balls.ballAi.x;
	let simulatedY = gameState.balls.ballAi.y;
	let simulatedDX = gameState.balls.ballAi.dx;
	let simulatedDY = gameState.balls.ballAi.dy;

	while (simulatedX > gameState.paddles.Ai.x + gameState.paddles.Ai.width && simulatedX < gameState.canvas.width) {
		simulatedX += simulatedDX;
		simulatedY += simulatedDY;

		if (simulatedY + gameState.balls.ballAi.radius >= gameState.canvas.height || simulatedY - gameState.balls.ballAi.radius <= 0) {
			simulatedDY = -simulatedDY;
		}
	}

	// Se l'angolo è troppo elevato, ignora il movimento diretto
	let angle = Math.atan2(simulatedDY, simulatedDX);
	if (Math.abs(angle) > Math.PI / 5 && gameState.balls.ballAi.x < ((gameState.canvas.width / 2) + gameState.canvas.width / 5)) { // Angoli maggiori di 36° e palla entro il 60% del campo
		return gameState.canvas.height / 2;
	}

	const minErrorFactor = gameState.paddles.height * 0.4;
	const maxErrorFactor = gameState.paddles.height * 0.7;
	const randomFactor = Math.random() * (maxErrorFactor - minErrorFactor) + minErrorFactor;
	let error = 0;

	if (simulatedY < gameState.paddles.Ai.y)
		error = -randomFactor;
	else if (simulatedY > gameState.paddles.Ai.y + gameState.paddles.Ai.height)
		error = -randomFactor;

	return simulatedY;
}

export function moveBot() {
	if (!gameState.running || gameState.ended || gameState.balls.ballAi.dx === 0) return; // Se la pallina è ferma, il bot non si muove

	botTargetY = calculateBallDestination();
	
	if (gameState.paddles.Ai.y + gameState.paddles.Ai.height / 2 < botTargetY - 10) {
		gameState.paddles.Ai.dy = paddleSpeed;
	} else if (gameState.paddles.Ai.y + gameState.paddles.Ai.height / 2 > botTargetY + 10) {
		gameState.paddles.Ai.dy = -paddleSpeed;
	} else {
		gameState.paddles.Ai.dy = 0; // Fermati se sei vicino al target
	}
	botTimeoutId = setTimeout(moveBot, botUpdateInterval);
}

export function update(_ball, _player1Paddle, _player2Paddle, lastScorer) {
	// Aggiorna la posizione della palla
	_ball.x += _ball.dx;
	_ball.y += _ball.dy;
	if (gameState.ifAi)
		moveBot();

	// Aggiorna la posizione delle paddle
	_player1Paddle.y += _player1Paddle.dy;
	_player2Paddle.y += _player2Paddle.dy;
	// Impedisci che le paddle escano dal campo
	if (_player1Paddle.y < 0) {
		_player1Paddle.y = 0;
	} else if (_player1Paddle.y + _player1Paddle.height > gameState.canvas.height) {
		_player1Paddle.y = gameState.canvas.height - _player1Paddle.height;
	}
	if (_player2Paddle.y < 0) {
		_player2Paddle.y = 0;
	} else if (_player2Paddle.y + _player2Paddle.height > gameState.canvas.height) {
		_player2Paddle.y = gameState.canvas.height - _player2Paddle.height;
	}

	// Rimbalzi sui muri
	if (_ball.y + _ball.radius > gameState.canvas.height) {
		_ball.dy = -_ball.dy;
		_ball.y = gameState.canvas.height - _ball.radius;
	}
	if (_ball.y - _ball.radius < 0) {
		_ball.dy = -_ball.dy;
		_ball.y = _ball.radius;
	}
	// Collisione con la racchetta sinistra (player1)
	if (_ball.x - _ball.radius < _player1Paddle.x + _player1Paddle.width && 
		_ball.x + _ball.radius > _player1Paddle.x && 
		_ball.y + _ball.radius > _player1Paddle.y && 
		_ball.y - _ball.radius < _player1Paddle.y + _player1Paddle.height) {
		
		gameState.paddles.hits++;
		calcBallImpact(_ball, _player1Paddle.y, maxSpeed, minSpeed);
		_ball.dx = Math.abs(_ball.dx);
	}
	// Collisione con la racchetta destra (player2)
	if (_ball.x + _ball.radius > _player2Paddle.x && 
		_ball.x - _ball.radius < _player2Paddle.x + _player2Paddle.width &&
		_ball.y + _ball.radius > _player2Paddle.y && 
		_ball.y - _ball.radius < _player2Paddle.y + _player2Paddle.height) {

		gameState.paddles.hits++;
		calcBallImpact(_ball, _player2Paddle.y, maxSpeed, minSpeed);
		_ball.dx = -Math.abs(_ball.dx);
	}
	if (gameState.paddles.hits >= 10) {
		gameState.paddles.hits = 0;
		maxSpeed += gameState.canvas.width * 0.0025;
		minSpeed += gameState.canvas.width * 0.0025;
		nowBallSpeed += gameState.canvas.width * 0.0025;
	}
	// Verifica se la pallina esce dal campo (goal a sinistra o a destra)
	if (_ball.x < 0 || _ball.x > gameState.canvas.width) {
		if (_ball.x < 0) {
			gameState.scores.player2++;
			lastScorer = 'player2';
		} else {
			gameState.scores.player1++;
			lastScorer = 'player1';
		}
		gameState.paddles.hits = 0;
		resetBall(_ball, lastScorer, _player1Paddle, _player2Paddle);
	}
}

async function postPongGameStats() {
	if (gameState.ifAi && general.isAuthenticated) {
		await handlePostPongGame(general.game.player1Id, general.game.player2Id, general.game.mode, gameState.scores.player1, gameState.scores.player2);
	} else if (!gameState.ifAi && general.isAuthenticated && (general.isAuthenticatedOther || gameState.ifTournament)) {
		if (gameState.ifTournament) {
			if (gameState.scores.player1 > gameState.scores.player2) {
				updateMatchStats(general.game.player1Id, general.game.player2Id, gameState.scores.player1, gameState.scores.player2);
			} else {
				updateMatchStats(general.game.player2Id, general.game.player1Id, gameState.scores.player2, gameState.scores.player1);
			}
		}
		await handlePostPongGame(general.game.player1Id, general.game.player2Id, general.game.mode, gameState.scores.player1, gameState.scores.player2);
	}
}

export function winLose(context, send) {
	if (gameState.scores.player1 < 11 && gameState.scores.player2 < 11) {
		return;
	} else {
		gameState.running = false;
		gameState.ended = true;
		const fontSize = gameState.canvas.width * 0.05;
		context.fillStyle = 'white';
		context.font = `${fontSize}px Arial`;

		const youText = getTranslation('you', general.lang);
		const wonText = getTranslation('won', general.lang);
		const lostText = getTranslation('lost', general.lang);
		const youTextWidth = context.measureText(youText).width;

		const centerX = gameState.canvas.width / 2;
		const centerY = gameState.canvas.height / 2;
		const gap = 20;
		if (gameState.ifAi) {
			const resultText = gameState.scores.player2 < gameState.scores.player1 ? wonText : lostText;
			if (resultText === lostText)
				context.fillStyle = 'red';
			context.fillText(youText, centerX - youTextWidth - gap, centerY);
			context.fillText(resultText, centerX + gap, centerY);
			context.fillStyle = 'white';
		} else {
			const resultPositive = youText + ' ' + wonText;
			const resultNegative = youText + ' ' + lostText;
			if (gameState.scores.player2 < gameState.scores.player1) {
				context.fillText(resultPositive, (gameState.canvas.width / 2) / 2 - fontSize * 2, gameState.canvas.height / 2);
				context.fillStyle = 'red';
				context.fillText(resultNegative, (gameState.canvas.width / 2) + (gameState.canvas.width / 2) / 2 - fontSize * 2, gameState.canvas.height / 2);
				context.fillStyle = 'white';
			} else {
				context.fillText(resultPositive, (gameState.canvas.width / 2) + (gameState.canvas.width / 2) / 2 - fontSize * 2, gameState.canvas.height / 2);
				context.fillStyle = 'red';
				context.fillText(resultNegative, (gameState.canvas.width / 2) / 2 - fontSize * 2, gameState.canvas.height / 2);
				context.fillStyle = 'white';
			}
		}
		if (send)
			postPongGameStats();
	}	
}

export function isMobileDevice(window, navigator) {
	return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;
}

export function enableTouchControls(_player1Paddle, _player2Paddle) {
	let touchStartY = 0;
	let touchEndY = 0;

	gameState.leftTouchZone = document.createElement('div');
	gameState.rightTouchZone = document.createElement('div');

	const canvasRect = gameState.canvas.getBoundingClientRect();

	// Stile delle aree touch
	[gameState.leftTouchZone, gameState.rightTouchZone].forEach(zone => {
		zone.style.position = 'absolute';
		zone.style.top = `${canvasRect.top}px`;
		zone.style.width = '50%';
		zone.style.height = `${canvasRect.height}px`;
		zone.style.zIndex = '100';
		zone.style.opacity = '0';
		document.body.appendChild(zone);
	});

	gameState.leftTouchZone.style.left = '0'; 
	gameState.rightTouchZone.style.right = '0'; 

	// Paddle sinistra (Player 2)
	gameState.leftTouchZone.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; });
	gameState.leftTouchZone.addEventListener('touchmove', (e) => {
		touchEndY = e.touches[0].clientY;
		const deltaY = touchEndY - touchStartY;
		_player1Paddle.dy = deltaY > 0 ? paddleSpeed : -paddleSpeed;
		touchStartY = touchEndY;
	});
	gameState.leftTouchZone.addEventListener('touchend', () => { _player1Paddle.dy = 0; });

	// Paddle destra (Player 1)
	gameState.rightTouchZone.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; });
	gameState.rightTouchZone.addEventListener('touchmove', (e) => {
		touchEndY = e.touches[0].clientY;
		const deltaY = touchEndY - touchStartY;
		_player2Paddle.dy = deltaY > 0 ? paddleSpeed : -paddleSpeed;
		touchStartY = touchEndY;
	});
	gameState.rightTouchZone.addEventListener('touchend', () => { _player2Paddle.dy = 0; });
}

export function disableTouchControls() {
	if (gameState.leftTouchZone) {
		gameState.leftTouchZone.remove();
		gameState.leftTouchZone = null;
	}
	if (gameState.rightTouchZone) {
		gameState.rightTouchZone.remove();
		gameState.rightTouchZone = null;
	}
}

// Funzione per gestire l'input del giocatore
window.addEventListener('keydown', function (event) {
	switch (event.key) {
		case 'w':
			if (gameState.ifAi) {
				gameState.paddles.player.dy = -paddleSpeed;
				break;
			}
			gameState.paddles.player1.dy = -paddleSpeed;
			break;
		case 's':
			if (gameState.ifAi) {
				gameState.paddles.player.dy = paddleSpeed;
				break;
			}
			gameState.paddles.player1.dy = paddleSpeed;
			break;
		case 'ArrowUp':
			if (gameState.ifAi)
				break;
			gameState.paddles.player2.dy = -paddleSpeed;
			break;
		case 'ArrowDown':
			if (gameState.ifAi)
				break;
			gameState.paddles.player2.dy = paddleSpeed;
			break;
	}
});

// Ferma la paddle quando il tasto viene rilasciato
window.addEventListener('keyup', function (event) {
	switch (event.key) {
		case 'w':
		case 's':
			if (gameState.ifAi) {
				if (event.key === 'w' && gameState.paddles.player.dy < 0) {
					gameState.paddles.player.dy = 0;
				}
				if (event.key === 's' && gameState.paddles.player.dy > 0) {
					gameState.paddles.player.dy = 0;
				}
				break;
			}
			// Se il tasto che hai rilasciato è "w" o "s", ferma il paddle
			if (event.key === 'w' && gameState.paddles.player1.dy < 0) {
				gameState.paddles.player1.dy = 0;
			}
			if (event.key === 's' && gameState.paddles.player1.dy > 0) {
				gameState.paddles.player1.dy = 0;
			}
			break;
		case 'ArrowUp':
		case 'ArrowDown':
			if (gameState.ifAi)
				break;
			// Se il tasto che hai rilasciato è "ArrowUp" o "ArrowDown", ferma il paddle
			if (event.key === 'ArrowUp' && gameState.paddles.player2.dy < 0) {
				gameState.paddles.player2.dy = 0;
			}
			if (event.key === 'ArrowDown' && gameState.paddles.player2.dy > 0) {
				gameState.paddles.player2.dy = 0;
			}
			break;
	}
});

