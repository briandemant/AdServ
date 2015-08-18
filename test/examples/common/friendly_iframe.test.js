[false, true].forEach(function(responsive) {

	describe('friendly_iframe: ' + (responsive ? '(responsive)' : '(async)'), function() {

		var contexts = {loaded : []};
		before(function(done) {
			loadPage('/examples/common/friendly_iframe.html?responsive=' + responsive, sizes.LARGE, function(win, doc) {
				if (!win.AdServ) { throw "AdServ is not defined" }
				win.AdServ.on('debug:context:loaded', function(ctx) {
					contexts.loaded.push(ctx);
					contexts[ctx.name] = ctx;
				});

				win.AdServ.on('debug:all:contexts:loaded', function() {
					done();
				})
			});
		})

		it('AdServ should exist', function() {
			assert.isDefined(win.AdServ, 'AdServ should be a global object');
		});

		it('should add global adServingLoad to global context', function() {
			var context = contexts['_GLOBAL_'];
			console.log(context);
			console.dir(context);

			assert.isDefined(context, 'expected _GLOBAL_ to exists');
			assert.deepEqual(context.adServingLoad, "expected,i100", 'expected _GLOBAL_ to contain global adServingLoad');
		});

		it('should set the global var in window to true', function() {
			assert.isTrue(win.top.iframeWasHere, 'iframeWasHere should have changed');
		});
		it('should be accessible from global', function() {
			var iframes = doc.getElementsByTagName('iframe');
			assert.equal(iframes.length, 1, 'expected 1 banner to be loaded as iframes');
			var iframe = iframes[0];
			assert.isTrue(iframe.contentWindow.inDapIF, 'inDapIF should be present');
		});
	});
});
 