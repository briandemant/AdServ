"use strict";

var newLevels = getRequestParameter('AdServ.logLevels');

if (typeof newLevels !== undefined && newLevels !== '') {
	//window.console.warn('READ LOGLEVELS FROM QS');
	AdServ.logLevels = {};
	newLevels.split(',').forEach(function(level) {
		AdServ.logLevels[level] = 1;
	})
	setCookie('AdServ:logLevels', JSON.stringify(AdServ.logLevels), 10);
} else if (newLevels === '') {
	//window.console.warn('RESET LOGLEVELS FROM QS');
	removeCookie('AdServ:logLevels');
} else {
	var newLevels = getCookie('AdServ:logLevels');
	if (typeof newLevels !== undefined) {
		//window.console.warn('READ LOGLEVELS FROM COOKIE');
		try {
			AdServ.logLevels = JSON.parse(newLevels);
		} catch (e) {
			window.console.error(e);
		}
	} else {
		//window.console.warn('DEFAULT LOGLEVELS');
	}
}


// Protect against missing console.log 
AdServ.log_history = [];

if (typeof window.console === undefined) {
	window.console = {};
}

window.console.log = window.console.log || function() {};
window.console.debug = window.console.debug || window.console.log;
window.console.error = window.console.error || window.console.log;
window.console.warn = window.console.warn || window.console.log;
window.console.info = window.console.info || window.console.log;

AdServ.replayLog = function(logLevels) {
	window.console.clear && window.console.clear();
	window.console.group && window.console.group('Replay');
	AdServ.log_history.forEach(function(logEntry) {
		window.console[logEntry[0]].apply(window.console, logEntry[1])
	})
	window.console.groupEnd && window.console.groupEnd();
};

AdServ.enableLog = function() {
	var was = document.location.search.replace(/&*AdServ.logLevels=[^&]+/g, '');
	document.location.href = document.location.pathname + was + (was.length == 0 ? '?' : '&') + 'AdServ.logLevels=error,warn,info,debug,log'
}

AdServ.disableLog = function() {
	var was = document.location.search.replace(/&*AdServ.logLevels=[^&]*/g, '');
	document.location.href = document.location.pathname + was + (was.length == 0 ? '?' : '&') + 'AdServ.logLevels=error'
}

function makeLogger(level) {

	if (AdServ.logLevels[level]) {
		return function say() {
			var args = [].slice.call(arguments);
			AdServ.log_history.push([level, args]);
			window.console[level].apply(window.console, args);
		}
	} else {
		return function silent() {
			var args = [].slice.call(arguments);
			AdServ.log_history.push([level, args]);
		}
	}
}
var console;
if (AdServ.develop) {
	console = window.console;
}else {
	  console = {
		log : makeLogger('log'),
		info : makeLogger('info'),
		debug : makeLogger('debug'),
		error : makeLogger('error'),
		warn : makeLogger('warn')
	};
}