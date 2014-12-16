describe('wallpaper target functionality', function() {
	before(function(done) {
		messages = [];
		loadPage('/examples/adserv/wallpaper.target.html', 450, 300, function(win, doc) {
			win.AdServ.on('debug:all:contexts:loaded', function() {
				console.debug("go test!!");
				done();
			})
		});
	})

	it('AdServ should exist', function() {
		assert.isDefined(win.AdServ, 'AdServ should be a global object');
	});


	it('should have added an image', function() {
		var imglist = $(getBannerElem(1)).find('a').find('img');
		assert.equal(imglist.length, 1, 'expected an image banner to be loaded');
	});


	it('should have a wallpaper', function() {
		var body = $('#wallpaper', doc)

		assert.match(body.css('background-image'), /2.jpg/, 'expected an background to be loaded');

	});
	it('should NOT have a wallpaper on body', function() {
		var body = $('body', doc) 
		assert.equal(body.css('background-image'), 'none', 'expected an background to be loaded');

	});


})
