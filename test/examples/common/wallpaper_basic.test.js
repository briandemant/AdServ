[false, true].forEach(function(responsive) {

	describe('wallpaper: basic functionality ' + (responsive ? '(responsive)' : '(async)'), function() {

		before(function(done) {
			messages = [];
			loadPage('/examples/common/wallpaper_basic.html?responsive=' + responsive, 450, function(win, doc) {
				win.AdServ.on('debug:all:contexts:loaded', function() {
					//console.debug("go test!!");
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


		it('should have a wallpaper', function() {
			var body = $('body', doc) 
			assert.match(body.css('background-image'), /9.jpg/, 'expected an background to be loaded'); 
		});
	});
});
