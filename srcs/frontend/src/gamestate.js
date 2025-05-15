export const gameState = {
	balls: {
	   ball: { x: 0, y: 0, dx: 0, dy: 0, radius: 0, TimeoutId: null },
	   ballAi: { x: 0, y: 0, dx: 0, dy: 0, radius: 0, TimeoutId: null }
	},
	paddles: {
		player1: { x: 0, y: 0, width: 0, height: 0, dy: 0, name: ''},
		player2: { x: 0, y: 0, width: 0, height: 0, dy: 0, name: ''},
		player: { x: 0, y: 0, width: 0, height: 0, dy: 0, name: ''},
		Ai: { x: 0, y: 0, width: 0, height: 0, dy: 0, name: 'AM'},
		height: 0, hits : 0
	},
	scores: { player1: 0, player2: 0 },
	scoresTris: {
		playerX: { role: '', score: 0, name: ''},
		playerO: { role: '', score: 0, name: ''},
		winCondition: { type: '', index: 0 },
		draw: 0, currentPlayer: null, roundWinner: null, winner: { coin: false, name: '', role: '' },
		roundRunning: false,
		get gamePlayed() {
			return this.playerX.score + this.playerO.score + this.draw;
		}
	},
	trisTimeout: { newRound: null, finalWinner: null, timer: null, tInterval: null, aiM: null },
	boardTris: [],
	tileSize: 0,
	canClick: false,
	lastScorer: '',
	running: false,
	ended: false,
	canvas: { width: 0, height: 0 },
	leftTouchZone: null,
	rightTouchZone: null,
	animationId: null,
	ifAi: false,
	ifTournament: false,
};

export const TIMER_DURATION = 10;
