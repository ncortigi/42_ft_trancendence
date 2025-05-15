import { handleLogin, handleLoginGuest, handleSignup, isAuth, handleUpdateUserInfo } from './handleApi.js';
import { general } from './classes.js';
import { setElementById, addInvalidClass, removeInvalidClass } from './utils.js';

function validateEmail(email) {
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return re.test(email) && email.length <= 50 && email.length > 0;
}

function validateUsername(username) {
	return (username.length <= 10 && username.length > 0 && /^[a-zA-Z0-9]+$/.test(username));
}

function validatePassword(password) {
	return (password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password));
}
		
function validateName(name) {
	return (name.length > 0 && name.length <= 50);
}

function validateNumber(number) {
	return (number >= 3 && number <= 8);
}

function handleValidationAux(isValid, elementId, validationFunction, value, help) {
	if (!validationFunction(value)) {
		isValid = false;
		if (help)
			setElementById(help, 'none');
		addInvalidClass(elementId);
	} else {
		removeInvalidClass(elementId);
	}
	return isValid;
}

function handleValidation(email, username, password, checkUser = false, help = false) {
	let isValid = true;

	isValid = handleValidationAux(isValid, 'emailID', validateEmail, email, help ? 'emailHelp' : '');
	if (checkUser)
		isValid = handleValidationAux(isValid, 'usernameID', validateUsername, username, help ? 'userHelp' : '');
	isValid = handleValidationAux(isValid, 'passwordID', validatePassword, password, help ? 'passHelp' : '');
	return isValid;
}

// Form validazione torneo
export function tournamentFormListener(handleNavigation, game, room) {
	document.getElementById('tournamentForm').addEventListener('submit', async function(event) {
		event.preventDefault();
		const name = document.getElementById('tournamentName').value;
		const number = parseInt(document.getElementById('tournamentSelect').value, 10);
		let isValid = true;

		isValid = handleValidationAux(isValid, 'tournamentName', validateName, name);
		isValid = handleValidationAux(isValid, 'tournamentSelect', validateNumber, number);
		if (isValid) {
			if (await isAuth()) {
				general.tournament.set(general.player.id, name, game, number, general.player.name);
				handleNavigation(room);
			} else {
				console.log('%cUser is not authenticated', 'color: red');
				return;
			}
		}
	});
}

// Form validazione Login
export function loginFormListener(handleNavigation, isOther, page) {
	document.getElementById('loginForm').addEventListener('submit', async function(event) {
		event.preventDefault();
		const email = document.getElementById('emailID').value;
		const password = document.getElementById('passwordID').value;
		if (handleValidation(email, '', password))
			if (isOther)
				await handleLoginGuest(email, password, handleNavigation, page);
			else
				await handleLogin(email, password, handleNavigation, page);
	});
}

// Form validazione Sign up
export function signupFormListener(handleNavigation, page) {
	document.getElementById('signupForm').addEventListener('submit', async function(event) {
		event.preventDefault();
		const email = document.getElementById('emailID').value;
		const username = document.getElementById('usernameID').value;
		const password = document.getElementById('passwordID').value;
		if (handleValidation(email, username, password, true, true)) {
			await handleSignup(email, username, password, handleNavigation, page);
		}
	});
}

// Form validazione Profilo
export function profileFormListener(handleNavigation) {
	document.getElementById('editProfileForm').addEventListener('submit', async function(event) {
		event.preventDefault();
		const email = document.getElementById('emailID').value;
		const username = document.getElementById('usernameID').value;
		const password = document.getElementById('oldPasswordID').value;
		const newPassword = document.getElementById('newPasswordID').value;
		let isValid = true;

		isValid = handleValidationAux(isValid, 'emailID', validateEmail, email, 'emailHelp');
		isValid = handleValidationAux(isValid, 'usernameID', validateUsername, username, 'userHelp');
		isValid = handleValidationAux(isValid, 'oldPasswordID', validatePassword, password, 'oldPasswordHelp');
		if (newPassword)
			isValid = handleValidationAux(isValid, 'newPasswordID', validatePassword, newPassword, 'newPasswordHelp');
		if (isValid) {
			const userInfo = {
				email: email,
				username: username,
				password: password,
				newPassword: newPassword
			};
			if (await handleUpdateUserInfo(userInfo))
				handleNavigation('profile');
		}
	});
}
