[false, true].forEach(function(responsive) {
	
	describe('reject: nesting functionality ' + (responsive ? '(responsive)' : '(async)'), function() {
		
		before(function(done) {
			this.timeout(5000);
			loadPage('/examples/common/reject_nested.html?responsive=' + responsive, sizes.LARGE, function(win, doc) { 
				var contexts = 8;
				win.AdServ.on('debug:all:contexts:loaded', function() {
					if (--contexts == 0) {
						done();
					} 
				})
			});
		})
		
		it('should reject 80 and load next x 2 (empty)', function() {
			this.timeout(5000);
			return makeTestPromise(80, [70, 1], 'banner1')
		});
		
		it('should reject 82 and load next x 2', function() {
			this.timeout(5000);
			return makeTestPromise(82, [72, 62], 'banner2')
		});
		
		it('should reject 94 and load next x 3', function() {
			this.timeout(5000);
			return makeTestPromise(94, [84, 74, 64], 'banner3')
		});
	});
});
	