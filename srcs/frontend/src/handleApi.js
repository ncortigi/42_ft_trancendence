import { general } from "./classes.js";
import { setElementById, addInvalidClass, showEmailModal, showPasswordModal, transformLeaderboardData, transformMatchesData } from "./utils.js";
import { getXCrsfToken, isAuthenticated, login, loginGuest, logout, signup, getUserInfo, getLogin, updateUserInfo, updateProfileImage, getFriends, 
	getFriendRequests, postFriendRequest, updateFriendRequestStatus, getLeaderboard, getLeaderboardTris, searchPlayers, getPongPlayerInfo, getTrisPlayerInfo, getPongGames, 
	getTrisGames, postPongGame, postTrisGame, postPongTournamentWinner, postTrisTournamentWinner } from "./api.js";

export async function isAuth() {
	try {
		const response = await isAuthenticated();
		console.log('Authentication status:', response.message);
		if (response.message === 'Authenticated') {
			general.isAuthenticated = true;
			general.player.id = response.data.uid;
		}
	} catch (error) {
		console.log('Authentication status:', error.message);
		general.isAuthenticated = false;
		general.isAuthenticatedOther = false;
		general.player.reset('0000');
		general.other.reset('0001');
		general.tournament.reset();
		general.searchPlayersList = [];
	}
	return general.isAuthenticated;
}

export async function handleLogin(email, password, handleNavigation, page) {
	try {
		const response = await login(email, password);
		general.isAuthenticated = true;
		console.log('Login response:', response.message);
		const loginData = await getLogin();
		console.log('Login data:', loginData.message);
		general.player.id = loginData.data.uid;
		general.player.language = loginData.data.language;
		console.log('User ID:', general.player.id);
		console.log('User language:', general.player.language);
		if (general.player.language !== general.lang)
			general.lang = general.player.language;
		handleNavigation(page);
	} catch (error) {
		if (error.message === 'Invalid email')
			addInvalidClass('emailID');
		else if (error.message === 'Invalid password')
			addInvalidClass('passwordID');
		console.log(`%cLogin failed: ${error.message}`, 'color: red');
	}
}

export async function handleLoginGuest(email, password, handleNavigation, page) {
	try {
		const response = await loginGuest(email, password);
		console.log('Guest login response:', response.message);
		if (page.includes('tournamentRoom')) {
			const id = response.data.uid;
			const name = response.data.username;
			general.tournament.addPlayer(name, id);
			console.log('Guest User ID:', id);
		} else {
			general.isAuthenticatedOther = true;
			general.other.id = response.data.uid;
			general.other.name = response.data.username;
			console.log('Guest User ID:', general.other.id);
		}
		handleNavigation(page);
	} catch (error) {
		if (error.message === 'Invalid email')
			addInvalidClass('emailID');
		else if (error.message === 'Invalid password')
			addInvalidClass('passwordID');
		console.log(`%cFailed to login as guest: ${error.message}`, 'color: red');
	}
}

export async function handleSignup(email, username, password, handleNavigation, page) {
	try {
		const user = await signup(email, username, password);
		console.log('User signed up:', user.message);
		handleNavigation(page);
	} catch (error) {
		if (error.message === 'Email already exists')
			showEmailModal();
		else if (error.message.includes('Password is not valid:'))
			showPasswordModal('passHelp', 'passwordID', error.message);
		console.log(`%cSign up failed: ${error.message}`, 'color: red');
	}
}

export async function handleGetUserInfo(uid, player) {
	try {
		const userInfo = await getUserInfo(uid);
		console.log('User info:', userInfo.message);
		player.email = userInfo.data.email;
		player.name = userInfo.data.username;
		player.language = userInfo.data.language;
		player.description = userInfo.data.description;
		player.image = userInfo.data.image;
	} catch (error) {
		console.log(`%cFailed to get user info: ${error.message}`, 'color: red');
	}
}

export async function handleUpdateUserInfo(userInfo) {
	try {
		const csrfToken = await getXCrsfToken();
		const response = await updateUserInfo(csrfToken, userInfo);
		console.log('User info updated:', response.message);
		if (userInfo.description) 
			general.player.description = userInfo.description;
		if (userInfo.language) 
			general.player.language = userInfo.language;
		if (userInfo.email) 
			general.player.email = userInfo.email;
		if (userInfo.username) 
			general.player.name = userInfo.username;
		return true;
	} catch (error) {
		if (error.message === 'Email already exists') {
			showEmailModal();
		} else if (error.message === 'Invalid current password') {
			setElementById('oldPasswordHelp', 'none');
			addInvalidClass('oldPasswordID');
		} else if (error.message.includes('Password is not valid:')) {
			showPasswordModal('newPasswordHelp', 'newPasswordID', error.message);
		}
		console.log(`%cFailed to update user info: ${error.message}`, 'color: red');
		return false;
	}
}

export async function handleUploadProfileImage(file) {
    try {
		const formData = new FormData();
        formData.append('image', file);
        const csrfToken = await getXCrsfToken();
        const response = await updateProfileImage(csrfToken, formData);
        console.log('Profile image uploaded:', response.message);
        return response.image_url;
    } catch (error) {
        console.log(`%cFailed to update user info: ${error.message}`, 'color: red');
        return null;
    }
}

export async function handleLogout() {
	try {
		const response = await logout();
		console.log('Logout response:', response.message);
		general.isAuthenticated = false;
		general.player.reset('0000');
	} catch (error) {
		console.log(`%cLogout failed: ${error.message}`, 'color: red');
	}
}

export async function handleGetPongPlayerInfo(uid, player) {
	try {
		const response = await getPongPlayerInfo(uid);
		console.log('Pong player info retrieved:', response.message);

		player.games = response.data.TOTP;
		player.wins = response.data.TOTW;
		player.tournamentWon = response.data.TW;
		player.localGames = response.data.PVPP;
		player.localGamesWin = response.data.PVPW;
		player.botGames = response.data.PVEP;
		player.botGamesWin = response.data.PVEW;
		player.tournamentGames = response.data.TMAP;
		player.tournamentGamesWin = response.data.TMAW;
	} catch (error) {
		console.log(`%cFailed to retrieve Pong player info: ${error.message}`, 'color: red');
	}
}

export async function handleGetTrisPlayerInfo(uid, player) {
	try {
		const response = await getTrisPlayerInfo(uid);
		console.log('Tris player info retrieved:', response.message);

		player.gamesTris = response.data.TOTP;
		player.winsTris = response.data.TOTW;
		player.tournamentWonTris = response.data.TW;
		player.localTris = response.data.PVPP;
		player.localTrisWin = response.data.PVPW;
		player.botTris = response.data.PVEP;
		player.botTrisWin = response.data.PVEW;
		player.tournamentTris = response.data.TMAP;
		player.tournamentTrisWin = response.data.TMAW;
	} catch (error) {
		console.log(`%cFailed to retrieve Tris player info: ${error.message}`, 'color: red');
	}
}

export async function handleGetPongGames(player, uid = null) {
	try {
		const response = await getPongGames(uid);
		console.log('Pong games retrieved:', response.message);
	   	player.recentGames = transformMatchesData(response.data, player.id);
		return response.data;
	} catch (error) {
		console.log(`%cFailed to retrieve Pong games: ${error.message}`, 'color: red');
	}
}

export async function handleGetTrisGames(player, uid = null) {
	try {
		const response = await getTrisGames(uid);
		console.log('Tris games retrieved:', response.message);
		player.recentGamesTris = transformMatchesData(response.data, player.id);
	} catch (error) {
		console.log(`%cFailed to retrieve Tris games: ${error.message}`, 'color: red');
	}
}

export async function handleGetLeaderboardPong() {
	try {
		const response = await getLeaderboard();
		console.log('Pong leaderboard retrieved:', response.message);
		general.leaderboardData = transformLeaderboardData(response.data);
	} catch (error) {
		console.log(`%cFailed to retrieve Pong leaderboard: ${error.message}`, 'color: red');
	}
}

export async function handleGetLeaderboardTris() {
	try {
		const response = await getLeaderboardTris();
		console.log('Tris leaderboard retrieved:', response.message);
		general.leaderboardDataTris = transformLeaderboardData(response.data);
	} catch (error) {
		console.log(`%cFailed to retrieve Tris leaderboard: ${error.message}`, 'color: red');
	}
}

export async function handleSearchPlayers(username) {
	try {
		const response = await searchPlayers(username);
		console.log('Search results:', response.message);
		return response.data;
	} catch (error) {
		console.log(`%cFailed to search players: ${error.message}`, 'color: red');
		return [];
	}
}

export async function handleGetFriends() {
	try {
		const response = await getFriends();
		console.log('Friends list retrieved:', response.message);
		general.player.friends = response.data;
		general.player.friend = response.data.length;
	} catch (error) {
		console.log(`%cFailed to retrieve friends list: ${error.message}`, 'color: red');
	}
}

export async function handleGetFriendRequests() {
	try {
		const response = await getFriendRequests();
		console.log('Friend requests retrieved:', response.message);
		general.player.friendRequests = response.data.filter(request => request.receiver_uid === general.player.id);
		general.player.sentRequests = response.data.filter(request => request.sender_uid === general.player.id);
	} catch (error) {
		console.log(`%cFailed to retrieve friend requests: ${error.message}`, 'color: red');
	}
}

export async function handleSendFriendRequest(emitterUid, receiverUid, self = true) {
	try {
		const csrfToken = await getXCrsfToken();
		if (self)
			emitterUid = general.player.id;
		const response = await postFriendRequest(emitterUid, receiverUid, csrfToken);
		console.log('Friend request sent:', response.message);
	} catch (error) {
		console.log(`%cFailed to send friend request: ${error.message}`, 'color: red');
	}
}

export async function handleUpdateFriendRequest(emitterUid, status) {
	try {
		const csrfToken = await getXCrsfToken();
		const response = await updateFriendRequestStatus(emitterUid, status, csrfToken);
		console.log('Friend request status updated:', response.message);
		return true;
	} catch (error) {
		console.log(`%cFailed to update friend request status: ${error.message}`, 'color: red');
		return false;
	}
}

export async function handlePostPongGame(player1Uid, player2Uid, mode, p1Score, p2Score) {
	try {
		const csrfToken = await getXCrsfToken();
		const response = await postPongGame(player1Uid, player2Uid, mode, p1Score, p2Score, csrfToken);
		console.log('Pong game saved successfully:', response.message);
	} catch (error) {
		console.log(`%cFailed to save Pong game: ${error.message}`, 'color: red');
	}
}

export async function handlePostTrisGame(player1Uid, player2Uid, mode, p1Score, p2Score) {
	try {
		const csrfToken = await getXCrsfToken();
		const response = await postTrisGame(player1Uid, player2Uid, mode, p1Score, p2Score, csrfToken);
		console.log('Tris game posted successfully:', response.message);
	} catch (error) {
		console.log(`%cFailed to save Tris game: ${error.message}`, 'color: red');
	}
}

export async function handlePostPongTournamentWinner(uid) {
	try {
		const csrfToken = await getXCrsfToken();
		const response = await postPongTournamentWinner(uid, csrfToken);
		console.log('Pong tournament winner recorded successfully:', response.message);
	} catch (error) {
		console.log(`%cFailed to record Pong tournament winner: ${error.message}`, 'color: red');
	}
}

export async function handlePostTrisTournamentWinner(uid) {
	try {
		const csrfToken = await getXCrsfToken();
		const response = await postTrisTournamentWinner(uid, csrfToken);
		console.log('Tris tournament winner recorded successfully:', response.message);
	} catch (error) {
		console.log(`%cFailed to record Tris tournament winner: ${error.message}`, 'color: red');
	}
}