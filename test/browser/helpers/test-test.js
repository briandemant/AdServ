/*!
 * Testing the test setup
 */
//console.log("a");
describe('TestSetup:', function () {
	before(function (done) {
		printTestname(this);
		loadFixture('test_setup', done);  
	});


	it('unaffected by shim', function () {
		printTestname(this);
		expect(win.isShimApplied).to.be(false);
	});
	
	it('browser detected', function () {
		printTestname(this);
//		console.log(window.browser);
		expect(window.browser).to.be.an('object');
	});

	it('expect cheatsheet', function () {
		printTestname(this);
		expect(typeof Array.isArray).to.be('function');
		expect(win.isShimApplied).to.be(false);

//		 ok: asserts that the value is truthy or not 
		expect(1).to.be.ok();
		expect(true).to.be.ok();
		expect({}).to.be.ok();
		expect(0).to.not.be.ok();

		// be / equal: asserts === equality 
		expect(1).to.be(1);
		expect(NaN).not.to.equal(NaN);
		expect(1).not.to.be(true)
		expect('1').to.not.be(1);

		// eql: asserts loose equality that works with objects 
		expect({ a: 'b' }).to.eql({ a: 'b' });
		expect(1).to.eql('1');

		// typeof with optional `array`
		expect(5).to.be.a('number');
		expect([]).to.be.an('array');  // works
		expect([]).to.be.an('object'); // works too, since it uses `typeof`

		// constructors 
		expect([]).to.be.an(Array);
		// expect(tobi).to.be.a(Ferret);
		// expect(person).to.be.a(Mammal);

		//match: asserts String regular expression match 
		var version = '1.2.33';
		expect(version).to.match(/[0-9]+\.[0-9]+\.[0-9]+/);

		// contain: asserts indexOf for an array or string 
		expect([1, 2]).to.contain(1);
		expect('hello world').to.contain('world');

		// length: asserts array .length 
		expect([]).to.have.length(0);
		expect([1, 2, 3]).to.have.length(3);

		// empty: asserts that an array is empty or not 
		expect([]).to.be.empty();
		expect({}).to.be.empty();
		expect({ length: 0, duck: 'typing' }).to.be.empty();
		expect({ my: 'object' }).to.not.be.empty();
		expect([1, 2, 3]).to.not.be.empty();

		// property: asserts presence of an own property (and value optionally)
		expect(window).to.have.property('expect');
		expect(window).to.have.property('expect', expect);
		expect({a: 'b'}).to.have.property('a');

		// key/**keys**: asserts the presence of a key. Supports the only modifier 
		expect({ a: 'b' }).to.have.key('a');
		expect({ a: 'b', c: 'd' }).to.only.have.keys('a', 'c');
		expect({ a: 'b', c: 'd' }).to.only.have.keys(['a', 'c']);
		// expect({ a: 'b', c: 'd' }).to.not.only.have.key('a');

		// throwException/**throwError**: asserts that the Function throws or not when called 
		var fn = function () { throw new SyntaxError('something that matches the exception message'); }
		expect(fn).to.throwError(); // synonym of throwException
		expect(fn).to.throwException(function (e) { // get the exception object
			expect(e).to.be.a(SyntaxError);
		});
		expect(fn).to.throwException(/matches the exception message/);
		expect(function () {}).to.not.throwException();

		// within: asserts a number within a range 
		expect(1).to.be.within(0, Infinity);

		// greaterThan/**above**: asserts > 
		expect(3).to.be.above(0);
		expect(5).to.be.greaterThan(3);

		// lessThan/**below**: asserts < 
		expect(0).to.be.below(3);
		expect(1).to.be.lessThan(3);

		// fail: explicitly forces failure. 
//		 expect().fail()
//		 expect().fail("Custom failure message");
	});


	it('the content should be finished loading and script executed', function (done) {
		printTestname(this);
		waitFor(function () {
			return doc.getElementById('dynamic').innerHTML ==  'Dynamic content';
		}, done);
	});

	it('the content update on resize', function (done) {
		printTestname(this);  
		expect(doc.body.clientWidth).to.be.within(1000, 1024);
		iframe.width = 400;
		expect(doc.body.clientWidth).to.within(350, 400);
//		console.log("f");
		waitFor(function () {
			var elem = doc.getElementById('dynamic');
			return elem && elem.innerHTML == doc.body.clientWidth + 'px';
		}, done); 
	});

	it('win should point to iframe window', function () {
		printTestname(this);
		expect(typeof win).to.be('object');
		expect(typeof win.top).to.be('object');
		expect(typeof win.location).to.be('object');
		expect(win.location.href).to.match(/test_setup.html/);
		expect(win.document.nodeType).to.be(9); // Node.DOCUMENT_NODE 
	});

	it('doc should point to iframe document', function () {
		printTestname(this);
		expect(doc.nodeName).to.be('#document');
		expect(typeof doc).to.be('object');
		expect(doc.nodeType).to.be(9); // Node.DOCUMENT_NODE 
	});
});   