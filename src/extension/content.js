// Content scripts are files that run in the context of the webpage, currently limited to only running on
// "http://localhost/*", "https://localhost/*"

// Runs when user navigates to localhost:3000

// console.log('Chrome Extension READY!!');

let firstRun = true;

// Listener for Frontend to Backend ---------------------------------------
// Window Listening for messeges in the window, if it recieves a 'message' (listening for injected.js)
window.addEventListener('message', (request, sender, sendResponse) => {
	// if (request.data.type === 'addTest') {
	if (request.data.type === 'components') {
		return chrome.runtime.sendMessage({
			action: request.data.type,
			message: request.data.message,
		});
	}
	if (request.data.type === 'newTestStep') {
		return chrome.runtime.sendMessage({
			action: request.data.type,
			message: request.data.message,
		});
	}
	if (request.data.type === 'beforeDOM') {
		console.log('in content.js, request.data: ', request.data);
		return chrome.runtime.sendMessage({
			action: request.data.type,
			message: request.data.message,
		});
	}
	if (request.data.type === 'afterDOM') {
		console.log('in content.js, request.data: ', request.data);
		return chrome.runtime.sendMessage({
			action: request.data.type,
			message: request.data.message,
		});
	}
});
// ------------------------------------------------------------------------

// Listener for Chrome Browser --------------------------------------------
// Chrome Listening for messeges in the browser, if it recieves a 'message' (listening for background.js)
chrome.runtime.onMessage.addListener((request) => {
	// console.log('Recieved a msg from background.js, request is: ', request);

	if (request.name === 'initial panel load') {
		// Send a message back to background.js to initialize the initial state
		console.log('In initial panel load!');
		chrome.runtime.sendMessage({ action: 'initial panel load' });
	} else if (request.name === 'pauseClicked' && request.tabId) {
		// Send a postMessage to window to forward request to injected.js
		window.postMessage(request, '*');
	} else if (request.name === 'recordClicked' && request.tabId) {
		// Send a postMessage to window to forward request to injected.js
		window.postMessage(request, '*');
	} else if (request.name === 'submitRootDir' && request.tabId) {
		// Send a postMessage to window to forward request to injected.js
		window.postMessage(request, '*');
	} else if (request.name === 'selectedComponent' && request.tabId) {
		// Send a postMessage to window to forward request to injected.js
		window.postMessage(request, '*');
	}
});
// ------------------------------------------------------------------------

// Send a message to background.js with the shape { action: 'injectScript' } to injectScript
chrome.runtime.sendMessage({ action: 'injectScript' });
