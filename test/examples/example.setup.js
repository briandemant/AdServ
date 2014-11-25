// this is just so testing from a remote machine is possible
var baseUrl = '//' + document.location.hostname + ':1337';
var keyword = document.location.pathname.replace(/.*\/([^\.]*).*/, '$1');

document.write('<' + 'script src="' + baseUrl + '/api/v2/js/adserv.js"></' + 'script>');

var title = document.createElement("h2");
title.innerHTML = document.title;
var link = document.createElement("a");
link.href = '//' + document.location.hostname + ':3000' + document.location.pathname;
link.target = document.location.pathname;
link.appendChild(title);
document.body.appendChild(link);

function flashCalled(token, click) {
	top.postMessage(JSON.stringify({source : 'flash', token : token, click : click}), '*');
}
 