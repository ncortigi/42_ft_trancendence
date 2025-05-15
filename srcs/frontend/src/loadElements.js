import { general } from './classes.js';
import { getTranslation } from './translate.js';

// Lista giocatori torneo
export function renderTournamentRoom(tournament) {
	const tournamentNameElement = document.getElementById('tournamentRoomName');
	const tournamentRoomElement = document.getElementById('tournamentRoomList');
	tournamentNameElement.textContent = tournament.name;
	tournamentRoomElement.innerHTML = '';
	tournament.players.forEach(player => {
		tournamentRoomElement.innerHTML += `
			<li class="list-group-item d-flex justify-content-between align-items-center bg-dark text-white">
				${player.id}
				${player.id === tournament.creator ? '<span class="badge bg-success" data-translate="creator">Creator</span>' : player.id === '----' ? 
					'<button class="btn btn-success btn-sm join-tournament-btn" data-translate="login">Log in</button>' : 
					`<button class="btn btn-danger btn-sm kick-player-btn" data-translate="kick" data-uid="${player.id}">Kick</button>`}
			</li>
		`;
	});
}

// Funzione per caricare la classifica del torneo e la lista di partite
export function renderTournament(tournament, running) {
	const tournamentNameElement = document.getElementById('tournamentRoomName');
	const tournamentLeaderboardElement = document.getElementById('leaderboardTournament');
	const tournamentRoundElement = document.getElementById(running ? 'roundName' : 'tournamentWinner');
	const tournamentMatchesElement = document.getElementById('tournamentMatchesList');
	tournamentNameElement.textContent = tournament.name;
	tournamentLeaderboardElement.innerHTML = '';
	tournamentMatchesElement.innerHTML = '';
	tournament.players.forEach(player => {
		tournamentLeaderboardElement.innerHTML += `
			<tr>
				<th scope="row">${player.id}</th>
				<td class="text-center">${player.score}</td>
				<td class="text-center">${player.gamesPlayed}</td>
				<td class="text-center">${player.wins}</td>
				<td class="text-center">${player.losses}</td>
				<td class="text-center">${player.pointDiff}</td>
			</tr>
		`;
	});
	if (!running) {
		tournamentRoundElement.textContent = general.tournament.players[0].id + getTranslation('tournamentWinner', general.lang);
		return;
	}
	tournamentRoundElement.setAttribute('data-translate', tournament.rounds[tournament.round]);
	tournament.games.forEach(match => {
		tournamentMatchesElement.innerHTML += `
			<li class="list-group-item d-flex justify-content-between align-items-center bg-dark text-white">
				<div>
					<div>${match.player1Id}</div>
					<div>${match.player2Id}</div>
				</div>
				<div class="text-center">
					<div>${match.player1Result}</div>
					<div>${match.player2Result}</div>
				</div>
			</li>
		`;
	});
}


// Funzione per caricare la classifica
export function renderLeaderboard(leaderboardData) {
	const leaderboardElement = document.getElementById('leaderboardList');
	if (leaderboardData.length === 0) {
		leaderboardElement.innerHTML = '<tr><th scope="row" colspan="5" class="text-center" data-translate="leaderboardEmpty">No leaderboard available</th></tr>';
		return;
	}
	leaderboardElement.innerHTML = '';
	leaderboardData.forEach(player => {
		leaderboardElement.innerHTML += `
			<tr>
				<th scope="row">${player.position}</th>
				<td>${player.name}</td>
				<td class="text-center">${player.wins}</td>
				<td class="text-center">${player.losses}</td>
				<td class="text-end">${player.winrate}</td>
			</tr>
		`;
	});
}

// Funzione per caricare il profilo del giocatore
export function renderPlayerInfo(player, nameId, imageId, descriptionId,)
{
	const nameElement = document.getElementById(nameId);
	nameElement.textContent = player.id;
	const playerImageElement = document.getElementById(imageId);
	playerImageElement.src = player.image;
	if (descriptionId && player.description) {
		const descriptionElement = document.getElementById(descriptionId);
		descriptionElement.value = player.description;
	}
}

// funzione per caricare le statistiche generali
export function renderStats(player, statsId, game) {
	const statsElement = document.getElementById(statsId);
	statsElement.innerHTML = '';
	statsElement.innerHTML = `
		<div class="row">
			<div class="col text-center">
				<div class="text-white fw-bold" data-translate="games">Games</div>
				<div>${game === 'pong' ? player.games : player.gamesTris }</div>
			</div>
			<div class="col text-center">
				<div class="text-white fw-bold" data-translate="wins">Wins</div>
				<div>${game === 'pong' ? player.wins : player.winsTris }</div>
			</div>
			<div class="col text-center">
				<div class="text-white fw-bold" data-translate="winrate">Win rate</div>
				<div>${game === 'pong' ? player.winrate : player.winrateTris }</div>
			</div>
		</div>
		<div class="row mt-3">
			<div class="col-5 text-center">
				<div class="text-white fw-bold" data-translate="friends">Friends</div>
				<div>${player.friend}</div>
			</div>
			<div class="col-7 text-center">
				<div class="text-white fw-bold" data-translate="tournamentWon">Tournaments won</div>
				<div>${game === 'pong' ? player.tournamentWon : player.tournamentWonTris }</div>
			</div>
		</div>
	`;
}

// funzione per caricare la lista delle partite
export function renderMatchesList(player, elementId, game) {
	const matchesListElement = document.getElementById(elementId);
	const gameMatches = game === 'pong' ? player.recentGames : player.recentGamesTris;
	if (gameMatches.length === 0) {
		matchesListElement.innerHTML = '<li class="list-group-item d-flex justify-content-between align-items-center bg-dark text-white" data-translate="noMatches">No matches played</li>';
		return;
	}
	matchesListElement.innerHTML = '';
	gameMatches.forEach(match => {
		matchesListElement.innerHTML += `
			<li class="list-group-item d-flex justify-content-between align-items-center bg-dark text-white">
				<div>
					<div>${match.player1}</div>
					<div>${match.player2}</div>
				</div>
				<div class="text-center">
					<div>${match.score1}</div>
					<div>${match.score2}</div>
				</div>
				<span class="badge bg-${match.result === 'Win' ? 'success' : 'danger'}" data-translate="${match.result.toLowerCase()}">${match.result}</span>
				<span class="badge bg-secondary" data-translate="${match.mode.toLowerCase()}">${match.mode}</span>
				<span>${match.date}</span>
			</li>
		`;
	});
}

// Lista di amici
export function renderFriendsList(player) {
	const friendsListElement = document.getElementById('friendsList');
	if (player.friends.length === 0) {
		friendsListElement.innerHTML = '<li class="list-group-item d-flex justify-content-between align-items-center bg-dark text-white" data-translate="noFriends">No friends yet</li>';
		return;
	}	
	friendsListElement.innerHTML = '';
	player.friends.forEach(friend => {
		friendsListElement.innerHTML += `
			<li class="list-group-item d-flex justify-content-between align-items-center bg-dark text-white">
				${friend.username}
				${friend.status === 'online' ? '<span class="badge bg-success" data-translate="online">Online</span>' : ''}
			</li>
		`;
	});
}

// Richieste di amicizia
export function renderFriendRequests(player) {
	const friendRequestsElement = document.getElementById('friendRequestsList');
	if (player.friendRequests.length === 0) {
		friendRequestsElement.innerHTML = '<li class="list-group-item d-flex justify-content-between align-items-center bg-dark text-white" data-translate="noRequests">No incoming friend requests</li>';
		return;
	}
	friendRequestsElement.innerHTML = '';
	player.friendRequests.forEach(request => {
		friendRequestsElement.innerHTML += `
			<li class="list-group-item d-flex justify-content-between align-items-center bg-dark text-white">
				${request.sender_uid}
				<div>
					<button class="btn btn-success btn-sm me-1 accept-request-btn" data-translate="accept"  data-uid="${request.sender_uid}">Accept</button>
					<button class="btn btn-danger btn-sm rejept-request-btn" data-translate="reject" data-uid=${request.sender_uid}">Reject</button>
				</div>
			</li>
		`;
	});
}

// Richieste di amicizia inviate
export function renderSentRequests(player) {
	const sentRequestsElement = document.getElementById('sentRequestsList');
	if (player.sentRequests.length === 0) {
		sentRequestsElement.innerHTML = '<li class="list-group-item d-flex justify-content-between align-items-center bg-dark text-white" data-translate="noSentRequests">No sent friend requests</li>';
		return;
	}
	sentRequestsElement.innerHTML = '';
	player.sentRequests.forEach(request => {
		sentRequestsElement.innerHTML += `
			<li class="list-group-item d-flex justify-content-between align-items-center bg-dark text-white">
				${request.receiver_uid}
			</li>
		`;
	});
}

// Funzione per caricare il form per la modifica del profilo
export function renderProfileForm(player) {
	document.getElementById('userID').value = player.id;
	document.getElementById('emailID').value = player.email;
	document.getElementById('usernameID').value = player.name;
}

// Funzione per caricare le statistiche di gioco
function generateStatsHTML(matches, wins) {
	return `
		<div class="col text-center">
			<div class="text-white" data-translate="games">Games</div>
			<div>${matches}</div>
		</div>
		<div class="col text-center">
			<div class="text-white" data-translate="wins">Wins</div>
			<div>${wins}</div>
		</div>
		<div class="col text-center">
			<div class="text-white" data-translate="winrate">Win rate</div>
			<div>${(matches === 0 ? '0,0' : (wins / matches * 100).toFixed(1))}%</div>
		</div>
	`;
}

export function renderModeStats(player, elementId, game) {
	const statsElement = document.getElementById(elementId);
	statsElement.innerHTML = '';
	statsElement.innerHTML = `
		<div class="row">
			<div class="text-white fw-bold mb-1" data-translate="localGames">Local Games</div>
			${generateStatsHTML(game === 'pong' ? player.localGames : player.localTris, game === 'pong' ? player.localGamesWin : player.localTrisWin)}
		</div>
		<div class="row">
			<div class="text-white fw-bold mb-1" data-translate="botGames">Games against bot</div>
			${generateStatsHTML(game === 'pong' ? player.botGames : player.botTris, game === 'pong' ? player.botGamesWin : player.botTrisWin)}
		</div>
		<div class="row">
			<div class="text-white fw-bold mb-1" data-translate="tournamentGames">Tournament Matches</div>
			${generateStatsHTML(game === 'pong' ? player.tournamentGames : player.tournamentTris, game === 'pong' ? player.tournamentGamesWin : player.tournamentTrisWin)}
		</div>
	`;
}

// Funzione per caricare la lista dei giocatori
export function renderSearchPlayersList(searchPlayersList) {
	const searchPlayersListElement = document.getElementById('searchPlayersList');
	if (searchPlayersList.length === 0) {
		searchPlayersListElement.innerHTML = '<li class="list-group-item d-flex justify-content-between align-items-center bg-dark text-white" data-translate="noPlayers">No players found</li>';
		return;
	}
	searchPlayersListElement.innerHTML = '';
	searchPlayersList.forEach(player => {
		searchPlayersListElement.innerHTML += `
			<li class="list-group-item d-flex justify-content-between align-items-center bg-dark text-white">
				${player.uid}
				<button class="btn btn-success btn-sm view-profile-btn" data-translate="viewProfile" data-uid="${player.uid}">View profile</button>
			</li>
		`;
	});
}