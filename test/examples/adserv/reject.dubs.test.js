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
		this.timeout(5000);
		return makeTestPromise(72, [62], 'banner1')
	});
	it('should reject 80 and load next', function() {
		this.timeout(5000);
		return makeTestPromise(82, [72, 62], 'banner2')
	});
	it('should reject 90 and load next', function() {
		this.timeout(5000);
		return makeTestPromise(92, [82, 72, 62], 'banner3')
	});
	it('should reject 90 even though its dub of banner3', function() {
		this.timeout(5000);
		return makeTestPromise(92, [82, 72, 62], 'banner4')
	});
});