// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });
/*
chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('window.html', {
    'outerBounds': {
      'width': 400,
      'height': 500
    }
  });
});

//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
	function(request, sender, sendResponse) {
  		console.log("hello, world!");
  		chrome.pageAction.show(sender.tab.id);
    	sendResponse();
	});

chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		console.log("request made");
	});

// Execute script & pass a variable
chrome.tabs.executeScript(tab.id, {
    code: 'console.log("hello, js!");'
}, function() {
    chrome.tabs.executeScript(tab.id, {file: '../inject/inject.js'});
});

chrome.webNavigation.onCompleted.addListener(
	function (request, sender, sendResponse) {
		console.log("navigate");
	});

*/