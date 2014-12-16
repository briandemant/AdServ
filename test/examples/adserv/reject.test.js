describe('reject functionality', function() {

	before(function(done) {
		loadPage('/examples/adserv/reject.html', 800, 800, function(win, doc) {
			var first = true;
			win.AdServ.on('debug:all:contexts:loaded', function() {
				if (first) {
					first = false;
					console.debug("go test!!");
					done();
				}
			})
		});
	})
 
	it('should reject 70 and load next (empty)', function() {
		this.timeout(5000);
		return makeTestPromise(70, [1], 'banner1')
	});
	it('should reject 72 and load next', function() {
		this.timeout(5000);
		return makeTestPromise(72, [62] , 'banner2')
	});
	 
});