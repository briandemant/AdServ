describe('basic functionality', function() {
	before(function(done) {
		loadPage('/examples/basic.html', 800, 400, function(win, doc) {
			win.AdServ.on('debug:contexts:loaded', function() {
				console.log("loaded!!");
			});
			console.log("done!!");
			
			win.AdServ.on('debug:checkVisibility:leave', function(rest) {
				console.log("leave");
				
				if (!rest) {
					done();
				}
			})

		});
	})
	
	it('AdServ should exist', function() {
		assert.isDefined(win.AdServ, 'AdServ should be a global object');
	});
	
	[200, 220, 219].forEach(function(adspace, idx) {
		var id = 'banner' + ( idx + 1);
		it('should have loaded adspace ' + adspace + ' into ' + id, function() {
			var div = doc.getElementById(id);
			var comment = div.childNodes[0].textContent;

			assert.notEqual(div.innerHTML, id + ' failed', id + ' should have changed');
			assert.match(comment, new RegExp("Adspace: " + adspace + " "), 'expected Adspace:  ' + adspace + ' but got ' + comment);

		});
	});
});