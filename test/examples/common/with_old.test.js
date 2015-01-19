[false, true].forEach(function(responsive) {
	
	describe('combine with old ' + (responsive ? '(responsive)' : '(async)'), function() {
		
		var contexts = {loaded : []};
		before(function(done) {
			loadPage('/examples/common/with_old.html?responsive=' + responsive, 800, 800, function(win, doc) {
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
		
		
		it('should add global adServingLoad to global context', function() {
			var context = contexts['_GLOBAL_'];
			assert.isDefined(context, 'expected _GLOBAL_ to exists');
			assert.deepEqual(context.adServingLoad, "expected,i100,e211", 'expected _GLOBAL_ to contain global adServingLoad');
		});
		
		it('should use group1 context (adServingLoad,keyword)', function() {
			var context = contexts['group1'];
			assert.isDefined(context, 'expected group1 to exists');
			assert.deepEqual(context.adServingLoad, ",i1140", 'expected group1 not contain global adServingLoad and use other keyword');
		});
		
	});
});
 