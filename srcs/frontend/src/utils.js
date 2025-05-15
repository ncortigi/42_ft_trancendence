import { getTranslation } from './translate.js';
import { general } from './classes.js';

export function setElementById(id, status) {
	document.getElementById(id).style.display = status;
}

export	function addInvalidClass(element) {
	document.getElementById(element).classList.add('is-invalid');
}

export function removeInvalidClass(element) {
	document.getElementById(element).classList.remove('is-invalid');
}

export function showEmailModal() {
	const modal = new bootstrap.Modal(document.getElementById('emailModal'));
	modal.show();
	setElementById('emailHelp', 'none');
	addInvalidClass('emailID');
}

export function showPasswordModal(help, id, message) {
	const modal = new bootstrap.Modal(document.getElementById('passModal'));
	modal.show();
	const messageElement = document.getElementById('passErrorMessage');
	message = message.split('\'')[1].split('.')[0];
	if (message === 'The password is too similar to the username')
		messageElement.textContent = getTranslation('passUser', general.lang);
	else if (message === 'The password is too similar to the email')
		messageElement.textContent = getTranslation('passEmail', general.lang);
	else if (message === 'This password is too common')
		messageElement.textContent = getTranslation('passCommon', general.lang);
	else
		messageElement.textContent = message;
	setElementById(help, 'none');
	addInvalidClass(id);
}

export function setSearchingPlayers(validated, page) {
	if (validated && page === 'home') {
		document.getElementById('navbarSearch').innerHTML = `
			<input id="searchPlayers" class="form-control me-2" type="search" placeholder="Search players" aria-label="Search">
			<button id="search-players-btn" class="btn btn-light" type="submit" data-translate="search">Search</button>
		`;
	}
	else {
		document.getElementById('navbarSearch').innerHTML = '';
	}
}

export function showDefaultFooter() {
	setElementById('containerAll','block');
	setElementById('default-footer','block');
	setElementById('playing-footer','none');
	document.getElementById('playing-footer').innerHTML = '';
	setElementById('quit-footer','none');
	document.getElementById('quit-footer').innerHTML = '';
}

export function showPlayingFooter(page) {
	setElementById('containerAll','none');
	setElementById('default-footer','none');
	setElementById('gameCanvas','block');
	setElementById('playing-footer','block');
	const footerElement = document.getElementById('playing-footer');
	footerElement.innerHTML = '';
	footerElement.innerHTML = `
		<div class="container-fluid">
			<div class="row justify-content-center mt-2">
				<div class="col-3 d-flex justify-content-center mb-2">
					<button id="play2-btn" type="button" class="btn btn-primary mx-1 flex-fill" data-translate="play">Play</button>
					<button id="pause-btn" type="button" class="btn btn-info mx-1 flex-fill" style="display: none" data-translate="pause">Pause</button>
					<button id="resume-btn" type="button" class="btn btn-info mx-1 flex-fill" style="display: none" data-translate="resume">Resume</button>
					${(page === 'pong' || page === 'tris') ? '<button id="restart-btn" type="button" class="btn btn-secondary mx-1 flex-fill" data-translate="restart">Restart</button>' : ''}
					${(page === 'pongTournament' || page === 'trisTournament' ) ? '<button id="sendFriend-btn" type="button" class="btn btn-success mx-1 flex-fill" data-translate="sendFriend">Send Friend Request</button>' : ''}
					<button id="quit-btn" type="button" class="btn btn-danger mx-1 flex-fill" data-translate="quit">Quit</button>
				</div>
			</div>
		</div>
	`;
	const footerQuit = document.getElementById('quit-footer');
	footerQuit.innerHTML = '';
	footerQuit.innerHTML = `
		<div class="container-fluid">
			<div class="row justify-content-center mt-2">
				<div class="col-3 d-flex justify-content-center mb-2">
					<button id="quitMessage" type="button" class="btn btn-dark" disabled data-translate="quitMessage">Are you sure you want to quit?</button>
					<button id="quitYes-btn" type="button" class="btn btn-danger mx-1 flex-fill" data-translate="quit">Quit</button>
					<button id="quitNo-btn" type="button" class="btn btn-secondary mx-1 flex-fill" data-translate="back">Back</button>
				</div>
			</div>
		</div>
	`;
}

export function setFooterButtons(button) {
	setElementById('play2-btn', button === 'play' ? 'block' : 'none');
	setElementById('pause-btn', button === 'pause' ? 'block' : 'none');
	setElementById('resume-btn', button === 'resume' ? 'block' : 'none');
}

export function addEventListenersModals() {
	document.getElementById('staticBackdrop').addEventListener('shown.bs.modal', function () {
		this.removeAttribute('inert');
		const focusableElement = this.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
		if (focusableElement) {
			focusableElement.focus(); // Sposta il focus su un elemento all'interno del modal
		}
	});
	
	document.getElementById('staticBackdrop').addEventListener('hidden.bs.modal', function () {
		this.setAttribute('inert', ''); // Ripristina aria-hidden quando il modal è nascosto
	});

	document.getElementById('emailModal').addEventListener('shown.bs.modal', function () {
		this.removeAttribute('inert');
		const focusableElement = this.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
		if (focusableElement) {
			focusableElement.focus(); // Sposta il focus su un elemento all'interno del modal
		}
	});
	
	document.getElementById('emailModal').addEventListener('hidden.bs.modal', function () {
		this.setAttribute('inert', ''); // Ripristina aria-hidden quando il modal è nascosto
	});

	document.getElementById('passModal').addEventListener('shown.bs.modal', function () {
		this.removeAttribute('inert');
		const focusableElement = this.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
		if (focusableElement) {
			focusableElement.focus(); // Sposta il focus su un elemento all'interno del modal
		}
	});
	
	document.getElementById('passModal').addEventListener('hidden.bs.modal', function () {
		this.setAttribute('inert', ''); // Ripristina aria-hidden quando il modal è nascosto
	});
}

export function transformLeaderboardData(data) {
    return data.map((player, index) => {
		const playerUid = player.player_uid;
        const wins = player.TOTW;
        const losses = player.TOTP - player.TOTW;
        const winrate = player.TOTP === 0 ? '0.0%' : ((wins / player.TOTP) * 100).toFixed(1) + '%';

        return {
            position: index + 1,
            name: playerUid,
            wins: wins,
            losses: losses,
            winrate: winrate
        };
    });
}

export function transformMatchesData(data, uid) {
    return data.map(match => {
        const uidWinner = match.winner === 'player1' ? match.player1_uid : match.player2_uid;
        const result = uid === uidWinner ? 'Win' : 'Loss';
		const date = ((match.date.split('T')[0]).split('-')).reverse().join('/');

        return {
            player1: match.player1_uid,
            player2: match.player2_uid ? match.player2_uid : match.bot_name,
            score1: match.player1_result,
            score2: match.player2_result,
            result: result,
            mode: match.mode,
            date: date
        };
    });
}

const gameMap = {
	pong: 'pongGame',
	pongAi: 'pongGameAi',
	pongTournament: 'pongGame',
	tris: 'trisGame',
	trisAi: 'trisGameAi',
	trisTournament: 'trisGame'
};

export function startPongScript(page) {
	const game = window[gameMap[page]];
	if (game)
		game.play();
}

export function pausePongScript(page) {
	const game = window[gameMap[page]];
	if (game)
		game.pause();
}

export function resetPongScript(page) {
	const game = window[gameMap[page]];
	if (game)
		game.reset();
}