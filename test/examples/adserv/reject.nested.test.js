describe('reject nesting functionality', function() {

	before(function(done) {
		loadPage('/examples/adserv/reject.nested.html', 800, 800, function(win, doc) {
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

	function makeTestPromise(adspace, last, divIdx, expectedLayers) {
		var max = 200;
		return new Q.Promise(function(resolve, reject) {
			function abort() {
				clearInterval(int);
				reject(new Error('timeout'));
			}

			var int = setInterval(function() {
				messages.forEach(function(message) {
					if (--max == 0) {
						abort();
					}
					if (message.next == last) {
						var info = getBannerInfo(divIdx);
						if (info.prev.length == expectedLayers) {
							clearInterval(int);
							//console.debug("final",info);

							if (info.adspace == last) {
								resolve();
							} else {
								reject(new Error('expected Adspace:  ' + last + ' but got ' + info.adspace));
							}
						}
					}
				});
			}, 10)
		});
	}

	it('should reject 80 and load next', function() {
		this.timeout(4000);
		return makeTestPromise(80, 1, 1, 3)
	});
	it('should reject 81 and load next', function() {

		return makeTestPromise(81, 11, 2, 3)
	});
	it('should reject 82 and load next', function() {
		return makeTestPromise(82, 22, 3, 3)
	});
	it('should reject 83 and load next', function() {
		return makeTestPromise(83, 33, 4, 3)
	});
	it('should reject 84 and load next', function() {
		return makeTestPromise(84, 44, 5, 3)
	});
	it('should reject 83 and load next', function() {
		return makeTestPromise(85, 55, 6, 3)
	});
	it('should reject 84 and load next', function() {
		return makeTestPromise(86, 66, 7, 3)
	});
});