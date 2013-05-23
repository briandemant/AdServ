"use strict";

describe('json:', function () {
	describe('parseJSON', function () {
		var beforeAdServ = {banners: []};

		before(function (done) {
			loadFixture('plain', function (window, document) {
				window.AdServ = beforeAdServ;
			}, function () {
				__karma__.before(done);
			});
		});

		it('should be a function', function () {
			expect(typeof win.AdServ.parseJSON).to.be('function');
		});

		it('should parse correct json', function () { 
			var parsed = win.AdServ.parseJSON('{"a": 2, "b":[1,2,3]}');
			expect(parsed).to.have.key('a');
			expect(parsed).to.have.key('b');
		});
		
		it('should fail on invalid json', function () {
			expect(function () {
				win.AdServ.parseJSON('{"a": 2, b:[1,2,3]}');
			}).to.throwException(); 
			
			expect(function () {
				win.AdServ.parseJSON('a=2;{}');
			}).to.throwException(); 
		});

	});
});  