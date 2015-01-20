[false, true].forEach(function(responsive) {

	describe('basic: context functionality ' + (responsive ? '(responsive)' : '(async)'), function() {
 
			var contexts = {loaded : []};
			before(function(done) {
				loadPage('/examples/common/basic_context.html?responsive=' + responsive, sizes.LARGE, function(win, doc) {
					win.AdServ.on('debug:context:loaded', function(ctx) {
						contexts.loaded.push(ctx);
						contexts[ctx.name] = ctx;
					});
					
					win.AdServ.on('debug:all:contexts:loaded', function() {
						console.debug("done!!");
						done();
					})
					
				});
			})

			//it('AdServ should exist', function() {
			//	assert.isDefined(win.AdServ, 'AdServ should be a global object');
			//});
			//
			it('should have loaded all 4 contexts', function() {
				assert.equal(contexts.loaded.length, 4, 'expected 4 contexts');
			});


			it('should have loaded the global context', function() {
				var context = contexts['_GLOBAL_'];
				assert.isDefined(context, 'expected _GLOBAL_ to exists');
				assert.deepEqual(context.ids, [10, 21], 'expected _GLOBAL_ have loaded its adspaces');
			});
			it('should have loaded the group1 context', function() {
				var context = contexts['group1'];
				assert.isDefined(context, 'expected group1 to exists');
				assert.deepEqual(context.ids, [14, 28], 'expected group1 have loaded its adspaces');
			});
			it('should have loaded the group2 context', function() {
				var context = contexts['group2'];
				assert.isDefined(context, 'expected group2 to exists');
				assert.deepEqual(context.ids, [18, 23], 'expected group2 have loaded its adspaces');
			});

		}); 
});