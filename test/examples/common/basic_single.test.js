[false, true].forEach(function(responsive) {

	describe('basic: single adspace functionality ' + (responsive ? '(responsive)' : '(async)'), function() {

		before(function(done) {
			messages = [];
			loadPage('/examples/common/basic_single.html?responsive=' + responsive, 800, 800, function(win, doc) {
				var countDown = 6;
				win.AdServ.on('debug:all:contexts:loaded', function(list) {
					countDown--;
					console.debug("countDown", countDown);
					if (countDown == 0) {
						console.debug("go test!!", list);
						console.debug(arguments);
						done();
					}
				})
			});
		})

		//it('AdServ should exist', function() {
		//	assert.isDefined(win.AdServ, 'AdServ should be a global object');
		//});

		it('should have loaded all adspaces once', function() {
			[1, 20, 30, 10, 21, 31, 11, 40, 41, 50, 51].forEach(function(adspace, idx) {
				var elem = getBannerElem(idx + 1);
				var info = getBannerInfo(elem);
				assert.equal(info.adspace, adspace, 'expected Adspace:  ' + adspace + ' but got ' + info.adspace);
				assert.equal(info.prev.length, 1, 'expected only one load pr banner space got ' + info.prev.length);
			});
		});


		it('should first to be empty', function() {
			var elem = getBannerElem(1);
			var info = getBannerInfo(elem);
			assert.equal(elem.id, 'banner1');
			assert.isTrue(info.empty, 'banner1 should be empty');
		});


		it('should have added some as iframes', function() {
			var expected = [2, 3, 4, 8, 10, 12];
			return waitForMessages('show_campaign', expected.length, 2500).then(function(messages) {
				var iframes = doc.getElementsByTagName('iframe');
				assert.equal(iframes.length, expected.length, 'expected 6 banners to be loaded as iframes');
				_.each(iframes, function(ifm, i) {
					var elem = ifm.parentElement;
					assert.equal(elem.id, 'banner' + expected[i]);
				})
			})
		});


		it('should have loaded some as iframes', function() {
			console.log("---------------");
			this.timeout(5000);
			var iframes = [
				{banner : 2, expect : "20"}, {banner : 3, expect : "30"}, {banner : 4, expect : "10"},
				{banner : 8, expect : "40"}, {banner : 10, expect : "50"}, {banner : 12, expect : "60"}
			];
			return waitForMessages('show_campaign', iframes.length, 2500).then(function(messages) {
				//console.dir(messages);
				assert.equal(messages.length, iframes.length, iframes.length + " iframes banner should have been loaded");

				iframes.forEach(function(exp) {
					var banner = _.find(messages, function(m) {
						return m.target == 'banner' + exp.banner;
					});
					assert.isDefined(banner, "banner " + exp.banner + " should have loaded an iframe");
					assert.equal(banner.adspace, exp.expect, "banner " + exp.banner + " should have the correct adspace");
				})
			})
		});
		//
		it('should have loaded some images', function() {
			var promises = [];
			[5, 6, 7].forEach(function(id) {
				var imglist = $(getBannerElem(id)).find('a').find('img');
				assert.equal(imglist.length, 1, "banner" + id + " should be an image with link");
				if (imglist[0].naturalWidth) {
					assert.notEqual(imglist[0].naturalWidth, 0, "banner" + id + " should be an loaded");
				} else {
					var promise = Q.Promise(function(resolve, reject, notify) {
						imglist[0].onload = function() {
							assert.isDefined(this.naturalWidth, "banner" + id + " should be an loaded");
							assert.notEqual(this.naturalWidth, 0, "banner" + id + " should have a width");
							resolve();
						}
						setTimeout(function() {
							reject(new Error("banner" + id + " image should be loaded"));
						}, 600);
					})
					promises.push(promise);
				}
			});

			return Q.all(promises);
		});
	});
}); 