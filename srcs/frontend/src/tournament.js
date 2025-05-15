import { handlePostPongTournamentWinner, handlePostTrisTournamentWinner } from './handleApi.js';
import { general } from './classes.js';

// crea giocatori in più se serve
export function generateDummyPlayers(count) {//da togliere in futuro
	for (let i = 0; i < count; i++) {
		const id = (i + 1).toString().padStart(4, '0');
		general.tournament.addPlayer(`Dummy${id}`, id);
	}
}

export function calculateRounds(playerCount) {
	return Math.ceil(Math.log2(playerCount)) + 1;
}

// crea le coppie
function pairPlayers(players) {
	const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
	const pairs = [];
	const unmatched = [];

	while (sortedPlayers.length > 1) {
		const player1 = sortedPlayers.shift();
		let foundOpponent = false;

		for (let i = 0; i < sortedPlayers.length; i++) {
			const player2 = sortedPlayers[i];

			if (!player1.playedAgainst.includes(player2.id)) {
				pairs.push([player1, player2]);
				player1.playedAgainst.push(player2.id);
				player2.playedAgainst.push(player1.id);
				player1.opponent = player2.name;
				player2.opponent = player1.name;
				sortedPlayers.splice(i, 1);
				foundOpponent = true;
				break;
			}
		}

		if (!foundOpponent) {
			unmatched.push(player1);
		}
	}

	if (sortedPlayers.length === 1) {
		unmatched.push(sortedPlayers.shift());
	}

	return pairs;
}

// aggiorna la classifica
export function updateMatchStats(winner, loser, winnerScore, loserScore) {
	const winnerPlayer = general.tournament.players.find(p => p.id === winner);
	const loserPlayer = general.tournament.players.find(p => p.id === loser);
	const game = general.tournament.games.find(g => g.player1Id === winner || g.player2Id === winner);

	if (winnerPlayer) {
		winnerPlayer.score += 3;
		winnerPlayer.gamesPlayed += 1;
		winnerPlayer.wins += 1;
		winnerPlayer.playedAgainst.push(loser);
		winnerPlayer.opponent = null;
		winnerPlayer.pointDiff += winnerScore - loserScore;
	}
	if (loserPlayer) {
		loserPlayer.gamesPlayed += 1;
		loserPlayer.losses += 1;
		loserPlayer.playedAgainst.push(winner);
		loserPlayer.opponent = null;
		loserPlayer.pointDiff += loserScore - winnerScore;
	}
	if (game) {
		game.player1Result = game.player1Id === winner ? winnerScore : loserScore;
		game.player2Result = game.player2Id === winner ? winnerScore : loserScore;
	}
	general.tournament.players.sort((a, b) => {
        if (b.score === a.score)
            return b.pointDiff - a.pointDiff;
        return b.score - a.score;
    });
	general.tournament.roundGames++;
	if (general.tournament.roundGames >= general.tournament.games.length)
		general.tournament.roundRunning = false;
}

export async function runTournament() {
	if (general.tournament.round >= general.tournament.maxRounds) {
		general.tournamentRunning = false;

        const sortedPlayers = general.tournament.players.sort((a, b) => {
            if (b.score === a.score) {
                return b.pointDiff - a.pointDiff;
            }
            return b.score - a.score;
        });

        const winner = sortedPlayers[0];
		if (general.tournament.game === 'Pong')
			await handlePostPongTournamentWinner(winner.id);
		else if (general.tournament.game === 'Tris')
			await handlePostTrisTournamentWinner(winner.id);
		return;
	}
	general.tournament.roundRunning = true;
	const pairs = pairPlayers(general.tournament.players);
	general.tournament.games = [];
	general.tournament.addGames(pairs);
	general.tournament.roundGames = 0;
}
