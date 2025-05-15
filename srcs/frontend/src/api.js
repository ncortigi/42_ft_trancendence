// Use the container name 'backend' as the hostname
const API_BASE_URL = '/auth/';

async function fetchJson(url, options = {}) {
	const response = await fetch(url, {
		...options,
		credentials: 'include', // Invia i cookie di sessione
	});
	if (!response.ok) {
		const errorData = await response.json();
		if (errorData.status === 500) {
			console.error('Server error:', response.status);
		} else {
			console.warn('HTTPS error:', response.status);
		}
		const errorMessage = errorData.message || 'An unknown error occurred';
		throw new Error(errorMessage);
	}
	return response.json();
}

export async function getXCrsfToken() {
	try {
		const response = await fetchJson(`${API_BASE_URL}csrf-token/`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include'
		});
		if (response.data)
			localStorage.setItem('xcrsfToken', response.data);
		return response.data;
	} catch (error) {
		console.log('Failed to fetch CSRF token:', error);
	}
}

export async function isAuthenticated() {
	const csrfToken = localStorage.getItem('xcrsfToken');
	if (!csrfToken)
		await getXCrsfToken(); // Recupera il token CSRF se non è presente
	const response = await fetchJson(`${API_BASE_URL}is-authenticated/`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'X-Csrftoken': localStorage.getItem('xcrsfToken')
		},
		credentials: 'include'
	});
	return response;
}

export async function login(email, password) {
	const csrfToken = localStorage.getItem('xcrsfToken');
	if (!csrfToken) 
		await getXCrsfToken();
	const response = await fetchJson(`${API_BASE_URL}login/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Csrftoken': csrfToken,
		},
		body: JSON.stringify({ email, password }),
		credentials: 'include',
	});
	await getXCrsfToken();
	return response;
}

export async function signup(email, username, password) {
	const csrfToken = localStorage.getItem('xcrsfToken');
	if (!csrfToken) 
		await getXCrsfToken();
	const response = await fetchJson(`${API_BASE_URL}signup/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Csrftoken': csrfToken,
		},
		body: JSON.stringify({ email, username, password }),
		credentials: 'include',
	});
	return response;
}

export async function logout() {
	const csrfToken = localStorage.getItem('xcrsfToken');
	if (!csrfToken) 
		await getXCrsfToken();
	const response = await fetchJson(`${API_BASE_URL}logout/`, {
		method: 'POST',
		headers: { 
			'X-Csrftoken': csrfToken,
			'Content-Type': 'application/json' 
		},
		credentials: 'include'
	});
	return response;
}

export async function loginGuest(email, password) {
	const csrfToken = localStorage.getItem('xcrsfToken');
	if (!csrfToken)
		await getXCrsfToken();
	const response = await fetchJson(`${API_BASE_URL}login-guest/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Csrftoken': csrfToken,
		},
		body: JSON.stringify({ email, password }),
		credentials: 'include',
	});
	await getXCrsfToken();
	return response;
}

export async function getLogin() {
	const response = await fetchJson(`${API_BASE_URL}login/`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include'
	});
	return response;
}

export async function getUserInfo(uid) {
	const encodedUid = encodeURIComponent(uid);
	const response = await fetchJson(`${API_BASE_URL}user-info/?uid=${encodedUid}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include'
	});
	return response;
}

export async function updateUserInfo(csrfToken, userInfo) {
	const response = await fetchJson(`${API_BASE_URL}user-info/`, {
		method: 'PUT',
		headers: {
			'X-Csrftoken': csrfToken,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(userInfo),
		credentials: 'include'
	});
	return response;
}

export async function updateProfileImage(csrfToken, formData) {
	const response = await fetchJson(`${API_BASE_URL}user-info/`, {
		method: 'PUT',
		headers: {
			'X-Csrftoken': csrfToken,
		},
		body: formData, // Invia il FormData
		credentials: 'include',
	});
	return response;
}

export async function getFriends() {
	const response = await fetchJson(`${API_BASE_URL}friend/`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include'
	});
	return response;
}

export async function getFriendRequests() {
	const response = await fetchJson(`${API_BASE_URL}friend/request/`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include'
	});
	return response;
}

export async function postFriendRequest(emitterUid, receiverUid, csrfToken) {
	const response = await fetchJson(`${API_BASE_URL}friend/request/`, {
		method: 'POST',
		headers: {
			'X-Csrftoken': csrfToken,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ 'emitter-uid': emitterUid, 'receiver-uid': receiverUid }),
		credentials: 'include'
	});
	return response;
}

export async function updateFriendRequestStatus(emitterUid, status, csrfToken) {
	const response = await fetchJson(`${API_BASE_URL}friend/request/`, {
		method: 'PUT',
		headers: {
			'X-Csrftoken': csrfToken,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ 'emitter-uid': emitterUid, 'status': status }),
		credentials: 'include'
	});
	return response;
}

export async function getLeaderboard() {
	const response = await fetchJson(`${API_BASE_URL}pong/leaderboard/`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include'
	});
	return response;
}

export async function getLeaderboardTris() {
	const response = await fetchJson(`${API_BASE_URL}tris/leaderboard/`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include'
	});
	return response;
}

export async function searchPlayers(username) {
	const response = await fetchJson(`${API_BASE_URL}search-player/?username=${username}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include'
	});
	return response;
}

export async function getPongPlayerInfo(uid) {
	const encodedUid = encodeURIComponent(uid);
	const response = await fetchJson(`${API_BASE_URL}pong/info/?uid=${encodedUid}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include'
	});
	return response;
}

export async function getTrisPlayerInfo(uid) {
	const encodedUid = encodeURIComponent(uid);
	const response = await fetchJson(`${API_BASE_URL}tris/info/?uid=${encodedUid}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include'
	});
	return response;
}

export async function getPongGames(uid = null) {
	const encodedUid = uid ? encodeURIComponent(uid) : null;
	const url = uid ? `${API_BASE_URL}pong/games/?uid=${encodedUid}` : `${API_BASE_URL}pong/games/`;
	const response = await fetchJson(url, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include'
	});
	return response;
}

export async function getTrisGames(uid = null) {
	const encodedUid = uid ? encodeURIComponent(uid) : null;
	const url = uid ? `${API_BASE_URL}tris/games/?uid=${encodedUid}` : `${API_BASE_URL}tris/games/`;
	const response = await fetchJson(url, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include'
	});
	return response;
}

export async function postPongGame(player1Uid, player2Uid, mode, p1Score, p2Score, csrfToken) {
	const response = await fetchJson(`${API_BASE_URL}pong/games/`, {
		method: 'POST',
		headers: {
			'X-Csrftoken': csrfToken,
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify({
			player1_uid: player1Uid,
			player2_uid: player2Uid,
			mode: mode,
			p1_score: p1Score,
			p2_score: p2Score
		})
	});
	return response;
}

export async function postTrisGame(player1Uid, player2Uid, mode, p1Score, p2Score, csrfToken) {
	const response = await fetchJson(`${API_BASE_URL}tris/games/`, {
		method: 'POST',
		headers: {
			'X-Csrftoken': csrfToken,
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify({
			player1_uid: player1Uid,
			player2_uid: player2Uid,
			mode: mode,
			p1_score: p1Score,
			p2_score: p2Score
		})
	});
	return response;
}

export async function postPongTournamentWinner(uid, csrfToken) {
	
	const response = await fetchJson(`${API_BASE_URL}pong/info/`, {
		method: 'POST',
		headers: {
			'X-Csrftoken': csrfToken,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ uid: uid }),
		credentials: 'include'
	});
	return response;
}

export async function postTrisTournamentWinner(uid, csrfToken) {
	const response = await fetchJson(`${API_BASE_URL}tris/info/`, {
		method: 'POST',
		headers: {
			'X-Csrftoken': csrfToken,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ uid: uid }),
		credentials: 'include'
	});
	return response;
}
