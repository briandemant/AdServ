//chai.Assertion.includeStack = true;

var assert = chai.assert;

var reload = function (newAdServ,after) {
	delete this['AdServ'];
	AdServ = newAdServ;
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.onload = after;
	script.src = "/base/build/AdServ.js";
	var first = document.getElementsByTagName("script")[0];
	first.parentNode.insertBefore(script, first);
}