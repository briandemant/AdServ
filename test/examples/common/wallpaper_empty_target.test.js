[false, true].forEach(function(responsive) {

	describe('wallpaper: empty target functionality ' + (responsive ? '(responsive)' : '(async)'), function() {

		before(function(done) {
			messages = [];
			loadPage('/examples/common/wallpaper_empty_target.html?responsive=' + responsive, 450, function(win, doc) {
				win.AdServ.on('debug:all:contexts:loaded', function() {
					console.debug("go test!!");
					done();
				})
			});
		})

		//it('AdServ should exist', function() {
		//	assert.isDefined(win.AdServ, 'AdServ should be a global object');
		//});


		it('should have added an image', function() {
			var imglist = $(getBannerElem(1)).find('a').find('img');
			assert.equal(imglist.length, 1, 'expected an image banner to be loaded');
		});


		it('should NOT have a wallpaper in target', function() {
			var body = $('#wallpaper', doc)
			assert.equal(body.css('background-image'), 'none', 'expected no background to be loaded');

		});
		it('should NOT have a wallpaper on body', function() {
			var body = $('body', doc)
			assert.equal(body.css('background-image'), 'none', 'expected no background to be loaded');

		});
	});
});