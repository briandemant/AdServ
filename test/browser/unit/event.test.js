"use strict";

describe('Event:', function () {
	var beforeAdServ = {banners: []};

	before(function (done) {
		loadFixture({ template: 'plain',
			            pre    : function (window, document) {
				            window.AdServ = beforeAdServ;
			            },
			            post   : function () {
				            __karma__.before(done);
			            }
		            });
	});

	it('should be functions', function () {
		expect(typeof win.AdServ.on).to.be('function');
		expect(typeof win.AdServ.emit).to.be('function');
	});

	it('should have connect emit and on', function (done) {
		win.AdServ.on('blah', function () {
			done();
		})
		win.AdServ.emit('blah');
	});

	it('should trigger handler on every event', function (done) {
		var count = 0;
		win.AdServ.on('event1', function () {
			if (++count == 2) {
				done();
			}
		})
		win.AdServ.emit('event1');
		win.AdServ.emit('event1');
	});

	it('should trigger handler on  event', function (done) {
		var total = 0;
		var count = 0;
		win.AdServ.on('event2', function () {
			++total;
			if (++count == 2 && total == 4) {
				done();
			}
		});

		var count2 = 0;
		win.AdServ.on('event2', function () {
			++total;
			if (++count2 == 2 && total == 4) {
				done();
			}
		});
		win.AdServ.emit('event2');
		win.AdServ.emit('event2');
	});

	it('should not trigger every handler on every event', function () {
		win.AdServ.on('event8', function () {
			expect().fail("event8 should not be triggered")
		});
		win.AdServ.emit('event8x');
	});

	it('should pass on payload to handler', function (done) {
		win.AdServ.on('event3', function (a, b) {
			expect(a).to.be(1);
			expect(b).to.be(noop);
			done();
		});

		win.AdServ.emit('event3', 1, noop);
	});

	it('should bind to window scope', function (done) {
		win.x = 4;
		var ctx = { y: 44};
		var z = 444;
		win.AdServ.on('event4', function () {
			expect(this).to.be(win);
			expect(win.x).to.be(4);
			expect(ctx.y).to.be(44);
			expect(z).to.be(444);
			expect(typeof this.z).to.be('undefined');
			done();
		});

		win.AdServ.emit('event4');
	});


	it('should bind to the provided context', function (done) {
		var ctx = { y: 55};
		win.AdServ.on('event5', function () {
			expect(this).to.be(ctx);
			expect(this.y).to.be(55);
			done();
		}, ctx);

		win.AdServ.emit('event5');
	});

	it('should fire resize event on browser event', function (done) {
		win.AdServ.on('resize', function () {
			//console.log("woot onresize works");  
			done();
		});
		iframe.width = 400;
	});

	it('should fire original resize event', function (done) {
		waitFor(function () {
			return win.resizeFired;
		}, done);
	});
	
// how to test .. load is already fired?
//	it('should fire load event on browser event', function (done) {
//		win.AdServ.on('load', function () { 
//			done();
//		});
//	});

	it('should fire original load event', function (done) {
		waitFor(function () {
			return win.onloadFired;
		}, done);
	});
});  