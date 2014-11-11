describe('basic functionality', function() {
	before(function(done) {
		loadPage('/examples/adserv/basic.html', 800, 800, function(win, doc) {
			win.AdServ.on('debug:all:contexts:loaded', function() {
				console.debug("done!!");
				done();
			}) 
		});
	})

	it('AdServ should exist', function() {
		assert.isDefined(win.AdServ, 'AdServ should be a global object');
	});

	it('should have loaded all adspaces', function() {
		[1, 20, 30, 10, 21, 31, 11, 40, 41, 50, 51].forEach(function(adspace, idx) {
			var elem = getBannerElem(idx + 1);
			var info = getBannerInfo(elem);
			assert.notMatch(elem.innerHTML, /failed/, info.id + ' should have changed');
			assert.equal(info.adspace, adspace, 'expected Adspace:  ' + adspace + ' but got ' + info.adspace);
		});
	});


	it('should first to be empty', function() {
		var elem = getBannerElem(1);
		var info = getBannerInfo(elem);
		assert.equal(elem.id, 'banner1');
		assert.isTrue(info.empty, 'banner1 should be empty');
	});


	it('should have loaded some as iframes', function() {
		var expected = [2, 3, 4, 8, 10, 12];
		var iframes = doc.getElementsByTagName('iframe');
		assert.equal(iframes.length, expected.length, 'expected 5 banners to be loaded as iframes');
		_.each(iframes, function(ifm, i) {
			var elem = ifm.parentElement;
			assert.equal(elem.id, 'banner' + expected[i]);
		})
	});
  
	
	it('should have loaded some images', function() {
		assert.equal($(getBannerIframeDoc(2)).find('a').find('img').length, 1, "banner2 should be an image with link in an iframe");
		assert.equal($(getBannerIframeDoc(3)).find('a').find('img').length, 1, "banner2 should be an image with link in an iframe");
		assert.equal($(getBannerIframeDoc(4)).find('a').find('img').length, 1, "banner2 should be an image with link in an iframe");

		assert.equal($(getBannerElem(5)).find('a').find('img').length, 1, "banner4 should be an image");
		assert.equal($(getBannerElem(6)).find('a').find('img').length, 1, "banner4 should be an image");
		assert.equal($(getBannerElem(7)).find('a').find('img').length, 1, "banner4 should be an image");
	});
});