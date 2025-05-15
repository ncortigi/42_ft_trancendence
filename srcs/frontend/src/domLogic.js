import { setElementById, setSearchingPlayers, showDefaultFooter, showPlayingFooter, setFooterButtons, startPongScript, pausePongScript, resetPongScript, addEventListenersModals } from './utils.js'
import { loadCanvas, loadHome, loadLogin, loadGame, loadModes, loadGameMode, loadTournamentForm, loadTournamentRoom, loadLeaderboard, loadLoginForm, 
	loadSignupForm, loadProfile, loadEditProfileForm, loadProfileOther, loadStats, loadSearchPlayers, loadTournamentOngoing } from './loadSections.js';
import { tournamentFormListener, loginFormListener, signupFormListener, profileFormListener } from './loginLogic.js';
import { renderTournamentRoom, renderTournament, renderLeaderboard, renderFriendsList, renderFriendRequests, renderSentRequests, renderPlayerInfo, 
	renderStats, renderMatchesList, renderModeStats, renderProfileForm, renderSearchPlayersList } from './loadElements.js';
import { updateLanguage } from './translate.js';
import { general } from './classes.js';
import { isAuth, handleGetUserInfo, handleUpdateUserInfo, handleUploadProfileImage, handleLogout, handleGetLeaderboardPong, handleGetLeaderboardTris, handleSearchPlayers, 
	handleGetFriends, handleGetFriendRequests, handleSendFriendRequest, handleUpdateFriendRequest, handleGetPongGames, handleGetTrisGames, handleGetPongPlayerInfo, 
	handleGetTrisPlayerInfo } from './handleApi.js';
import { runTournament } from './tournament.js';

document.addEventListener('DOMContentLoaded', async function() {
	const initialPage = window.location.hash.replace('#', '') || 'home';
	if (!window.location.hash) {
		history.replaceState({ pageId: initialPage }, '', `#${initialPage}`);
	}

	const pages = document.querySelectorAll('.page');
	const validPages = Array.from(pages).map(page => page.id);
	const gamePages = Array.from(document.querySelectorAll('.game-page')).map(page => page.id);
	const safeAccessPages = Array.from(document.querySelectorAll('.safe-page')).map(page => page.id);
	const gameLoginPages = Array.from(document.querySelectorAll('.loginGame-page')).map(page => page.id);
	const tournamentPages = Array.from(document.querySelectorAll('.tournament-page')).map(page => page.id);
	const tournamentLoginPages = Array.from(document.querySelectorAll('.loginTournament-page')).map(page => page.id);
	const tournamentOngoingPages = Array.from(document.querySelectorAll('.ongoingTournament-page')).map(page => page.id); 

	const awaitPageActions = {
		leaderboard: async () => {
			await Promise.all([
				handleGetLeaderboardPong(),
				handleGetLeaderboardTris()
			]);
		},
		profile: async () => {
			await Promise.all([
				handleGetUserInfo(general.player.id, general.player),
				handleGetPongPlayerInfo(general.player.id, general.player),
				handleGetTrisPlayerInfo(general.player.id, general.player),
				handleGetPongGames(general.player),
				handleGetTrisGames(general.player),
				handleGetFriends(),
				handleGetFriendRequests()
			]);
		},
		profileForm: async () => {
			await handleGetUserInfo(general.player.id, general.player);
		},
		stats: async () => {
			await Promise.all([
				handleGetUserInfo(general.player.id, general.player),
				handleGetPongPlayerInfo(general.player.id, general.player),
				handleGetTrisPlayerInfo(general.player.id, general.player),
				handleGetPongGames(general.player),
				handleGetTrisGames(general.player)
			]);
		},
		profileOther: async () => {
			await Promise.all([
				handleGetUserInfo(general.other.id, general.other),
				handleGetPongPlayerInfo(general.other.id, general.other),
				handleGetTrisPlayerInfo(general.other.id, general.other),
				handleGetPongGames(general.other, general.other.id),
				handleGetTrisGames(general.other, general.other.id)
			]);
		},
	}

	const pageActions = {
		pong: () => setupGamePage('pong'),
		pongAi: () => setupGamePage('pongAi'),
		pongTournament: () => setupGamePage('pongTournament'),
		tris: () => setupGamePage('tris'),
		trisAi: () => setupGamePage('trisAi'),
		trisTournament: () => setupGamePage('trisTournament'),
		home: () => {
			loadHome(general.isAuthenticated);
			addEventListenersHome();
		},
		login: () => {
			loadLogin();
			addEventListenersLogin();
		},
		game: () => {
			loadGame();
			addEventListenersGame();
		},
		pongMode: () => setupModePage('pongMode', 'pong'),
		pongLocal: () => setupLocalPage('pongLocal', 'pong'),
		pongLogin: () => setupLoginButtonsPage('pongLogin', addEventListenersGameLogin, 'Pong'),
		trisMode: () => setupModePage('trisMode', 'tris'),
		trisLocal: () => setupLocalPage('trisLocal', 'tris'),
		trisLogin: () => setupLoginButtonsPage('trisLogin', addEventListenersGameLogin, 'Tris'),
		tournamentFormPong: () => setupTournamentFormPage('tournamentFormPong', 'Pong', 'tournamentRoomPong', 'pongMode'),
		tournamentRoomPong: () => setupTournamentRoomPage('tournamentRoomPong', addEventListenersTournamentRoomGame, 'Pong'),	
		tournamentLoginPong: () => setupLoginButtonsPage('tournamentLoginPong', addEventListenersTournamentLogin, 'Pong'),
		tournamentPong: () => setupTournamentOngoingPage('tournamentPong', 'pong'),
		tournamentFormTris: () => setupTournamentFormPage('tournamentFormTris', 'Tris', 'tournamentRoomTris', 'trisMode'),
		tournamentRoomTris: () => setupTournamentRoomPage('tournamentRoomTris', addEventListenersTournamentRoomGame, 'Tris'),
		tournamentLoginTris: () => setupLoginButtonsPage('tournamentLoginTris', addEventListenersTournamentLogin, 'Tris'),
		tournamentTris: () => setupTournamentOngoingPage('tournamentTris', 'tris'),
		loginform: () => setupLoginPage('loginform', false, 'home', 'login'),
		signup: () => setupSignupPage('signup', 'loginform', 'login'),
		loginPong: () => setupLoginPage('loginPong', true, 'pong', 'pongLogin'),
		signupPong: () => setupSignupPage('signupPong', 'loginPong', 'pongLogin'),
		loginPongTournament: () => setupLoginPage('loginPongTournament', true, 'tournamentRoomPong', 'tournamentLoginPong'),
		signupPongTournament: () => setupSignupPage('signupPongTournament', 'loginPongTournament', 'tournamentLoginPong'),
		loginTris: () => setupLoginPage('loginTris', true, 'tris', 'trisLogin'),
		signupTris: () => setupSignupPage('signupTris', 'loginTris', 'trisLogin'),
		loginTrisTournament: () => setupLoginPage('loginTrisTournament', true, 'tournamentRoomTris', 'tournamentLoginTris'),
		signupTrisTournament: () => setupSignupPage('signupTrisTournament', 'loginTrisTournament', 'tournamentLoginTris'),
		leaderboard: () => {
			loadLeaderboard();
			addEventListenersBack();
			addEventListenersDropdown();
			renderLeaderboard(general.leaderboardData);
		},
		profile: () => {
			loadProfile();
			addEventListenersProfile();
			addEventListenersDropdown();
			renderPlayerInfo(general.player, 'playerNameProfile', 'profileImage', 'profileDescription');
			renderStats(general.player, 'profileStats', 'pong');
			renderMatchesList(general.player, 'recentGamesList', 'pong');
			renderFriendsList(general.player);
			renderFriendRequests(general.player);
			renderSentRequests(general.player);
		},
		profileForm: () => {
			loadEditProfileForm();
			profileFormListener(handleNavigation);
			addEventListenersBack('profile');
			renderProfileForm(general.player);
		},
		stats: () => {
			loadStats();
			addEventListenersBack(general.current);
			addEventListenersDropdown();
			renderPlayerInfo(general.player, 'playerNameStats', 'profileImageStats', '');
			renderStats(general.player, 'profileStats2', 'pong');
			renderMatchesList(general.player, 'recentGamesList2', 'pong');
			renderModeStats(general.player, 'modeStats', 'pong');
		},
		profileOther: () => {
			loadProfileOther();
			addEventListenerProfileOther();
			addEventListenersDropdown();
			renderPlayerInfo(general.other, 'playerNameOther', 'profileImageOther', 'profileDescriptionOther');
			renderStats(general.other, 'profileStatsOther', 'pong');
			renderMatchesList(general.other, 'recentGamesListOther', 'pong');
			renderModeStats(general.other, 'modeStatsOther', 'pong');
		},
		search: () => {
			loadSearchPlayers();
			addEventListenersSearch();
			renderSearchPlayersList(general.searchPlayersList);
		}
	};

	async function handleNavigation(pageId, pushState = true) {
		if (!validPages.includes(pageId)) {
			console.log(`%cInvalid pageId: ${pageId}`, 'color: red');
			return;
		}

		if (general.isAuthenticated) {
			await isAuth();
		} else {
			general.isAuthenticated = false;
			general.isAuthenticatedOther = false;
			general.player.reset('0000');
			general.other.reset('0001');
			general.tournament.reset();
			general.searchPlayersList = [];
		}

		if (!safeAccessPages.includes(pageId) && !general.isAuthenticated) {
			pageId = 'home';
			console.log('%cUser is not authenticated', 'color: red');
		}
		if (['login', 'loginform', 'signup'].includes(pageId) && general.isAuthenticated) {
			pageId = 'home';
			console.log('%cUser is already authenticated', 'color: red');
		}
		if (gameLoginPages.includes(pageId) && gamePages.includes(general.current)) {
			pageId = pageId.includes('Pong', 'pong') ? 'pongMode' : 'trisMode';
			console.log('%cGame already started', 'color: red');
		}
		if (tournamentPages.includes(pageId) && !general.tournament.name) {
			pageId = pageId.includes('Pong', 'pong') ? 'tournamentFormPong' : 'tournamentFormTris';
			console.log('%cTournament not created', 'color: red');
		}
		if (tournamentLoginPages.includes(pageId) && tournamentOngoingPages.includes(general.current)) {
			pageId = pageId.includes('Pong', 'pong') ? 'tournamentPong' : 'tournamentTris';
			console.log('%cTournament already started', 'color: red');
		}
		if (['loginPongTournament', 'signupPongTournament', 'loginTrisTournament', 'signupTrisTournament'].includes(pageId)
			&& ['tournamentRoomPong', 'tournamentRoomTris'].includes(general.current)) { 
			pageId = pageId.includes('Pong', 'pong') ? 'tournamentRoomPong' : 'tournamentRoomTris';
			console.log('%cTournament player already registered', 'color: red');
		}

		if (pushState) 
			history.pushState({ pageId }, '', `#${pageId}`);
		else
			history.replaceState({ pageId }, '', `#${pageId}`);

		setSearchingPlayers(general.isAuthenticated, pageId);
		if (!gamePages.includes(pageId) && gamePages.includes(general.current)) {
			showDefaultFooter();
			resetPongScript(general.current);
			general.game.reset();
		}
		if (!['pong', 'tris', 'profileOther'].includes(pageId) && ['pong', 'tris', 'profileOther'].includes(general.current) 
			&& general.isAuthenticatedOther) {
			general.isAuthenticatedOther = false;
			general.other.reset('0001');
		}
		if (['home', 'tournamentFormPong', 'tournamentFormTris'].includes(pageId) && tournamentPages.includes(general.current)) {
			general.tournament.reset();
		}

		const awaitAction = awaitPageActions[pageId];
		if (awaitAction)
			await awaitAction();
		pages.forEach(page => {
			page.style.display = page.id === pageId ? 'block' : 'none';
			if (page.id !== pageId) 
				page.innerHTML = '';
		});
		const action = pageActions[pageId];
		if (action)
			action();
		updateLanguage(general.lang);
		general.current = pageId;
	}

	window.addEventListener('popstate', (event) => {
		if (event.state && event.state.pageId)
			handleNavigation(event.state.pageId, false);
	});

	window.addEventListener('beforeunload', async function() {
		if (general.isAuthenticated) {
			await handleLogout();
		}
	});

	addEventListenersHome();
	addEventListenersModals();

	//utils functions
	function addEventListener(elementId, page) {
		document.getElementById(elementId)?.addEventListener('click', function(event) {
			event.preventDefault();
			handleNavigation(page);
		});
	}

	function addEventListenersBack(page = 'home') {
		addEventListener('back-btn', page);
	}

	function setupGamePage(pageId) {
		if ((pageId === 'pongTournament' || pageId === 'trisTournament') && 
			general.tournament.games.length <= general.tournament.roundGames) {
				const newPage = pageId === 'pongTournament' ? 'tournamentPong' : 'tournamentTris';
				handleNavigation(newPage);
				return;
		}
		loadCanvas(pageId);
		showPlayingFooter(pageId);
		general.game.start(pageId);
		addEventListenersFooter();
	}

	function setupModePage(pageId, game) {
		loadModes(pageId, general.isAuthenticated);
		addEventListenersGameMode(game);
	}

	function setupLocalPage(pageId, game) {
		loadGameMode(pageId);
		addEventListenersGameLocal(game);
	}

	function setupLoginButtonsPage(pageId, listenerFunction, game) {
		loadLogin(pageId);
		listenerFunction(game);
	}
	
	function setupTournamentFormPage(form, game, room, back) {
		loadTournamentForm(form);
		tournamentFormListener(handleNavigation, game, room);
		addEventListenersBack(back);
	}

	function setupTournamentRoomPage(page, functionListener, game) {
		loadTournamentRoom(page, general.tournament.isFull());
		functionListener(game);
		renderTournamentRoom(general.tournament);
	}

	function setupTournamentOngoingPage(page, game) {
		loadTournamentOngoing(page, general.tournament.roundRunning, general.tournamentRunning);
		addEventListenersTournamentOngoing(game);
		renderTournament(general.tournament, general.tournamentRunning);
	}

	function setupLoginPage(page, other, submit, back) {
		loadLoginForm(page);
		loginFormListener(handleNavigation, other, submit);
		addEventListenersBack(back);
	}

	function setupSignupPage(page, submit, back) {
		loadSignupForm(page);
		signupFormListener(handleNavigation, submit);
		addEventListenersBack(back);
	}

	//navbar buttons
	addEventListener('pong2-btn', 'home');
	addEventListener('home-btn', 'home');

	// Lingua
	document.querySelectorAll('.dropdown-item.dropdown-lang').forEach(item => {
		item.addEventListener('click', async (event) => {
			general.lang = event.target.getAttribute('data-lang');
			updateLanguage(general.lang);
			if (general.isAuthenticated) {
				await handleUpdateUserInfo( { language: general.lang } );
			}
		});
	});

	// Ricerca giocatori
	document.getElementById('navbarSearch').addEventListener('submit', async function(event) {
		event.preventDefault();
		const searchInput = document.getElementById('searchPlayers').value;
		if (!searchInput)
			return;
		general.searchPlayersList = await handleSearchPlayers(searchInput);
		handleNavigation('search');
	});

	//search buttons
	function addEventListenersSearch() {
		const container = document.getElementById('searchPlayersList');
		container.addEventListener('click', (event) => {
			if (event.target.classList.contains('view-profile-btn')) {
				const uid = event.target.getAttribute('data-uid');
				viewProfileOtherPlayer(uid);
			}
		});

		function viewProfileOtherPlayer(name) {
			general.other.id = name;
			handleNavigation('profileOther');
		}

		addEventListenersBack();
	}

	//home buttons
	function addEventListenersHome() {
		addEventListener('play-btn', 'game');
		addEventListener('leaderboard-btn', 'leaderboard');
		addEventListener('profile-btn', 'profile');
		addEventListener('stats-btn', 'stats');
		addEventListener('login-btn', 'login');

		document.getElementById('logout-btn')?.addEventListener('click', async function(event) {
			event.preventDefault();
			await handleLogout();
			handleNavigation('home');
		});
	}

	//login buttons
	function addEventListenersLogin() {
		addEventListener('login-btn', 'loginform');
		addEventListener('signup-btn', 'signup');
		addEventListenersBack();
	}

	//game buttons
	function addEventListenersGame() {
		addEventListener('play-pong-btn', 'pongMode');
		addEventListener('play-tris-btn', 'trisMode');
		addEventListenersBack();
	}

	//pongMode/trisMode buttons
	function addEventListenersGameMode(game) {
		document.getElementById('local-match-btn').addEventListener('click', async function(event) {
			event.preventDefault();
			if (await isAuth()) {
				handleNavigation(game + 'Local');
			} else {
				handleNavigation(game);
			}
		});

		document.getElementById('online-match-btn')?.addEventListener('click', function(event) {
			event.preventDefault();
		});

		addEventListener('bot-match-btn', game + 'Ai');
		addEventListener('tournament-btn', game === 'pong' ? 'tournamentFormPong' : 'tournamentFormTris');
		addEventListenersBack('game');
	}

	//pongLocal/trisLocal buttons
	function addEventListenersGameLocal(game) {
		addEventListener('local-match-btn', game);
		addEventListener('login-btn', game + 'Login');
		addEventListenersBack(game + 'Mode');
	}

	//pongLogin/trisLogin buttons
	function addEventListenersGameLogin(game) {
		addEventListener('login-btn', 'login' + game);
		addEventListener('signup-btn', 'signup' + game);
		addEventListenersBack(game.toLowerCase() + 'Local');
	}

	//tournamentRoomPong/tournamentRoomTris buttons
	function addEventListenersTournamentRoomGame(game) {
		const container = document.getElementById('tournamentRoomList');
		container.addEventListener('click', (event) => {
			if (event.target.classList.contains('join-tournament-btn')) {
				joinTournament();
			} else if (event.target.classList.contains('kick-player-btn')) {
				const id = event.target.getAttribute('data-uid');
				kickPlayer(id);
			}
		});

		function joinTournament() {
			handleNavigation('tournamentLogin' + game);
		}

		function kickPlayer(id) {
			general.tournament.removePlayer(id);
			console.log('Kicked:', id);
			renderTournamentRoom(general.tournament);
			updateLanguage(general.lang);
		}

		document.getElementById('tournamentStart')?.addEventListener('click', function(event) {
			event.preventDefault();
			general.tournament.start();
			handleNavigation('tournament' + game);
		});
		addEventListenersBack('tournamentFormPong');
	}

	//tournamentLoginPong/tournamentLoginTris buttons
	function addEventListenersTournamentLogin(game) {
		addEventListener('login-btn', 'login' + game + 'Tournament');
		addEventListener('signup-btn', 'signup' + game + 'Tournament');
		addEventListenersBack('tournamentRoom' + game);
	}

	//tournamentPong/tournamentTris buttons
	function addEventListenersTournamentOngoing(game) {
		addEventListener('matchStart', game + 'Tournament');
		document.getElementById('roundStart')?.addEventListener('click', async function(event) {
			event.preventDefault();
			general.tournament.round++;
			await runTournament();
			handleNavigation(game === 'pong' ? 'tournamentPong' : 'tournamentTris');
		});
		addEventListenersBack(game === 'pong' ? 'tournamentFormPong' : 'tournamentFormTris');
	}

	//profile buttons
	function addEventListenersProfile() {
		// Gestione del caricamento dell'immagine del profilo
		document.getElementById('uploadImageBtn').addEventListener('click', function() {
			document.getElementById('uploadImage').click();
		});

		document.getElementById('uploadImage').addEventListener('change', async function(event) {
			const file = event.target.files[0];
			if (file) {
				const imageUrl = await handleUploadProfileImage(file);
				if (imageUrl)
					document.getElementById('profileImage').src = imageUrl;
			}
		});

		// Gestione della modifica della descrizione del profilo
		document.getElementById('editDescriptionBtn').addEventListener('click', function() {
			const descriptionField = document.getElementById('profileDescription');
			descriptionField.removeAttribute('readonly');
			setElementById('editDescriptionBtn', 'none');
			setElementById('saveDescriptionBtn', 'inline-block');
		});

		document.getElementById('saveDescriptionBtn').addEventListener('click', async function() {
			const descriptionField = document.getElementById('profileDescription');
			if (await handleUpdateUserInfo({ description: descriptionField.value })) {
				descriptionField.setAttribute('readonly', true);
				setElementById('editDescriptionBtn', 'inline-block');
				setElementById('saveDescriptionBtn', 'none');
			}
		});

		addEventListener('viewStatsBtn', 'stats');
		addEventListener('editProfileBtn', 'profileForm');

		const container = document.getElementById('friendRequestsList');
		container.addEventListener('click', (event) => {
			if (event.target.classList.contains('accept-request-btn')) {
				const id = event.target.getAttribute('data-uid');
				acceptRequest(id);
			} else if (event.target.classList.contains('reject-request-btn')) {
				const id = event.target.getAttribute('data-uid');
				rejectRequest(id);
			}
		});

		async function acceptRequest(sender) {
			if (!await handleUpdateFriendRequest(sender, 'accepted'))
				return;
			general.player.friendRequests = general.player.friendRequests.filter(request => request.sender_uid !== sender);
			renderFriendRequests(general.player);
			await handleGetFriends();
			renderFriendsList(general.player);
			updateLanguage(general.lang);
		}
			
		async function rejectRequest(sender) {
			if (!await handleUpdateFriendRequest(sender, 'rejected'))
				return;
			general.player.friendRequests = general.player.friendRequests.filter(request => request.sender_uid !== sender);
			renderFriendRequests(general.player);
			updateLanguage(general.lang);
		}

		addEventListenersBack();
	}

	function addEventListenersDropdown() {
		document.querySelectorAll('.dropdown-item.dropdown-stats').forEach(item => {
			item.addEventListener('click', function(event) {
				event.preventDefault();
				const selectedGame = event.target.getAttribute('data-value');
				const dropdownId = event.target.closest('.dropdown').querySelector('.dropdown-toggle').id;
				document.getElementById(dropdownId).textContent = event.target.textContent;
				switch (dropdownId) {
					case 'leaderboardTypeDropdown':
						renderLeaderboard(selectedGame === 'pong' ? general.leaderboardData : general.leaderboardDataTris);
						break;
					case 'playerTypeDropdown':
						renderStats(general.player, 'profileStats', selectedGame);
						break;
					case 'playerTypeDropdownOther':
						renderStats(general.other, 'profileStatsOther', selectedGame);
						break;
					case 'playerTypeDropdownStats':
						renderStats(general.player, 'profileStats2', selectedGame);
						break;
					case 'gameTypeDropdown':
						renderMatchesList(general.player, 'recentGamesList', selectedGame);
						break;
					case 'gameTypeDropdownOther':
						renderMatchesList(general.other, 'recentGamesListOther', selectedGame);
						break;
					case 'gameTypeDropdownStats':
						renderMatchesList(general.player, 'recentGamesList2', selectedGame);
						break;
					case 'modeTypeDropdown':
						renderModeStats(general.player, 'modeStats', selectedGame);
						break;
					case 'modeTypeDropdownOther':
						renderModeStats(general.other, 'modeStatsOther', selectedGame);
						break;
				}
				updateLanguage(general.lang);
			});
		});
	}

	//profileOther buttons
	function addEventListenerProfileOther() {
		document.getElementById('sendFriendProfile').addEventListener('click', async function(event) {
			event.preventDefault();
			await handleSendFriendRequest(general.player.id, general.other.id);
		});
		addEventListenersBack('search');
	}

	//footer buttons
	function addEventListenersFooter() {
		document.getElementById('play2-btn').addEventListener('click', function(event) {
			event.preventDefault();
			startPongScript(general.current);
			setFooterButtons('pause');
		});

		document.getElementById('pause-btn').addEventListener('click', function(event) {
			event.preventDefault();
			pausePongScript(general.current);
			setFooterButtons('resume');
		});

		document.getElementById('resume-btn').addEventListener('click', function(event) {
			event.preventDefault();
			startPongScript(general.current);
			setFooterButtons('pause');
		});

		document.getElementById('restart-btn')?.addEventListener('click', function(event) {
			event.preventDefault();
			general.game.softReset();
			resetPongScript(general.current);
			setFooterButtons('play');
		});

		document.getElementById('sendFriend-btn')?.addEventListener('click', async function(event) {
			event.preventDefault();
			await handleSendFriendRequest(general.game.player1Id, general.game.player2Id, false);
		});

		document.getElementById('quit-btn').addEventListener('click', function(event) {
			event.preventDefault();
			setElementById('playing-footer','none');
			setElementById('quit-footer','block');
		});

		document.getElementById('quitYes-btn').addEventListener('click', function(event) {
			event.preventDefault();
			general.game.reset();
			switch (general.current) {
				case 'pong':
				case 'pongAi':
					handleNavigation('pongMode');
					break;
				case 'pongTournament':
					handleNavigation('tournamentPong');
					break;
				case 'tris':
				case 'trisAi':
					handleNavigation('trisMode');
					break;
				case 'trisTournament':
					handleNavigation('tournamentTris');
					break;
				default:
					handleNavigation('game');
					break;
			}
		});

		document.getElementById('quitNo-btn').addEventListener('click', function(event) {
			event.preventDefault();
			setElementById('playing-footer','block');
			setElementById('quit-footer','none');
		});
	}
});