[false, true].forEach(function(responsive) {
	describe('basic: empty load ' + (responsive ? '(responsive)' : '(async)'), function() {
		before(function(done) {
			loadPage('/examples/common/basic_empty.html?responsive=' + responsive, sizes.LARGE, function(win, doc) {
				if (!win.AdServ) { throw "AdServ is not defined" }
				win.AdServ.on('debug:all:contexts:loaded', function() {
					done();
				})
			});
		})

		it('should first to be empty', function() {
			var elem = getBannerElem(1);
			var info = getBannerInfo(elem);
			assert.equal(elem.id, 'banner1');
			assert.isTrue(info.empty, 'banner1 should be empty');
			assert.equal(info.adspace, 1, 'banner1 should not be adspace 2');
		});
		it('should second to be empty', function() {
			var elem = getBannerElem(2);
			var info = getBannerInfo(elem);
			assert.equal(elem.id, 'banner2');
			assert.isTrue(info.empty, 'banner1 should be empty');
			assert.notMatch(elem.innerHTML, /failed/, 'banner3 should not be loaded');
			assert.equal(info.adspace, 4, 'banner2 should not be adspace 4');
		});
		it('should third to not be loaded', function() {
			var elem = getBannerElem(3);
			var info = getBannerInfo(elem);
			assert.equal(elem.id, 'banner3');
			 
			assert.match(elem.innerHTML, /ignored/, 'banner3 should not be loaded');
			assert.isUndefined(info.adspace, 'banner3 should not be loaded');
		});

	});

});
