describe('unit: event functionality', function() {
	var resized = false;
	before(function(done) {
		loadPage('/examples/units/events.html', sizes.LARGE, function(win, doc) {
			if (!win.AdServ) { throw "AdServ is not defined" }
			win.AdServ.on('page:resize', function() {
				// adserv does not emit this on resize; 
				resized = true;
				win.AdServ.emit('debug:checkVisibility:done', 0);
			})
			done();
		});
	})

	it('both original onload and our event should be fired', function() {
		assert.equal($('#load', doc).html(), 'OK');
		assert.equal($('#orgload', doc).html(), 'OK');
	});

	it('both original onresize and our event should be fired', function(done) {
		assert.equal($('#resize', doc).html(), 'FAILED');
		assert.equal($('#orgresize', doc).html(), 'FAILED');
		resizePage(sizes.MEDIUM, function() {
			assert.ok(resized, 'resized');
			assert.equal($('#resize', doc).html(), 'OK');
			assert.equal($('#orgresize', doc).html(), 'OK');
		}, done);
	});
})
