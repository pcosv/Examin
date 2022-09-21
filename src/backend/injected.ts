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

const userInput = '';

let selectedComponent = 0;

// -----------------------------------------------------------------------------------
// Save fiberNode on load
const fiberNode = dev.getFiberRoots(1).values().next().value.current.child;
// -----------------------------------------------------------------------------------

// Listens to messages from content.js
const handleMessage = (request) => {
	if (request.data.name === 'pauseClicked') {
		const componentInfo = createComponentsInfoArray(fiberNode, userInput);
		createAndSendCurrentDOM(componentInfo[selectedComponent], 'afterDOM');
		window.removeEventListener('click', handleNewEvent);
		window.removeEventListener('keydown', handleNewEvent);
	}
	if (request.data.name === 'recordClicked') {
		window.addEventListener('click', handleNewEvent);
		window.addEventListener('keydown', handleNewEvent);
		const componentInfo = createComponentsInfoArray(fiberNode, userInput);
		createAndSendCurrentDOM(componentInfo[selectedComponent], 'beforeDOM');
	}
	if (request.data.name === 'selectedComponent') {
		selectedComponent = request.data.message;
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
	const testRTL = `userEvent.click(screen.getByTestId('${e.target.attributes['data-test'].value}'));`;
	const msgObj = { type: 'newTestStep', message: testRTL };
	window.postMessage(msgObj, '*');
}

const handleKeydown = (id, text) => {
	const testRTL = `userEvent.type(screen.getByTestId('${id}'), '${text}');`;
	const msgObj = { type: 'newTestStep', message: testRTL };
	window.postMessage(msgObj, '*');
	resetState();
}

const resetState = () => {
	lastEvent = null;
	lastId = '';
	lastType = '';
}

window.addEventListener('message', handleMessage);

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

const createAndSendCurrentDOM = (componentInfo: ComponentInfo, type: string) => {
	const tests = testGenerator([componentInfo]);
	const msgObj = { type: type, message: tests };
	window.postMessage(msgObj, '*');	
}

const createAndSendComponentNamesArray = (componentInfo: ComponentInfo[]) => {
	const names = [];
	for (let i = 0; i < componentInfo.length; i++) {
		names.push(componentInfo[i].name);
	}
	const msgObj = { type: 'components', message: names };
	window.postMessage(msgObj, '*');
}

const createComponentsInfoArray = (node : FiberNode, rootDirectory : string) => {
	const nodesInfoArray = treeTraversal(node, rootDirectory);	
	return nodesInfoArray;
}

// -----------------------------------------------------------------------------------
const componentInfo = createComponentsInfoArray(fiberNode, userInput);
createAndSendComponentNamesArray(componentInfo);
// -----------------------------------------------------------------------------------
