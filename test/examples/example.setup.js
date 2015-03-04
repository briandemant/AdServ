// this is just so testing from a remote machine is possible
var baseUrl = '//' + document.location.hostname + ':1337';
var keyword = document.location.pathname.replace(/.*\/([^\.]*).*/, '$1');

if (document.location.search.match(/responsive=true/)) {
	var responsive = true;
	document.write('<' + 'script src="' + baseUrl + '/api/v2/js/responsive.js"></' + 'script>');
} else {
	document.write('<' + 'script src="' + baseUrl + '/api/v2/js/adserv.js"></' + 'script>');
}
