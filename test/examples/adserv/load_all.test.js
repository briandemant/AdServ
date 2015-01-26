describe('adserv: load functionality', function() {
	before(function(done) {
		loadPage('/examples/adserv/load_all.html', sizes.LARGE, function(win, doc) {
			win.AdServ.on('debug:all:contexts:loaded', function() {
				done();
			})
		});
	})

	function assertAdspaceIsLoaded(index, adspace) {
		var elem = getBannerElem(index);
		var info = getBannerInfo(elem);
		assert.equal(info.adspace, adspace, 'expected Adspace: ' + adspace + ' but got ' + info.adspace);
		assert.equal(info.contentNodes.length, 1, 'expected Adspace: ' + adspace + ' only one load pr banner space got ');
	}

	function assertAdspaceIsNotLoaded(index, adspace) {
		var elem = getBannerElem(index);
		var info = getBannerInfo(elem);
		assert.equal(info.adspace, adspace, 'expected Adspace: ' + adspace + ' but got ' + info.adspace);
		assert.equal(info.contentNodes.length, 0, 'expected Adspace: ' + adspace + ' no load pr banner space got ' + info.prev.length);
	}

	it('all (even hidden) banners should be loaded', function() {
		assertAdspaceIsLoaded(1, 11); 
		// display
		assertAdspaceIsLoaded(2, 13);
		assertAdspaceIsLoaded(3, 15);
		assertAdspaceIsLoaded(4, 17);
		// visibility
		assertAdspaceIsLoaded(5, 23);
		assertAdspaceIsLoaded(6, 25);
		assertAdspaceIsLoaded(7, 27);
		// opacity
		assertAdspaceIsLoaded(8, 33);
		assertAdspaceIsLoaded(9, 35);
		assertAdspaceIsLoaded(10, 37);
	});

})
