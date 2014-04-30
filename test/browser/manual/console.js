if (typeof console == 'undefined') {
	var consoleElm = document.createElement("div");
	consoleElm.id = "console";
	document.body.appendChild(consoleElm);
	var log = function(type) {
		return function() { 
			for (var i = 0; i < arguments.length; i++) {
				var span = document.createElement("div");
				span.setAttribute('class', type);
				span.innerHTML = arguments[i];
				consoleElm.appendChild(span);
			}
		}
	}
	window.console = {
		log : log("log"),
		debug : log("debug"),
		error : log("error")
	}
}
console.log("logging ok"); 