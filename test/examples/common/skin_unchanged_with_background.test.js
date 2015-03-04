[false, true].forEach(function(responsive) {

	describe('skin/body: unchanged with background ' + (responsive ? '(responsive)' : '(async)'), function() {

		var contexts = {loaded : []};
		before(function(done) {
			loadPage('/examples/common/skin_unchanged_with_background.html?responsive=' + responsive, sizes.LARGE, function(win, doc) {
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

		//it('AdServ should exist', function() {
		//	assert.isDefined(win.AdServ, 'AdServ should be a global object');
		//});

		it('should add global adServingLoad to global context', function() {
			var context = contexts['_GLOBAL_'];
			assert.isDefined(context, 'expected _GLOBAL_ to exists');
			assert.deepEqual(context.adServingLoad, "expected,i100,e211", 'expected _GLOBAL_ to contain global adServingLoad');
		});

		it('should not global adServingLoad to group1 context', function() {
			var context = contexts['group1'];
			assert.isDefined(context, 'expected group1 to exists');
			assert.deepEqual(context.adServingLoad, ",i140", 'expected group1 not contain global adServingLoad');
		});

	});
}); 