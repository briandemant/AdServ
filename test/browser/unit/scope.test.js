"use strict";

describe('Scope:', function() {

	describe('AdServ:not_loaded', function() {
		var pre = {AdServ : null};
		var post = {AdServ : null};

		before(function(done) {
			loadFixture('plain', function(window, document) {
				pre.AdServ = window.AdServ;
			}, function(window, document) {
				post.AdServ = window.AdServ;
				__karma__.before(done);
			});
		});

		it('should not be defined', function() {
			expect(typeof pre.AdServ).to.be('undefined');
		});

		it('should be defined', function() {
			expect(typeof post.AdServ).to.be('object');
		});

		it('should onlu call onload callback once', function() {
			expect(win.scriptLoadCount).to.be(1);
		});
	});

	describe('AdServ:loaded', function() {
		var pre = {AdServ : {banners : []}};
		var post = {AdServ : null};
		before(function(done) {
			loadFixture('plain', function(window, document) {
				window.AdServ = pre.AdServ;
			}, function(window, document) {
				post.AdServ = window.AdServ;
				__karma__.before(done);
			});
		});

		it('should be not be redefined when loaded', function() {
			expect(win.AdServ).to.be(pre.AdServ);
			expect(typeof win.AdServ.banners).to.not.be('undefined');
			expect(win.AdServ.banners).to.be(pre.AdServ.banners);
		});

		it('should add methods to original object', function() {
			expect(typeof win.AdServ.adspaces).to.not.be('undefined');
//			expect(typeof win.AdServ.emit).to.not.be('undefined');
		});
	});

});  