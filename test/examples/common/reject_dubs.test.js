[false, true].forEach(function(responsive) {

	describe('reject: dub functionality ' + (responsive ? '(responsive)' : '(async)'), function() {

		before(function(done) {
			this.timeout(5000);
			loadPage('/examples/common/reject_dubs.html?responsive=' + responsive, sizes.LARGE, function(win, doc) {
				var contexts = 8;
				if (!win.AdServ) { throw "AdServ is not defined" }
				win.AdServ.on('debug:all:contexts:loaded', function() {
					if (--contexts == 0) {
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
}); 