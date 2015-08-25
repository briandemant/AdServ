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

			assert.isDefined(context, 'expected _GLOBAL_ to exists');
			assert.deepEqual(context.adServingLoad, "expected,i100", 'expected _GLOBAL_ to contain global adServingLoad');
		});

		it('should have correct referrer', function() {
				var iframes = doc.getElementsByTagName('iframe');
				var iframe = iframes[0];
			if (iframe.contentWindow.referer) { // safari does not compute????
				assert.match(iframe.contentWindow.referer, /7357/, "qwe");
				return waitForMessages('referrer', 1, 2500).then(function(messages) {
					//				assert.match(messages[0].referrer, /7357/, "referer should come from original host");
				})
			}
		});

		it('should set the global var in window to true', function() {
			assert.isTrue(win.top.iframeWasHere, 'iframeWasHere should have changed');
		});

		it('should be accessible from global', function() {
			var iframes = doc.getElementsByTagName('iframe');
			assert.equal(iframes.length, 1, 'expected 1 banner to be loaded as iframes');
			var iframe = iframes[0];
			assert.isTrue(iframe.contentWindow.inDapIF, 'inDapIF should be set');
		});
	});
});
 