// 
//describe('scope', function () {
//	describe('AdServ', function () {
//		it('should be not be defined unless loaded', function () {
//			assert.equal(typeof AdServ, 'undefined' );  
//		});
//	});
//});


describe('scope', function () {
	describe('AdServ', function () {

		it('should be defined', function () {
			assert.notEqual(typeof AdServ, 'undefined');
			assert.equal(typeof AdServ.banners, 'undefined');
		});

		it('should be not be defined unless loaded', function (done) {
			var myAdServ = {banners: []};
			reload(myAdServ, function () {
				assert.notEqual(typeof AdServ, 'undefined');
				assert.strictEqual(AdServ, myAdServ);
				assert.notEqual(typeof AdServ.banners, 'undefined');
				done();
			});
		});
	});
});  