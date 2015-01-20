[false, true].forEach(function(responsive) {

	describe('reject: basic functionality ' + (responsive ? '(responsive)' : '(async)'), function() {
		before(function(done) {
			loadPage('/examples/common/reject_basic.html?responsive=' + responsive, sizes.LARGE, function(win, doc) {
				var first = true;
				win.AdServ.on('debug:all:contexts:loaded', function() {
					if (first) {
						first = false;
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
			return makeTestPromise(72, [62], 'banner2')
		});
	});
}); 
	