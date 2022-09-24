// The background script (background.js) is running in the background of the Chrome browser
// this is analogous a server.js script where the server (or in this case a background.js) script
// runs continually to listen and route requests.

// In background.js, messages are analogous to requests


const connections = {};

let firstRun = true;
let joinedMsg = 'loading...';

// Chrome on connecting to the Examin Panel, add an Listener
chrome.runtime.onConnect.addListener((port) => {
	const listenerForDevtool = (msg, sender, sendResponse) => {
		if (msg.name === 'connect' && msg.tabId) {
			
			connections[msg.tabId] = port;
			chrome.tabs.sendMessage(msg.tabId, {
				name: 'initial panel load',
				tabId: msg.tabId,
			});
		} else if (msg.name === 'pauseClicked' && msg.tabId) {
			chrome.tabs.sendMessage(msg.tabId, msg);
		} else if (msg.name === 'recordClicked' && msg.tabId) {
			chrome.tabs.sendMessage(msg.tabId, msg);
		} else if (msg.name === 'submitRootDir') {
			chrome.tabs.sendMessage(msg.tabId, msg);
		} else if (msg.name === 'newTestStep') {
			chrome.tabs.sendMessage(msg.tabId, msg);
		} else if (msg.name === 'selectedComponent') {
			chrome.tabs.sendMessage(msg.tabId, msg);
		}
	};
	// Listen from App.jsx
	// consistently listening on open port
	port.onMessage.addListener(listenerForDevtool);

});

// Chrome listening for messages (from content.js?)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	// IGNORE THE AUTOMATIC MESSAGE SENT BY CHROME WHEN CONTENT SCRIPT IS FIRST LOADED
	if (request.type === 'SIGN_CONNECT') {
		return true;
	}

	const { action, message } = request;
	const tabId = sender.tab.id;

	// Check for action payload from request body
	switch (action) {
		case 'injectScript': {
			// Injects injected.js into the body element of the user's application

			chrome.tabs.executeScript(tabId, {
				code: `
          // console.log('injecting javascript----');

          const injectScript = (file, tag) => {
            const htmlBody = document.getElementsByTagName(tag)[0];
            const script = document.createElement('script');
            script.setAttribute('type', 'text/javascript');
            script.setAttribute('src', file);
            htmlBody.appendChild(script);
          };
          injectScript(chrome.runtime.getURL('bundles/backend.bundle.js'), 'body');
        `,
			});

			break;
		}
		case 'components': {
			console.log('The request message is: ', request);
			// Sending another message to the front-end examin panel (at the current tab)
			// Access tabId property on connections object and posting a message to Examin frontend panel
			// connections[tabId] value is the id of user’s application’s tab
			if (connections[tabId.toString()]) {
				connections[tabId.toString()].postMessage({
					type: action,
					message: message
				});
			}

			break;
		}
		case 'newTestStep': {
			console.log('The request message is: ', request);
			if (connections[tabId.toString()]) {
				connections[tabId.toString()].postMessage({
					type: action,
					message: message
				});
			}

			break;
		}
		case 'beforeDOM': {
			console.log('The request message is: ', request);
			if (connections[tabId.toString()]) {
				connections[tabId.toString()].postMessage({
					type: action,
					message: message
				});
			}

			break;
		}
		case 'afterDOM': {
			console.log('The request message is: ', request);
			if (connections[tabId.toString()]) {
				connections[tabId.toString()].postMessage({
					type: action,
					message: message
				});
			}

			break;
		}
		case 'initial panel load': {
			connections[tabId.toString()].postMessage(joinedMsg);
		}
		default:
			break;
	}
});
