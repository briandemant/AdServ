"use strict";

describe('dom:', function() {
	describe('getElem', function() {
		before(function(done) {
			loadFixture( 'plain' , done);
		});

		it('should be a function', function() {
			expect(typeof win.AdServ.$).to.be('function');
		});


		// problem testing exceptions in ie 7-9
		if (!browser.isIE7 && !browser.isIE8 && !browser.isIE9) {
			it('should die if not a string or element', function() {

				expect(function() {
					win.AdServ.$({})
				}).to.throwException();
				expect(function() {
					win.AdServ.$(3)
				}).to.throwException();
			});
		}

		it('should return null if none found', function() {
			var found = win.AdServ.$('#non_found');
			expect(found).to.be(null);
		});

		it('should be able to find the elem by id', function() {
			var found = win.AdServ.$('#group1');
			expect(typeof found).to.be('object');
			expect(found.innerHTML).to.match(/Gruppe 1/);
		});

		it('should be able read the used css properties', function() {
			var elem = win.AdServ.$('#with-style');
			if (browser.isIE7 || browser.isIE8) {
				expect(win.AdServ.css(elem, 'visibility')).to.be('inherit');
			} else {
				expect(win.AdServ.css(elem, 'visibility')).to.be('visible');
			}
			expect(win.AdServ.css(elem, 'display')).to.be('none');
			expect(win.AdServ.css(elem, 'opacity')).to.within(0.69, 0.71);
			elem = win.AdServ.$('#without-style');
			expect(win.AdServ.css(elem, 'visibility')).to.be('hidden');
			expect(win.AdServ.css(elem, 'display')).to.be('block');
			expect(win.AdServ.css(elem, 'opacity')).to.be('0.5');
		});

		it('should detect hidden items', function() {
			expect(win.AdServ.css('#hidden', 'visibility')).to.be('hidden');
			expect(win.AdServ.isVisible('#hidden')).to.be(false);
			
			expect(win.AdServ.css('#opaque', 'opacity')).to.be('0');
			expect(win.AdServ.isVisible('#opaque')).to.be(false);
			
			expect(win.AdServ.css('#not-displayed', 'display')).to.be('none');
			expect(win.AdServ.isVisible('#not-displayed')).to.be(false);
		});

		it('should detect visible items', function() {
			expect(win.AdServ.isVisible('#group1')).to.be(true);
		});
		
		it('should detect hidden parent items', function() { 
			expect(win.AdServ.isVisible('#parent-hidden')).to.be(false); 
			expect(win.AdServ.isVisible('#parent-opaque')).to.be(false); 
			expect(win.AdServ.isVisible('#parent-not-displayed')).to.be(false);
		});

		it('should detect visible parent items', function() {
			expect(win.AdServ.isVisible('#group1-child')).to.be(true);
		});
	});
}); 