describe('responsive: common functionality', function() {
	before(function(done) {
		messages = [];
		loadPage('/examples/responsive/basic.html?responsive=true', sizes.LARGE, function(win, doc) {
			win.AdServ.on('debug:all:contexts:loaded', function() {
				done();
			})
		});
	})

	function assertAdspaceIsLoaded(index, adspace) {
		//var elem = getBannerElem(index);
		//var info = getBannerInfo(elem);
		//assert.equal(info.adspace, adspace, 'expected Adspace:  ' + adspace + ' but got ' + info.adspace);
		//assert.equal(info.contentNodes.length, 1, 'expected only one load pr banner space got ' + info.prev.length);
	}

	function assertAdspaceIsNotLoaded(index, adspace) {
		//var elem = getBannerElem(index);
		//var info = getBannerInfo(elem);
		//assert.equal(info.adspace, adspace, 'expected Adspace:  ' + adspace + ' but got ' + info.adspace);
		//assert.equal(info.contentNodes.length, 0, 'expected only zero load pr banner space got ' + info.prev.length);
	}

	it('Only banner destined for LARGE should be loaded', function(done) {
		resizePage(sizes.LARGE, function(unrendered) {
			assert.equal(unrendered, 6, 'expected ' + unrendered + ' unrendered adspaces');
			assertAdspaceIsLoaded(1, 11);

			// display
			assertAdspaceIsNotLoaded(2, 13);
			assertAdspaceIsNotLoaded(3, 15);
			assertAdspaceIsLoaded(4, 17);
			// visibility
			assertAdspaceIsNotLoaded(5, 23);
			assertAdspaceIsNotLoaded(6, 25);
			assertAdspaceIsLoaded(7, 27);
			// opacity
			assertAdspaceIsNotLoaded(8, 33);
			assertAdspaceIsNotLoaded(9, 35);
			assertAdspaceIsLoaded(10, 37);
		}, done);
	}); 
	
	it('Only banner destined for MEDIUM should be loaded', function(done) {
		resizePage(sizes.MEDIUM, function(unrendered) {
			assert.equal(unrendered, 3, 'expected ' + unrendered + ' unrendered adspaces');
			assertAdspaceIsLoaded(1, 11);

			// display
			assertAdspaceIsNotLoaded(2, 13);
			assertAdspaceIsLoaded(3, 15);
			assertAdspaceIsLoaded(4, 17);
			//// visibility
			assertAdspaceIsNotLoaded(5, 23);
			assertAdspaceIsLoaded(6, 25);
			assertAdspaceIsLoaded(7, 27);
			//// opacity
			assertAdspaceIsNotLoaded(8, 33);
			assertAdspaceIsLoaded(9, 35);
			assertAdspaceIsLoaded(10, 37);
		}, done)
	});

	it('now all banners should be loaded (SMALL)', function(done) {
		resizePage(sizes.SMALL, function(unrendered) {
			assert.equal(unrendered, 0, 'expected ' + unrendered + ' unrendered adspaces');
			assertAdspaceIsLoaded(1, 11);

			// display
			assertAdspaceIsLoaded(2, 13);
			assertAdspaceIsLoaded(3, 15);
			assertAdspaceIsLoaded(4, 17);
			//// visibility
			assertAdspaceIsLoaded(5, 23);
			assertAdspaceIsLoaded(6, 25);
			assertAdspaceIsLoaded(7, 27);
			//// opacity
			assertAdspaceIsLoaded(8, 33);
			assertAdspaceIsLoaded(9, 35);
			assertAdspaceIsLoaded(10, 37);
		}, done)
	});
})
