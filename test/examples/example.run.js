AdServ.on('debug:wrapped', function(ifrm, elem) { 

	var flashScript = document.createElement("script");

	flashScript.innerText = 'function flashCalled(token, click) {\n\tconsole.log(token, click);\n}';
	elem.appendChild(flashScript);

})


AdServ.on('*', function(event,args) {
	//console.debug(event,args); 
})
AdServ.on('debug:after:render', function(campaign) {
	//console.debug('debug:after:render', campaign); 
})