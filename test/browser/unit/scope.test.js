"use strict";

describe('Scope:', function() {

	describe('AdServ:not_loaded', function() {
		var pre = {AdServ : null};
		var post = {AdServ : null};


		before(function(done) {
			loadFixture({ template : 'plain',
				            pre : function(window, document) {
					            pre.AdServ = window.AdServ;
				            },
				            post : function(window, document) {
					            post.AdServ = window.AdServ;
					            __karma__.before(done);
				            }
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
		var pre = {AdServ : {testProperty : []}};
		var post = {AdServ : null};

		before(function(done) {
			loadFixture({ template : 'plain',
				            pre : function(window, document) {
					            window.AdServ = pre.AdServ;
				            },
				            post : function(window, document) {
					            post.AdServ = window.AdServ;
					            __karma__.before(done);
				            }
			            });

		});

		it('should be not be redefined when loaded', function() {
			expect(win.AdServ).to.be(pre.AdServ);
			expect(typeof win.AdServ.testProperty).to.not.be('undefined');
			expect(win.AdServ.testProperty).to.be(pre.AdServ.testProperty);
		});

		it('should add methods to original object', function() {
			expect(typeof win.AdServ.$).to.not.be('undefined');
		});
	});

});  