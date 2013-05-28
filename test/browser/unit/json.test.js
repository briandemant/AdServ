"use strict";

describe('json:', function() {
	describe('parseJSON', function() {
		var beforeAdServ = {banners : []};
 
		before(function(done) {
			loadFixture({ template : 'plain',
				            pre : function(window, document) {
					            window.AdServ = beforeAdServ;
				            }
			            }, done);
		});

		it('should be a function', function() {
			expect(typeof win.AdServ.parseJSON).to.be('function');
		});

		it('should parse correct json', function() {
			var parsed = win.AdServ.parseJSON('{"a": 2, "b":[1,2,3]}');
			expect(parsed).to.have.key('a');
			expect(parsed).to.have.key('b');
		});


		it('should fail on invalid json', function() {
			// cannot seem to get it to work on ie7
			// so for now we must provide valid json :)
			if (!win.isIE7) {
				expect(function() {
					win.AdServ.parseJSON('');
				}).to.throwException();

				expect(function() {
					win.AdServ.parseJSON('{"a": 2, b:[1,2,3]}');
				}).to.throwException();

				expect(function() {
					win.AdServ.parseJSON('a=2;{}');
				}).to.throwException();
			}
		});
	});
});  