[false, true].forEach(function(responsive) {
	
	describe('support dub adspaceid ' + (responsive ? '(responsive)' : '(async)'), function() {
		
		var contexts = {loaded : []};
		before(function(done) {
			loadPage('/examples/common/with_dubs.html?responsive=' + responsive, sizes.LARGE, function(win, doc) {
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
			assert.deepEqual(context.adServingLoad, ",i110,e111", 'expected _GLOBAL_ to get 2 campaigns');
		});
		
		it('should not global adServingLoad to group1 context', function() {
			var context = contexts['group1'];
			assert.isDefined(context, 'expected group1 to exists');
			assert.deepEqual(context.adServingLoad, ",i110", 'expected group1 to get 1 campaign');
		});
		it('should not global adServingLoad to group1 context', function() {
			var promises = []; 
			[1, 2, 3].forEach(function(id) {
				var imglist = $(getBannerElem(id)).find('a').find('img');
				assert.equal(imglist.length, 1, "banner" + id + " should be 1 image with link");
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
 