var helpers = require('./helpers.js');
var assert = helpers.assert;

var domGlobals = {
	isElement : function(elem) {
		return !!elem.elems;
	},
	document : helpers.createElement("document")

};

domGlobals.document.createElement("#first", {width : 42}).createElements("#sub1", "#sub2").parentNode
	.createElement("#second").parentNode
	.createElement("#visible").createElement("#hidden", {visible : 'hidden'}).createElement("#visible").parentNode
	.createElement("#hidden", {visible : 'hidden'}).createElement("#visible").createElement("#visible").parentNode
	.createElement("#display").createElement("#notDisplayed", {display : 'none'}).createElement("#display").parentNode
	.createElement("#notDisplayed", {display : 'none'}).createElement("#display").createElement("#visible");
 

describe('dom.js', function() {
	describe('$', function() {
		helpers.run("./src/common/dom.js", domGlobals, function() {
		}, function() {
			it('should be identical to AdServ.$', function() {
				assert.strictEqual(AdServ.$, $);
			});
			it('should return the element given', function() {
				var elem = AdServ.$("#first");
				assert.strictEqual(AdServ.$(elem), elem);
			});
			it('should return undefined when none found', function() {
				assert.isUndefined(AdServ.$("#none"));
			});
			it('should use query the document on selector ', function() {
				assert.isDefined(AdServ.$("#first"));
				assert.equal(AdServ.$("#first").nodeName, "#first");
			});
			describe('using parent', function() {
				it('should return undefined when none found', function() {
					assert.equal(AdServ.$("#first", AdServ.$("#first")), void 0);
				});
				it('should use query the parent on selector', function() {
					assert.isDefined(AdServ.$("#sub1", AdServ.$("#first")));
					assert.equal(AdServ.$("#sub1", AdServ.$("#first")).nodeName, "#sub1");
				});
			});
		});
	});
	describe('$ID', function() {
		helpers.run("./src/common/dom.js", domGlobals, function() {
		}, function() {
			it('should be identical to AdServ.$ID', function() {
				assert.strictEqual(AdServ.$ID, $ID);
			});
			it('should return the element given', function() {
				var elem = AdServ.$ID("first");
				assert.strictEqual(AdServ.$(elem), elem);
			});
			it('should return undefined when none found', function() {
				assert.isUndefined(AdServ.$ID("none"));
			});
			it('should use query the document on selector ', function() {
				assert.isDefined(AdServ.$ID("first"));
				assert.equal(AdServ.$ID("first").nodeName, "#first");
			}); 
		});
	});

	describe('$$', function() {
		helpers.run("./src/common/dom.js", domGlobals, function() {
		}, function() {
			it('should be identical to AdServ.$$', function() {
				assert.equal(AdServ.$$, $$);
			});
			it('should return empty when none found', function() {
				assert.deepEqual(AdServ.$$("#none"), []);
			});
			it('should use query the document on selector ', function() {
				assert.notEqual(AdServ.$$(".ir"), void 0);
				assert.equal(AdServ.$$(".ir").length, 1);
				assert.equal(AdServ.$$(".ir")[0].nodeName, "#first");
			});
			it('should use query the document on selector ', function() {
				assert.notEqual(AdServ.$$(".sec"), void 0); 
				assert.equal(AdServ.$$(".sec").length, 1);
				assert.equal(AdServ.$$(".sec")[0].nodeName, "#second");
			});
			describe('using parent', function() {
				it('should return empty when none found', function() {
					assert.deepEqual(AdServ.$$("#first", AdServ.$("#first")), []);
				});
				it('should use query the parent on selector when given parent', function() {
					assert.equal(AdServ.$$(".sub", AdServ.$("#first")).length, 2);
					assert.equal(AdServ.$$(".sub", AdServ.$("#first"))[0].nodeName, "#sub1");
				});
			});
		});
	});


	describe('css', function() {
		helpers.run("./src/common/dom.js", domGlobals, function() {
		}, function() {
			it('should be identical to AdServ.css', function() {
				assert.strictEqual(AdServ.css, css);
			});
			it('should ensure that we have an element', function() {
				assert.equal(AdServ.css("first", "width"), 42);
			});
			it('should ensure that we have an element return null if no value', function() {
				assert.isNull(AdServ.css("second", "width"));
			});

			it('should not throw on element not found', function() {
				assert.doesNotThrow(function() {
					assert.isNull(AdServ.css("none", "width"));
				});
			});
		});
	});

	describe('isVisible', function() {
		helpers.run("./src/common/dom.js", domGlobals, function() {
		}, function() {

			it('should be identical to AdServ.isVisible', function() {
				assert.strictEqual(AdServ.isVisible, isVisible);
			});
			describe('visibility', function() {
				it('should return false when not "hidden"', function() { 
					assert.isTrue(AdServ.isVisible("first"));
				});
				it('should return false when not "hidden"', function() {
					assert.isTrue(AdServ.isVisible("visible"));
				});
				it('should return true when "hidden"', function() {
					assert.isTrue(AdServ.isVisible("visible"));
				});
			}); 
		});
	});


	describe('private', function() {
		describe('getComputedStyle', function() {
			it('should use the browser when it can', function() {
				helpers.run("./src/common/dom.js", {window : {getComputedStyle : "it works!"}}, function() {
				}, function() {
					assert.equal(window.getComputedStyle, "it works!");
					assert.strictEqual(getComputedStyle, window.getComputedStyle);
				});
			});


			helpers.run("./src/common/dom.js", domGlobals, function() {
			}, function() {
				it('should shim when nessesary', function() {
					assert.equal(window.getComputedStyle, void 0);
					assert.isFunction(getComputedStyle);
				});
			});
		});
	});
});