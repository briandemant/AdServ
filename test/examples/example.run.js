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