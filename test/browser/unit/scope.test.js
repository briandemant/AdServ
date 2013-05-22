// 
//describe('scope', function () {
//	describe('AdServ', function () {
//		it('should be not be defined unless loaded', function () {
//			assert.equal(typeof AdServ, 'undefined' );  
//		});
//	}); 
//}); 

describe('Scope:', function () {
	describe('AdServ:not_loaded', function () {

		it('should not be defined', function () {
			console.log(1);
			assert.equal(typeof AdServ, 'undefined');
		});

	});

	describe('AdServ:loaded', function () { 
		beforeEach(function () {
			loadFixture('plain');
		});

		it('should be defined when loaded', function () {
			console.log(2);
			assert.notEqual(typeof AdServ, 'undefined');
		}); 
		
//		it('should be not be defined unless loaded', function () {
//			var myAdServ = {banners: []};
//			AdServ = myAdServ;
//
//			loadFixture('plain');
//			assert.notEqual(typeof AdServ, 'undefined');
//			assert.strictEqual(AdServ, myAdServ);
//			assert.notEqual(typeof AdServ.banners, 'undefined');
//		});
	});
});  