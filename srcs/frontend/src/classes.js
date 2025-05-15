import { runPongGame } from './pong2.js';
import { runPongAiGame } from './pong2Ai.js';
import { calculateRounds, runTournament } from './tournament.js';
import { runTrisGame } from './tris2.js';
import { runTrisAiGame } from './tris2Ai.js';

class Player {
	constructor(id, name) {
		this._id = id;
		this._name = name;
		this._email = 'email@email.com';
		this._language = 'en';
		this._description = '';
		this._image = '../public/default-avatar.jpg';
		this._friend = 0;
		this._friends = [];
		this._friendRequests = [];
		this._sentRequests = [];
		this._games = 0;
		this._wins = 0;
		this._tournamentWon = 0;
		this._gamesTris = 0;
		this._winsTris = 0;
		this._tournamentWonTris = 0;
		this._recentGames = [];
		this._recentGamesTris = [];
		this._localGames = 0;
		this._localGamesWin = 0;
		this._botGames = 0;
		this._botGamesWin = 0;
		this._tournamentGames = 0;
		this._tournamentGamesWin = 0;
		this._localTris = 0;
		this._localTrisWin = 0;
		this._botTris = 0;
		this._botTrisWin = 0;
		this._tournamentTris = 0;
		this._tournamentTrisWin = 0;
	}

	get id() {
		return this._id;
	}

	set id(value) {
		const username = value.split('#')[0];
		const id = value.split('#')[1];
		if (typeof value === 'string' && username && id && username.length <= 10 && id.length === 4 && /^[0-9]+$/.test(id))
			this._id = value;
		else
			console.log('%cInvalid value for id', 'color: red');
	}

	get name() {
		return this._name;
	}

	set name(value) {
		if (typeof value === 'string' && value.length <= 10 && value.length > 0)
			this._name = value;
		else
			console.log('%cInvalid value for name', 'color: red');
	}

	get email() {
		return this._email;
	}

	set email(value) {
		if (typeof value === 'string' && value.length <= 50 && value.length > 0)
			this._email = value;
		else
			console.log('%cInvalid value for email', 'color: red');
	}

	get language() {
		return this._language;
	}

	set language(value) {
		if (typeof value === 'string' && ['en', 'it', 'es'].includes(value))
			this._language = value;
		else
			console.log('%cInvalid value for language', 'color: red');
	}

	get description() {
		return this._description;
	}

	set description(value) {
		if (typeof value === 'string' && value.length <= 500)
			this._description = value;
		else
			console.log('%cInvalid value for description', 'color: red');
	}

	get image() {
		return this._image;
	}

	set image(value) {
		if (typeof value === 'string')
			this._image = value;
		else
			console.log('%cInvalid value for image', 'color: red');
	}

	get friend() {
		return this._friend;
	}

	set friend(value) {
		if (typeof value === 'number' && value >= 0)
			this._friend = value;
		else
			console.log('%cInvalid value for friend', 'color: red');
	}

	get friends() {
		return this._friends;
	}

	set friends(value) {
		if (Array.isArray(value))
			this._friends = value;
		else
			console.log('%cInvalid value for friends', 'color: red');
	}

	get friendRequests() {
		return this._friendRequests;
	}

	set friendRequests(value) {
		if (Array.isArray(value))
			this._friendRequests = value;
		else
			console.log('%cInvalid value for friendRequests', 'color: red');
	}

	get sentRequests() {
		return this._sentRequests;
	}

	set sentRequests(value) {
		if (Array.isArray(value))
			this._sentRequests = value;
		else
			console.log('%cInvalid value for sentRequests', 'color: red');
	}

	get games() {
		return this._games;
	}

	set games(value) {
		if (typeof value === 'number' && value >= 0)
			this._games = value;
		else
			console.log('%cInvalid value for games', 'color: red');
	}

	get wins() {
		return this._wins;
	}

	set wins(value) {
		if (typeof value === 'number' && value >= 0)
			this._wins = value;
		else
			console.log('%cInvalid value for wins', 'color: red');
	}

	get winrate() {
		return (this._games === 0 ? 0 : (this._wins / this._games * 100).toFixed(1));
	}

	get tournamentWon() {
		return this._tournamentWon;
	}

	set tournamentWon(value) {
		if (typeof value === 'number' && value >= 0)
			this._tournamentWon = value;
		else
			console.log('%cInvalid value for tournamentWon', 'color: red');
	}

	get gamesTris() {
		return this._gamesTris;
	}

	set gamesTris(value) {
		if (typeof value === 'number' && value >= 0)
			this._gamesTris = value;
		else
			console.log('%cInvalid value for gamesTris', 'color: red');
	}

	get winsTris() {
		return this._winsTris;
	}

	set winsTris(value) {
		if (typeof value === 'number' && value >= 0)
			this._winsTris = value;
		else
			console.log('%cInvalid value for winsTris', 'color: red');
	}

	get winrateTris() {
		return (this._gamesTris === 0 ? 0 : (this._winsTris / this._gamesTris * 100).toFixed(1));
	}

	get tournamentWonTris() {
		return this._tournamentWonTris;
	}

	set tournamentWonTris(value) {
		if (typeof value === 'number' && value >= 0)
			this._tournamentWonTris = value;
		else
			console.log('%cInvalid value for tournamentWonTris', 'color: red');
	}

	get recentGames() {
		return this._recentGames;
	}

	set recentGames(value) {
		if (Array.isArray(value))
			this._recentGames = value;
		else
			console.log('%cInvalid value for recentGames', 'color: red');
	}

	get recentGamesTris() {
		return this._recentGamesTris;
	}

	set recentGamesTris(value) {
		if (Array.isArray(value))
			this._recentGamesTris = value;
		else
			console.log('%cInvalid value for recentGamesTris', 'color: red');
	}

	get localGames() {
		return this._localGames;
	}

	set localGames(value) {
		if (typeof value === 'number' && value >= 0)
			this._localGames = value;
		else
			console.log('%cInvalid value for localGames', 'color: red');
	}

	get localGamesWin() {
		return this._localGamesWin;
	}

	set localGamesWin(value) {
		if (typeof value === 'number' && value >= 0)
			this._localGamesWin = value;
		else
			console.log('%cInvalid value for localGamesWin', 'color: red');
	}

	get botGames() {
		return this._botGames;
	}

	set botGames(value) {
		if (typeof value === 'number' && value >= 0)
			this._botGames = value;
		else
			console.log('%cInvalid value for botGames', 'color: red');
	}

	get botGamesWin() {
		return this._botGamesWin;
	}

	set botGamesWin(value) {
		if (typeof value === 'number' && value >= 0)
			this._botGamesWin = value;
		else
			console.log('%cInvalid value for botGamesWin', 'color: red');
	}

	get tournamentGames() {
		return this._tournamentGames;
	}

	set tournamentGames(value) {
		if (typeof value === 'number' && value >= 0)
			this._tournamentGames = value;
		else
			console.log('%cInvalid value for tournamentGames', 'color: red');
	}

	get tournamentGamesWin() {
		return this._tournamentGamesWin;
	}

	set tournamentGamesWin(value) {
		if (typeof value === 'number' && value >= 0)
			this._tournamentGamesWin = value;
		else
			console.log('%cInvalid value for tournamentGamesWin', 'color: red');
	}

	get localTris() {
		return this._localTris;
	}

	set localTris(value) {
		if (typeof value === 'number' && value >= 0)
			this._localTris = value;
		else
			console.log('%cInvalid value for localTris', 'color: red');
	}

	get localTrisWin() {
		return this._localTrisWin;
	}

	set localTrisWin(value) {
		if (typeof value === 'number' && value >= 0)
			this._localTrisWin = value;
		else
			console.log('%cInvalid value for localTrisWin', 'color: red');
	}

	get botTris() {
		return this._botTris;
	}

	set botTris(value) {
		if (typeof value === 'number' && value >= 0)
			this._botTris = value;
		else
			console.log('%cInvalid value for botTris', 'color: red');
	}

	get botTrisWin() {
		return this._botTrisWin;
	}

	set botTrisWin(value) {
		if (typeof value === 'number' && value >= 0)
			this._botTrisWin = value;
		else
			console.log('%cInvalid value for botTrisWin', 'color: red');
	}

	get tournamentTris() {
		return this._tournamentTris;
	}

	set tournamentTris(value) {
		if (typeof value === 'number' && value >= 0)
			this._tournamentTris = value;
		else
			console.log('%cInvalid value for tournamentTris', 'color: red');
	}

	get tournamentTrisWin() {
		return this._tournamentTrisWin;
	}

	set tournamentTrisWin(value) {
		if (typeof value === 'number' && value >= 0)
			this._tournamentTrisWin = value;
		else
			console.log('%cInvalid value for tournamentTrisWin', 'color: red');
	}

	reset(id) {
		this.id = id === '0000' ? 'Player01#0000' : 'Player02#0001';
		this.name = id === '0000' ? 'Player01' : 'Player02';
		this.email = 'email@email.com';
		this.language = 'en';
		this.description = 'Enter your description here...';
		this.image = '/static/default-avatar.jpg';
		this.friend = 0;
		this.friends = [];
		this.friendRequests = [];
		this.sentRequests = [];
		this.games = 0;
		this.wins = 0;
		this.tournamentWon = 0;
		this.gamesTris = 0;
		this.winsTris = 0;
		this.tournamentWonTris = 0;
		this.recentGames = [];
		this.recentGamesTris = [];
		this.localGames = 0;
		this.localGamesWin = 0;
		this.botGames = 0;
		this.botGamesWin = 0;
		this.tournamentGames = 0;
		this.tournamentGamesWin = 0;
		this.localTris = 0;
		this.localTrisWin = 0;
		this.botTris = 0;
		this.botTrisWin = 0;
		this.tournamentTris = 0;
		this.tournamentTrisWin = 0;
	}
}

class Game {
	constructor() {
		this._player1Id = 'Player01#0000';
		this._player2Id = 'Player02#0001';
		this._game = '';
		this._mode = '';
		this._player1Result = 0;
		this._player2Result = 0;
		this._winner = '';
	}

	get player1Id() {
		return this._player1Id;
	}

	set player1Id(value) {
		if (typeof value === 'string')
			this._player1Id = value;
		else
			console.log('%cInvalid value for player1Id', 'color: red');
	}

	get player2Id() {
		return this._player2Id;
	}

	set player2Id(value) {
		if (typeof value === 'string')
			this._player2Id = value;
		else
			console.log('%cInvalid value for player2Id', 'color: red');
	}

	get game() {
		return this._game;
	}

	set game(value) {
		if (typeof value === 'string' && ['Pong', 'Tris', ''].includes(value))
			this._game = value;
		else
			console.log('%cInvalid value for game', 'color: red');
	}

	get mode() {
		return this._mode;
	}

	set mode(value) {
		if (typeof value === 'string' && ['Local', 'Bot', 'Tournament', ''].includes(value))
			this._mode = value;
		else
			console.log('%cInvalid value for mode', 'color: red');
	}

	get player1Result() {
		return this._player1Result;
	}

	set player1Result(value) {
		if (typeof value === 'number' && value >= 0 && value <= 11)
			this._player1Result = value;
		else
			console.log('%cInvalid value for player1Result', 'color: red');
	}

	get player2Result() {
		return this._player2Result;
	}

	set player2Result(value) {
		if (typeof value === 'number' && value >= 0 && value <= 11)
			this._player2Result = value;
		else
			console.log('%cInvalid value for player2Result', 'color: red');
	}

	get winner() {
		return this._winner;
	}

	set winner(value) {
		if (typeof value === 'string')
			this._winner = value;
		else
			console.log('%cInvalid value for winner', 'color: red');
	}

	start(page) {
		if (page === 'pong' || page === 'pongAi' || page === 'tris' || page === 'trisAi') {
			if (general.isAuthenticated)
				this.player1Id = general.player.id;
			else 
				this.player1Id = 'Player01#0000';
			if (general.isAuthenticatedOther)
				this.player2Id = general.other.id;
			else 
				this.player2Id = 'Player02#0001';
		} else if (page === 'pongTournament' || page === 'trisTournament') {
			this.player1Id = general.tournament.games[general.tournament.roundGames].player1Id;
			this.player2Id = general.tournament.games[general.tournament.roundGames].player2Id;
		}

		const pageActions = {
			pong: () => {
				this.game = 'Pong';
				this.mode = 'Local';
				runPongGame(this.player1Id, this.player2Id, false);
			},
			pongTournament: () => {
				this.game = 'Pong';
				this.mode = 'Tournament';
				runPongGame(this.player1Id, this.player2Id, true);
			},
			pongAi: () => {
				this.game = 'Pong';
				this.mode = 'Bot';
				this.player2Id = 'AM';
				runPongAiGame(this.player1Id);
			},
			tris: () => {
				this.game = 'Tris';
				this.mode = 'Local';
				runTrisGame(this.player1Id, this.player2Id, false);
			},
			trisTournament: () => {
				this.game = 'Tris';
				this.mode = 'Tournament';
				runTrisGame(this.player1Id, this.player2Id, true);
			},
			trisAi: () => {
				this.game = 'Tris';
				this.mode = 'Bot';
				this.player2Id = 'AM';
				runTrisAiGame(this.player1Id);
			}
		}

		pageActions[page]();
		this.player1Result = 0;
		this.player2Result = 0;
		this.winner = '';
	}

	reset() {
		this.player1Id = 'Player01#0000';
		this.player2Id = 'Player02#0001';
		this.game = '';
		this.mode = '';
		this.player1Result = 0;
		this.player2Result = 0;
		this.winner = '';
	}

	softReset() {
		this.player1Result = 0;
		this.player2Result = 0;
		this.winner = '';
	}
}

class Tournament {
	constructor() {
		this._creator = 'Player01#0000';
		this._name = '';
		this._game = '';
		this._round = 0;
		this._rounds = ['firstRound', 'secondRound', 'thirdRound', 'fourthRound'];
		this._maxRounds = 4;
		this._number = 3;
		this._registered = 0;
		this._players = [];
		this._games = [];
		this._roundGames = 0;
		this._roundRunning = false;
	}

	get creator() {
		return this._creator;
	}

	set creator(value) {
		if (typeof value === 'string')
			this._creator = value;
		else
			console.log('%cInvalid value for creator', 'color: red');
	}

	get name() {
		return this._name;
	}

	set name(value) {
		if (typeof value === 'string')
			this._name = value;
		else
			console.log('%cInvalid value for name', 'color: red');
	}

	get game() {
		return this._game;
	}

	set game(value) {
		if (typeof value === 'string' && ['Pong', 'Tris', ''].includes(value))
			this._game = value;
		else
			console.log('%cInvalid value for game', 'color: red');
	}

	get round() {
		return this._round;
	}

	set round(value) {
		if (typeof value === 'number' && value >= 0 && value <= 4)
			this._round = value;
		else
			console.log('%cInvalid value for round', 'color: red');
	}

	get rounds() {
		return this._rounds;
	}

	get maxRounds() {
		return this._maxRounds;
	}

	set maxRounds(value) {
		if (typeof value === 'number' && value >= 0 && value <= 4)
			this._maxRounds = value;
		else
			console.log('%cInvalid value for maxRounds', 'color: red');
	}

	get number() {
		return this._number;
	}

	set number(value) {
		if (typeof value === 'number' && value >= 3 && value <= 8)
			this._number = value;
		else
			console.log('%cInvalid value for number', 'color: red');
	}

	get registered() {
		return this._registered;
	}

	set registered(value) {
		if (typeof value === 'number' && value >= 0 && value <= 8 && value <= this.number)
			this._registered = value;
		else
			console.log('%cInvalid value for registered', 'color: red');
	}

	get players() {
		return this._players;
	}

	set players(value) {
		if (Array.isArray(value))
			this._players = value;
		else
			console.log('%cInvalid value for players', 'color: red');
	}

	get games() {
		return this._games;
	}

	set games(value) {
		if (Array.isArray(value))
			this._games = value;
		else
			console.log('%cInvalid value for games', 'color: red');
	}

	get roundGames() {
		return this._roundGames;
	}

	set roundGames(value) {
		if (typeof value === 'number' && value >= 0)
			this._roundGames = value;
		else
			console.log('%cInvalid value for roundGames', 'color: red');
	}

	get roundRunning() {
		return this._roundRunning;
	}

	set roundRunning(value) {
		if (typeof value === 'boolean')
			this._roundRunning = value;
		else
			console.log('%cInvalid value for roundRunning', 'color: red');
	}

	reset() {
		this.creator = '0000';
		this.name = '';
		this.game = '';
		this.round = 0;
		this.maxRounds = 4;
		this.number = 3;
		this.registered = 0;
		this.players = [];
		this.games = [];
		this.roundGames = 0;
		this.roundRunning = false;
		general.tournamentRunning = false;
	}

	set(creator, name, game, number, player1) {
		this.creator = creator;
		this.name = name;
		this.game = game;
		this.number = number;
		this.round = 0;
		this.maxRounds = calculateRounds(number);
		this.registered = 0;
		this.players = [];
		this.games = [];
		this.addPlayer(player1, creator);
		for (let i = 1; i < number; i++) {
			this.players.push({ name: '--', id: '----', score: 0, pointDiff: 0, gamesPlayed: 0, wins: 0, losses: 0, playedAgainst: [], opponent: null });
		}
	}
	
	addPlayer(player, id) {
		if (this.registered >= this.number) {
			console.log('%cTournament is full', 'color: red');
			return;
		}
		if (this.players.some(player => player.id === id)) {
			console.log('%cPlayer is already registered in the tournament', 'color: red');
			return;
		}
		this.players[this.registered] = { name: player, id: id, score: 0, pointDiff: 0, gamesPlayed: 0, wins: 0, losses: 0, playedAgainst: [], opponent: null };
		this.registered++;
	}
	
	removePlayer(id) {
		const index = this.players.findIndex(player => player.id === id);
		for (let i = index; i < this.registered - 1; i++) {
			this.players[i] = this.players[i + 1];
		}
		this.players[this.registered - 1] = { name: '--', id: '----', score: 0, pointDiff: 0, gamesPlayed: 0, wins: 0, losses: 0, playedAgainst: [], opponent: null };
		this.registered--;
	}

	addGames(pairs) {
		pairs.forEach(pair => {
			this.games.push({ player1Id: pair[0].id, player1Name: pair[0].name, player2Id: pair[1].id, player2Name: pair[1].name, player1Result: 0, player2Result: 0 });
		});
	}

	isFull() {
		return (this.registered >= this.number);
	}

	start() {
		this.games = [];
		this.roundGames = 0;
		general.tournamentRunning = true;
		runTournament();
	}
}

class General {
	constructor() {
		this._isAuthenticated = false;
		this._isAuthenticatedOther = false;
		this._tournamentRunning = false;
		this._current = 'home';
		this._lang = 'en';
		this._leaderboardData = [];
		this._leaderboardDataTris = [];
		this._searchPlayersList = [];
		this._player = new Player('Player01#0000', 'Player01');
		this._other = new Player('Player02#0001', 'Player02');
		this._game = new Game();
		this._tournament = new Tournament();
	}

	get isAuthenticated() {
		return this._isAuthenticated;
	}

	set isAuthenticated(value) {
		if (typeof value === 'boolean')
			this._isAuthenticated = value;
		else
			console.log('%cInvalid value for isAuthenticated', 'color: red');
	}

	get isAuthenticatedOther() {
		return this._isAuthenticatedOther;
	}

	set isAuthenticatedOther(value) {
		if (typeof value === 'boolean')
			this._isAuthenticatedOther = value;
		else
			console.log('%cInvalid value for isAuthenticatedOther', 'color: red');
	}

	get tournamentRunning() {
		return this._tournamentRunning;
	}

	set tournamentRunning(value) {
		if (typeof value === 'boolean')
			this._tournamentRunning = value;
		else
			console.log('%cInvalid value for tournamentRunning', 'color: red');
	}

	get current() {
		return this._current;
	}

	set current(value) {
		if (typeof value === 'string')
			this._current = value;
		else
			console.log('%cInvalid value for current', 'color: red');
	}

	get lang() {
		return this._lang;
	}

	set lang(value) {
		if (typeof value === 'string' && ['en', 'it', 'es'].includes(value))
			this._lang = value;
		else
			console.log('%cInvalid value for lang', 'color: red');
	}

	get leaderboardData() {
		return this._leaderboardData;
	}

	set leaderboardData(value) {
		if (Array.isArray(value))
			this._leaderboardData = value;
		else
			console.log('%cInvalid value for leaderboardData', 'color: red');
	}

	get leaderboardDataTris() {
		return this._leaderboardDataTris;
	}

	set leaderboardDataTris(value) {
		if (Array.isArray(value))
			this._leaderboardDataTris = value;
		else
			console.log('%cInvalid value for leaderboardDataTris', 'color: red');
	}

	get searchPlayersList() {
		return this._searchPlayersList;
	}

	set searchPlayersList(value) {
		if (Array.isArray(value))
			this._searchPlayersList = value;
		else
			console.log('%cInvalid value for searchPlayersList', 'color: red');
	}

	get player() {
		return this._player;
	}

	set player(value) {
		if (value instanceof Player)
			this._player = value;
		else
			console.log('%cInvalid value for player', 'color: red');
	}

	get other() {
		return this._other;
	}

	set other(value) {
		if (value instanceof Player)
			this._other = value;
		else
			console.log('%cInvalid value for other', 'color: red');
	}

	get game() {
		return this._game;
	}

	set game(value) {
		if (value instanceof Game)
			this._game = value;
		else
			console.log('%cInvalid value for game', 'color: red');
	}

	get tournament() {
		return this._tournament;
	}

	set tournament(value) {
		if (value instanceof Tournament)
			this._tournament = value;
		else
			console.log('%cInvalid value for tournament', 'color: red');
	}
}

export const general = new General();