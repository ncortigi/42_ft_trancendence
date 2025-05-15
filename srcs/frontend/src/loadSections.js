export function loadCanvas(page) {
	document.getElementById(page).innerHTML = `
		<div class="container-fluid">
			<canvas id="gameCanvas" class="mx-auto mt-0"></canvas>
		</div>
	`;
}

function createButton(id, type, classes, trs, modal = 0) {
	return `<button id="${id}" type="${type}" class="btn btn-${classes}" ${modal === 1 ? 'data-bs-toggle="modal" data-bs-target="#staticBackdrop"' : modal === 2 ? 'style="display: none;"' : modal === 3 ? 'disabled' : ''} data-translate="${trs}"></button>`;
}

export function loadHome(isAuthenticated) {
	document.getElementById('home').innerHTML = `
		<div class="d-grid gap-2 col-7 col-xs-5 col-md-4 col-lg-3 col-xl-2 mx-auto">
			${createButton('play-btn', 'button', 'dark', 'play')}
			${createButton('leaderboard-btn', 'button', 'dark', 'leaderboard')}
			${isAuthenticated ? createButton('profile-btn', 'button', 'dark', 'profile') : ''}
			${isAuthenticated ? createButton('stats-btn', 'button', 'dark', 'stats') : ''}
			${isAuthenticated ? '' : createButton('login-btn', 'button', 'dark', 'login')}
			${isAuthenticated ? createButton('logout-btn', 'button', 'dark', 'logout') : ''}
		</div>
	`;
}

function loadButtons(id1, id2, tr1, tr2) {
	return `
		<div class="d-grid gap-2 col-7 col-xs-5 col-md-4 col-lg-3 col-xl-2 mx-auto">
			${createButton(id1, 'button', 'dark', tr1)}
			${createButton(id2, 'button', 'dark', tr2)}
			${createButton('back-btn', 'button', 'dark mb-3', 'back')}
		</div>
	`;
}

export function loadLogin(login = 'login') {
	document.getElementById(login).innerHTML = loadButtons('login-btn', 'signup-btn', 'login', 'register');
}

export function loadGame() {
	document.getElementById('game').innerHTML = loadButtons('play-pong-btn', 'play-tris-btn', 'playPong', 'playTris');
}

export function loadModes(elementId, isAuthenticated) {
	document.getElementById(elementId).innerHTML = `
		<div class="d-grid gap-2 col-7 col-xs-5 col-md-4 col-lg-3 col-xl-2 mx-auto">
			${createButton('local-match-btn', 'button', 'dark', 'localMatch')}
			${isAuthenticated ? createButton('online-match-btn', 'button', 'dark', 'onlineMatch', 1) : ''}
			${createButton('bot-match-btn', 'button', 'dark', 'botMatch')}
			${isAuthenticated ? createButton('tournament-btn', 'button', 'dark', 'tournament') : ''}
			${createButton('back-btn', 'button', 'dark mb-3', 'back')}
		</div>
	`;
}

export function loadGameMode(element) {
	document.getElementById(element).innerHTML = `
		<div class="d-grid gap-2 col-7 col-xs-5 col-md-4 col-lg-3 col-xl-2 mx-auto">
			${createButton('local-match-btn', 'button', 'dark', 'localMatch')}
			${createButton('login-btn', 'button', 'dark', 'loginSecond')}
			${createButton('back-btn', 'button', 'dark mb-3', 'back')}
		</div>
	`;
}

function loadTournamentCardTop() {
	return `
		<div class="d-grid gap-1 col-12 col-xs-10 col-md-8 col-lg-6 col-xl-5 mx-auto">
			<div class="card text-white bg-dark mb-1">
				<div class="card-body">
	`;
}

function loadCardTop(cls, tr) {
	return `
		${loadTournamentCardTop()}
			<h5 class="${cls}" data-translate="${tr}"></h5>
	`;
}

function loadUpperForm(tr, id) {
	return `
		${loadCardTop('card-title', tr)}
			<form id="${id}" class="needs-validation" novalidate>
	`;
}

function generateInputField(type, id, error, help = '') {
	return `
		<div id="${type}-label" class="${(id === 'loginPassword') ? 'mb-1 mt-2' : 'mb-1'}">
			<label for="${id}" class="form-label" data-translate="${type}"></label>
			<input type="${type}" class="form-control bg-dark text-white" id="${id}" ${help ? `aria-describedby="${help}"` : ''} required>
			${help ? `<div id="${help}" class="form-text text-white-50" data-translate="${error}"></div>` : ''}
			<div class="invalid-feedback" data-translate="${error}"></div>
		</div>
	`;
}

function loadCardBottom(col) {
	return `
				</div>
			</div>
			<div class="d-grid gap-2 col-${col} mx-auto">
				${createButton('back-btn', 'button', 'dark mb-3', 'back')}
			</div>
		</div>
	`;
}

function loadLowerForm() {
	return `
			</form>
		${loadCardBottom(4)}
	`;
}

export function loadTournamentForm(element) {
	document.getElementById(element).innerHTML = `
		${loadUpperForm('createTournament', 'tournamentForm')}
			${generateInputField('name', 'tournamentName', 'tournamentError')}
			<div id="players-label" class="mb-1 mt-2">
				<label for="tournamentSelect" class="form-label" data-translate="tournamentPlayers">Number of players</label>
				<select class="form-select bg-dark text-white" aria-label="tournament player select" id="tournamentSelect" required>
					<option selected>-</option>
					<option value="3">3</option>
					<option value="4">4</option>
					<option value="5">5</option>
					<option value="6">6</option>
					<option value="7">7</option>
					<option value="8">8</option>
				</select>
				<div class="invalid-feedback" data-translate="selectError">Select a number</div>
			</div>
			${createButton('tournament-btn', 'submit', 'success me-1 mt-1', 'createTournament')}
		${loadLowerForm()}
	`;
}

export function loadTournamentRoom(element, isFull) {
	document.getElementById(element).innerHTML = `
		${loadTournamentCardTop()}
					<h5 id="tournamentRoomName" class="card-title mb-2"></h5>
					<ul id="tournamentRoomList" class="list-group"></ul>
					<div class="text-center">
						${isFull ? createButton('tournamentStart', 'button', 'success me-1 mt-2', 'startTournament') : ''} 
						${createButton('back-btn', 'button', 'danger mt-2', 'quit')}
					</div>
				</div>
			</div>
		</div>
	`;
}

export function loadTournamentOngoing(element, roundEnded, tournamentRunning) {
	document.getElementById(element).innerHTML = ` 
		${loadTournamentCardTop()}
					<h5 id="tournamentRoomName" class="card-title mb-2"></h5>
					<div class="table-responsive">
						<table class="table table-dark table-hover">
							<thead>
								<tr>
									<th scope="col" data-translate="player">Player</th>
									<th scope="col" class="text-center" data-translate="points">Points</th>
									<th scope="col" class="text-center" data-translate="games">Games</th>
									<th scope="col" class="text-center" data-translate="wins">Wins</th>
									<th scope="col" class="text-center" data-translate="losses">Losses</th>
									<th scope="col" class="text-center" data-translate="pointDiff">Point Difference</th>
								</tr>
							</thead>
							<tbody id="leaderboardTournament" class="table-group-divider">
							</tbody>
						</table>
					</div>
					${tournamentRunning ? '<h5 id="roundName" class="card-title mb-2"></h5>' : '<h5 id="tournamentWinner" class="card-title text-center mb-2"></h5>'}
					<ul id="tournamentMatchesList" class="list-group"></ul>
					<div id="tournamentButtons" class="text-center">
						${tournamentRunning ? roundEnded ? createButton('matchStart', 'button', 'success me-1 mt-2', 'startNextMatch') : 
							createButton('roundStart', 'button', 'primary me-1 mt-2', 'startNextRound') : ''}
						${createButton('back-btn', 'button', 'danger mt-2', 'quit')}
					</div>
				</div>
			</div>
		</div>
	`;
}

// Form di login
export function loadLoginForm(element) {
	document.getElementById(element).innerHTML = `
		${loadUpperForm('login', 'loginForm')}
			${generateInputField('email', 'emailID', 'emailError')}
			${generateInputField('password', 'passwordID', 'passError')}
			${createButton('login-submit-btn', 'submit', 'success me-1 mt-1', 'login')}
		${loadLowerForm()}
	`;
}

// Form di signup
export function loadSignupForm(element) {
	document.getElementById(element).innerHTML = `
		${loadUpperForm('register', 'signupForm')}
			${generateInputField('email', 'emailID', 'emailHelp', 'emailHelp')}
			${generateInputField('username', 'usernameID', 'userHelp', 'userHelp')}
			${generateInputField('password', 'passwordID', 'passHelp', 'passHelp')}
			${createButton('signup-submit-btn', 'submit', 'success me-1 mt-1', 'submit')}
		${loadLowerForm()}
	`;
}

export function loadLeaderboard() {
	document.getElementById('leaderboard').innerHTML = `
		${loadTournamentCardTop()}
			${loadDropdown('leaderboard', 'leaderboardTypeDropdown', 'mb-1', 'ms-0', '')}
			<div class="table-responsive">
				<table class="table table-dark table-hover">
					<thead>
						<tr>
							<th scope="col">#</th>
							<th scope="col" data-translate="player">Player</th>
							<th scope="col" class="text-center" data-translate="wins">Wins</th>
							<th scope="col" class="text-center" data-translate="losses">Losses</th>
							<th scope="col" class="text-center" data-translate="winrate">Win rate</th>
						</tr>
					</thead>
					<tbody id="leaderboardList" class="table-group-divider">
					</tbody>
				</table>
			</div>
		${loadCardBottom(4)}
	`;
}

function loadProfileTop(tr) {
	return `
		<div class="d-grid gap-1 col-12 col-lg-11 col-xl-9 mx-auto">
			<div class="card text-white bg-dark mb-1">
				<div class="card-header" data-translate="${tr}"></div>
				<div class="card-body">
					<div class="row">
	`;
}

function loadDropdown(tr, id, mb = 'mb-0', ms = 'ms-0', border = 'border-white') {
	return `
		<div class="d-flex justify-content-between align-items-center">
			<h5 class="card-title ${mb} ${ms}" data-translate="${tr}"></h5>
			<div class="dropdown">
				<button class="btn btn-dark dropdown-toggle ${border} me-1" type="button" id="${id}" data-bs-toggle="dropdown" aria-expanded="false">Pong</button>
				<ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="${id}">
					<li><a class="dropdown-item dropdown-stats" href="#" data-value="pong">Pong</a></li>
					<li><a class="dropdown-item dropdown-stats" href="#" data-value="tris" data-translate="tris">Tic-Tac-Toe</a></li>
				</ul>
			</div>
		</div>
	`;
}

export function loadProfile() {
	document.getElementById('profile').innerHTML = `
		${loadProfileTop('profile')}
				<div class="col-md-3 mb-3 text-center">
					<h4 id="playerNameProfile" class="card-title mt-2">Player01</h4>
					<img id="profileImage" src="default-avatar.jpg" alt="Profile Image" class="img-thumbnail" style="width: 150px; height: 150px;">
					<input type="file" id="uploadImage" class="form-control mt-1" style="display: none;">
					<div>
						${createButton('uploadImageBtn', 'button', 'success mt-2', 'uploadImage')}
					</div>
					<div class="mt-3 mb-4">
						${loadDropdown('stats', 'playerTypeDropdown', 'mb-0', 'ms-4')}
						<div id="profileStats" class="mt-2"></div>
						${createButton('viewStatsBtn', 'button', 'light mt-3', 'viewStats')}
					</div>
					${createButton('editProfileBtn', 'button', 'light mt-auto', 'editProfile')}
				</div>
				<div class="col-md-5 mb-3">
					<h5 class="card-title" data-translate="info">Info</h5>
					<textarea id="profileDescription" class="form-control bg-dark text-white-50" rows="5" readonly maxlength="500"></textarea>
					${createButton('editDescriptionBtn', 'button', 'light mt-2', 'edit')}
					${createButton('saveDescriptionBtn', 'button', 'success mt-2', 'save', 2)}
					<div class="mt-4">
						${loadDropdown('recentGames', 'gameTypeDropdown')}
						<ul id="recentGamesList" class="list-group mt-2"></ul>
					</div>
				</div>
				<div class="col-md-4">
					<h5 class="card-title" data-translate="friends">Friends</h5>
					<ul id="friendsList" class="list-group mb-3"></ul>
					<h6 class="card-title" data-translate="friendRequests">Friend Requests</h6>
					<ul id="friendRequestsList" class="list-group mb-3"></ul>
					<h6 class="card-title" data-translate="sentRequests">Sent Requests</h6>
					<ul id="sentRequestsList" class="list-group"></ul>
				</div>
			</div>
		${loadCardBottom(2)}
	`;
}

// Form di modifica profilo
export function loadEditProfileForm() {
	document.getElementById('profileForm').innerHTML = `
		${loadUpperForm('editProfile', 'editProfileForm')}
			<div id="id-label" class="mb-1">
				<label for="userID" class="form-label" data-translate="id">Unique ID</label>
				<input type="id" class="form-control bg-dark text-white" id="userID" disabled readonly>
			</div>
			${generateInputField('email', 'emailID', 'emailHelp', 'emailHelp')}
			${generateInputField('username', 'usernameID', 'userHelp','userHelp')}
			<div id="password-label" class="mb-1">
				<label for="oldPasswordID" class="form-label" data-translate="oldPassword">Current Password</label>
				<input type="password" class="form-control bg-dark text-white" id="oldPasswordID" aria-describedby="oldPasswordHelp" required>
				<div id="oldPasswordHelp" class="form-text text-white-50" data-translate="oldPasswordHelp"></div>
				<div class="invalid-feedback" data-translate="oldPassError"></div>
			</div>
			<div id="password-label" class="mb-1">
				<label for="newPasswordID" class="form-label" data-translate="newPassword">New Password</label>
				<input type="password" class="form-control bg-dark text-white" id="newPasswordID" aria-describedby="newPasswordHelp">
				<div id="newPasswordHelp" class="form-text text-white-50" data-translate="newPasswordHelp"></div>
				<div class="invalid-feedback" data-translate="passHelp"></div>
			</div>
			${createButton('edit-btn', 'submit', 'success me-1 mt-1', 'editProfile')}
		${loadLowerForm()}
	`;
}

export function loadProfileOther() {
	document.getElementById('profileOther').innerHTML = `
		${loadProfileTop('profile')}
				<div class="col-md-3 mb-3 text-center">
					<h4 id="playerNameOther" class="card-title mt-2">Player02</h4>
					<img id="profileImageOther" src="default-avatar.jpg" alt="Profile Image" class="img-thumbnail" style="width: 150px; height: 150px;">
					<div>
						${createButton('sendFriendProfile', 'button', 'success mt-2', 'sendFriend')}
					</div>
					<div class="mt-3">
						${loadDropdown('stats', 'playerTypeDropdownOther', 'mb-0', 'ms-4')}
						<div id="profileStatsOther" class="mt-2"></div>
					</div>
				</div>
				<div class="col-md-5 mb-3">
					<h5 class="card-title" data-translate="info">Info</h5>
					<textarea id="profileDescriptionOther" class="form-control bg-dark text-white-50" rows="5" readonly maxlength="500"></textarea>
					<div class="mt-4">
						${loadDropdown('recentGames', 'gameTypeDropdownOther')}
						<ul id="recentGamesListOther" class="list-group mt-2"></ul>
					</div>
				</div>
				<div class="col-md-4">
					${loadDropdown('modeResults', 'modeTypeDropdownOther')}
					<div id="modeStatsOther"></div>
				</div>
			</div>
		${loadCardBottom(2)}
	`;
}

export function loadStats() {
	document.getElementById('stats').innerHTML = `
		${loadProfileTop('stats')}
				<div class="col-md-3 text-center">
					<h5 class="card-title" data-translate="generalStats">Player Stats</h5>
					<img id="profileImageStats" src="default-avatar.jpg" alt="Profile Image" class="img-thumbnail" style="width: 120px; height: 120px;">
					<p id="playerNameStats" class="mt-1">Player01</p>
					${loadDropdown('stats', 'playerTypeDropdownStats', 'mb-0', 'ms-4')}
					<div id="profileStats2" class="mt-2"></div>
				</div>
				<div class="col-md-5">
					${loadDropdown('recentGames', 'gameTypeDropdownStats')}
					<ul id="recentGamesList2" class="list-group mt-2"></ul>
				</div>
				<div class="col-md-4">
					${loadDropdown('modeResults', 'modeTypeDropdown')}
					<div id="modeStats"></div>
				</div>
			</div>
		${loadCardBottom(2)}
	`;
}

export function loadSearchPlayers() {
	document.getElementById('search').innerHTML = `
		${loadCardTop('card-title mb-2', 'searchPlayers')}
			<ul id="searchPlayersList" class="list-group"></ul>
		${loadCardBottom(4)}
	`;
}