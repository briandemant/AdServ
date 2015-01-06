describe('skin/body: without background', function() {
	var contexts = {loaded : []};
	before(function(done) {
		loadPage('/examples/adserv/skin_without_background.html', 800, 800, function(win, doc) {
			win.AdServ.on('debug:context:loaded', function(ctx) {
				console.debug(ctx);
				contexts.loaded.push(ctx);
				contexts[ctx.name] = ctx;
			});
  
			win.AdServ.on('debug:all:contexts:loaded', function() { 
					console.debug("done!!");
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
		assert.deepEqual(context.adServingLoad, "expected,i210", 'expected _GLOBAL_ to contain global adServingLoad');
	});
	
	it('should not add group1 context', function() {
		var context = contexts['group1'];
		assert.isUndefined(context, 'expected group1 to exists'); 
	});

});
 