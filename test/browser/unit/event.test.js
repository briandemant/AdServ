// 
//describe('scope', function () {
//	describe('AdServ', function () {
//		it('should be not be defined unless loaded', function () {
//			assert.equal(typeof AdServ, 'undefined' );  
//		});
//	}); 
//}); 
 
describe('Event:', function () {
	describe('AdServ', function () {

		beforeEach(function () {
			loadFixture('plain');
		}); 

		afterEach(function () {
			delete this['AdServ']
		});
 
		it('should be defined', function () {
			assert.notEqual(typeof AdServ, 'undefined');
			assert.equal(typeof AdServ.banners, 'undefined');
		}); 
	});
});  