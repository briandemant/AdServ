describe('reject with dub functionality', function() {

	before(function(done) {
		loadPage('/examples/adserv/reject.dubs.html', 800, 800, function(win, doc) {
			var contexts = 8;
			win.AdServ.on('debug:all:contexts:loaded', function() {
				if (--contexts == 7) {
					console.debug("go test!!");
					done();
				}
			})
		});
	})
 
	it('should reject 70 and load next', function() {
		this.timeout(3000);
		return makeTestPromise(90, 1, 1, 2)
	});
	//it('should reject 71 and load next', function() {
	//	return makeTestPromise(91, 11, 2, 2)
	//});
	//it('should reject 72 and load next', function() {
	//	return makeTestPromise(72, 22, 3, 2)
	//});
	//it('should reject 73 and load next', function() {
	//	return makeTestPromise(73, 33, 4, 2)
	//});
	//it('should reject 74 and load next', function() {
	//	return makeTestPromise(74, 44, 5, 2)
	//});
	//it('should reject 75 and load next', function() {
	//	return makeTestPromise(75, 55, 6, 2)
	//});
	//it('should reject 76 and load next', function() {
	//	return makeTestPromise(76, 66, 7, 2)
	//});
});