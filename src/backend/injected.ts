// This file contains the main logic that accesses the user's React application's state
// Stores state on load
// Uses React Dev Tools Global Hook to track state changes based on user interactions
// console.log('Currently in injected.js');

// any declaration is necessary here because the window will only have the react devtools global hook
// property once the page is loading into a chrome browser with the 
declare const window: any;

import testGenerator from './testGenerator';
import treeTraversal from './treeTraversal';

const dev = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;

let currMemoizedState;

let userInput = '';
// -----------------------------------------------------------------------------------
// Initializineg a message object which will be sent to content.js
const msgObj = { type: 'addTest', message: [] };
// -----------------------------------------------------------------------------------

// Logic for pause/recording -----------------------------------------------------
const mode = {
	paused: false,
};

// -----------------------------------------------------------------------------------
// Save fiberNode on load
let fiberNode = dev.getFiberRoots(1).values().next().value.current.child;
// console.log('fiberNode on load:', fiberNode);
// -----------------------------------------------------------------------------------

// Listens to messages from content.js
const handleMessage = (request) => {
	if (request.data.name === 'pauseClicked') {
		mode.paused = true;
	}
	if (request.data.name === 'recordClicked') {
		mode.paused = false;
	}
	// Handle logic for
	if (request.data.name === 'submitRootDir') {
		userInput = request.data.userInput;
		// makes the tests and puts it into the examin window - ensuring refresh
		createAndSendTestArray(fiberNode, userInput)
	}
};

let lastEvent = null;
let lastType = '';
let lastId = '';

const handleNewEvent = (e) => {
	if (e.type === 'click') {
		if (lastEvent === 'keydown') {
			handleKeydown(lastId, lastType);
			handleClicks(e);
		} else {
			handleClicks(e);
		}
	}
	if (e.type === 'keydown') {
		lastType = lastType + e.key;
		lastEvent = 'keydown';
		lastId = e.target.attributes['data-test'].value;
		return;
	}
}

const handleClicks = (e) => {
	lastEvent = 'click';
	const testRTL = `userEvent.click(screen.getByTestId('${e.target.attributes['data-test'].value}'))`;
	(testRTL);
}

const handleKeydown = (id, text) => {
	const testRTL = `userEvent.type(screen.getByTestId('${id}'), ${text})`;
	resetState();
	(testRTL);
}

const resetState = () => {
	lastEvent = null;
	lastId = '';
	lastType = '';
}

window.addEventListener('message', handleMessage);
window.addEventListener('click', handleNewEvent);
window.addEventListener('keydown', handleNewEvent);

// -----------------------------------------------------------------------------------
// findMemState returns the user's application's state
const findMemState = ( node : FiberNode) => {
	// Finds the fiberNode on which memoizedState resides
	while (node.memoizedState === null) {
		node = node.child;
	}
	node = node.memoizedState;
	while (typeof node.memoizedState !== 'object') {
		node = node.next;
	}
	// return the memoizedState of the found fiberNode
	return node.memoizedState;
};

// the createAndSendTestArray will use the fibernode and user input (root directory) to generate the array of
// test strings and send that array to the panel to be rendered
const createAndSendTestArray = (node : FiberNode, rootDirectory : string) => {
	//the imported treeTraversal function generates the array of objects needed by testGenerator to create the tests
	const testInfoArray = treeTraversal(node, rootDirectory);
	console.log(testInfoArray);
	// testGenerator uses that array to create the array of test strings 
	const tests = testGenerator(testInfoArray);
	console.log(tests);
	// those testStrings are added to the msgObj object, which is then sent to the examin panel
	msgObj.message = tests; // msgObj = {type: 'addTest', message: []}
	window.postMessage(msgObj, '*');	
}


// -----------------------------------------------------------------------------------
// Generate tests for default state
createAndSendTestArray(fiberNode, userInput)
// -----------------------------------------------------------------------------------

// onCommitFiberRoot is USED TO TRACK STATE CHANGES ----------------------------------------
// patching / rewriting the onCommitFiberRoot functionality
// onCommitFiberRoot runs functionality every time there is a change to the page
dev.onCommitFiberRoot = (function (original) {
	// console.log('original test', original)
	return function (...args) {
		if (!mode.paused) {
			// Reassign fiberNode when onCommitFiberRoot is invoked
			fiberNode = args[1].current.child;

			// save newMemState
			const newMemState = findMemState(fiberNode);

			// initialize a stateChange variable as a boolean which will tell if state changed or not
			// onCommitFiberRoot will run every time the user interacts with the page, regardless of if
			// that interaction actually changes state
			const stateChange =
				JSON.stringify(newMemState) !== JSON.stringify(currMemoizedState);
			// Run the test generation function only if the state has actually changed
			if (stateChange) {
				createAndSendTestArray(fiberNode, userInput);
				currMemoizedState = newMemState;				
			}
		}
	};
})(dev.onCommitFiberRoot); 
// -----------------------------------------------------------------------------------
