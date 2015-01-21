var title = document.createElement("h2");
title.innerHTML = document.title;
var link = document.createElement("a");
link.href = '//' + document.location.hostname + ':3000' + document.location.pathname;
link.target = document.location.pathname;
link.appendChild(title);
document.body.appendChild(link); 
console.log('%c'+document.title + (responsive? ' (responsive)': ' (async)'),'color:yellow;background:black');


function flashCalled(token, click) {
	top.postMessage(JSON.stringify({source : 'flash', token : token, click : click}), '*');
}


AdServ.on('debug:wrapped', function(ctx, elem) {
	var flashScript = document.createElement("script");
	flashScript.innerText = "function flashCalled(token, click) {top.postMessage(JSON.stringify({source : 'flash',token : token, click : click}), '*' )}";
	elem.contentDocument.body.appendChild(flashScript);
})


AdServ.on('*', function(event, args) {
	//console.debug(event,args); 
})
AdServ.on('debug:after:render', function(campaign) {
	//console.debug('debug:after:render', campaign); 
})