/*!
 * Testing the test setup
 */
describe('TestSetup:', function () {
	describe('plain:', function () {
		beforeEach(function (done) {
			loadFixture('plain', function () {
				__karma__.beforeEach(done);
			});
		});

		it('the content should be finished loading script executed', function (done) {
			nextTick(function () {
				assert.equal(doc.getElementById('dynamic').innerHTML, 'changed');
				done();
			});
		});

		it('the content update on resize', function (done) {
			assert.equal(doc.body.clientWidth, 1008);
			iframe.width = 400;
			assert.equal(doc.body.clientWidth, 384);
			nextTick(function () {
				assert.equal(doc.getElementById('dynamic').innerHTML, '384px');
				done();
			});
		});
	});

	describe('default:', function () {
		beforeEach(function (done) {
			loadFixture('default', function () {
				__karma__.beforeEach(done);
			});
		});

		it('win should point to iframe window', function () {
			assert.equal(typeof win, 'object');
			assert.equal(typeof win.top, 'object');
			assert.equal(typeof win.location, 'object');
			assert(win.location.href.match(/default.html/));
			assert.equal(win.document.nodeType, Node.DOCUMENT_NODE);
//		assert.strictEqual(iframe.contentWindow, win);
		});

		it('doc should point to iframe document', function () {
			assert.equal(doc.nodeName, '#document');
			assert.equal(typeof doc, 'object');
			assert.equal(doc.nodeType, Node.DOCUMENT_NODE);
//		assert.strictEqual(iframe.contentDocument, doc);
		});

	});
});   