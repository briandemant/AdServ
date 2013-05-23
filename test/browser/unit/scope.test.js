"use strict";

describe('Scope:', function () {
	describe('AdServ:not_loaded', function () {
		var beforeAdServ = null;
		var afterAdServ = null;
		before(function (done) {
			loadFixture('plain', function (window, document) {
				beforeAdServ = window.AdServ;
			}, function () {
				afterAdServ = win.AdServ;
				__karma__.before(done);
			});
		});

		it('should not be defined', function () {
			expect(typeof beforeAdServ).to.be('undefined');
		});

		it('should be defined', function () {
			expect(typeof afterAdServ).to.be('object');
		});

		it('should onlu call onload callback once', function () {
			expect(win.scriptLoadCount).to.be(1);
		});
	});

	describe('AdServ:loaded', function () {
		var beforeAdServ = {banners: []};
		var afterAdServ = null;
		before(function (done) {
			loadFixture('plain', function (window, document) {
				window.AdServ = beforeAdServ;
			}, function () {
				afterAdServ = win.AdServ;
				__karma__.before(done);
			});
		});

		it('should be not be redefined when loaded', function () {
			expect(win.AdServ).to.be(beforeAdServ);
			expect(typeof win.AdServ.banners).to.not.be('undefined');
			expect(win.AdServ.banners).to.be(beforeAdServ.banners);
		});
		
		it('should add methods to original object', function () {
			expect(typeof win.AdServ.on).to.not.be('undefined');
			expect(typeof win.AdServ.emit).to.not.be('undefined');
		});
	});
});  