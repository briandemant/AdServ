describe('responsive: count functionality', function() {
	
	var countLog = {view : [], load : []};
	before(function(done) {
		loadPage('/examples/responsive/count.html?responsive=true', sizes.LARGE, function(win, doc) {
			win.AdServ.on('debug:checkVisibility:done', function(ctx) {
				done()
			})
			win.AdServ.on('debug:count:view', function(ctx) {
				countLog['view'].push(ctx);
			})
			win.AdServ.on('debug:count:load', function(ctx) {
				countLog['load'].push(ctx);
			})
		});
	})
	
	it('count only banners visible on LARGE', function(done) { 
		resizePage(sizes.LARGE, function(unrendered) {
			assert.equal(unrendered, 4, 'expected ' + unrendered + ' unrendered adspaces');
			assert.equal(countLog.view.length, 2, 'expected 2 counts of view');
			assert.equal(countLog.load.length, 1, 'expected 1 count of load');
		}, done);
	});
	
	it('count only banners visible on MEDIUM', function(done) {
		resizePage(sizes.MEDIUM, function(unrendered) {
			assert.equal(unrendered, 2, 'expected ' + unrendered + ' unrendered adspaces'); 
			assert.equal(countLog.view.length, 3, 'expected 4 counts of view');
			assert.equal(countLog.load.length, 2, 'expected 2 count of load');
		}, done);
	});
	
	
	it('going back to LARGE should emit no additional counts', function(done) {
		//reset 
		countLog = {view : [], load : []};
		resizePage(sizes.LARGE, function(unrendered) {
			assert.equal(countLog.view.length, 0, 'expected 2 counts of view');
			assert.equal(countLog.load.length, 0, 'expected 1 count of load');
		}, done);
	});
	
	
	it('count only banners visible on SMALL', function(done) {
		resizePage(sizes.SMALL, function(unrendered) {
			assert.equal(unrendered, 0, 'expected ' + unrendered + ' unrendered adspaces');
			assert.equal(countLog.view.length, 1, 'expected 4 counts of view');
			assert.equal(countLog.load.length, 1, 'expected 2 count of load');
		}, done);
	});
})
