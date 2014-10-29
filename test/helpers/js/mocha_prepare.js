assert = chai.assert;
mocha.setup('bdd');

var currentIframe, win, doc,  asd;
 
function loadPage(page, width, height, cb) { 
	var testarea = document.getElementById("testarea");
	testarea.innerHTML = '';


	var ifrm = document.createElement("iframe");

	ifrm.style.width = width + "px";
	ifrm.style.height = height + "px";
	ifrm.style.border = 0;
	ifrm.style.borderStyle = "none";
	ifrm.frameBorder = 0;
	ifrm.scrolling = "no";
   
	ifrm.onload = function() { 
		win = currentIframe.contentWindow;
		doc = win.document;
      cb(win,doc);
	};
    

	ifrm.src = page;
	currentIframe = ifrm;

	testarea.appendChild(ifrm);
}


window.addEventListener("message", function() {
   console.log("got message"); 
}, false); 