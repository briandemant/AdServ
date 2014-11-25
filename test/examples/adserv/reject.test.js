describe('reject functionality', function() {

	before(function(done) {
		loadPage('/examples/adserv/reject.html', 800, 800, function(win, doc) {
			var contexts = 8;
			win.AdServ.on('debug:all:contexts:loaded', function() {
				if (--contexts == 7) {
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
				reject(new Error('timeout of test on ' + adspace + ' to ' + last));
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

	it('should reject 70 and load next', function() {
		this.timeout(3000);
		return makeTestPromise(70, 1, 1, 2)
	});
	it('should reject 71 and load next', function() {
		return makeTestPromise(71, 11, 2, 2)
	});
	it('should reject 72 and load next', function() {
		return makeTestPromise(72, 22, 3, 2)
	});
	it('should reject 73 and load next', function() {
		return makeTestPromise(73, 33, 4, 2)
	});
	it('should reject 74 and load next', function() {
		return makeTestPromise(74, 44, 5, 2)
	});
	it('should reject 75 and load next', function() {
		return makeTestPromise(75, 55, 6, 2)
	});
	it('should reject 76 and load next', function() {
		return makeTestPromise(76, 66, 7, 2)
	});
});