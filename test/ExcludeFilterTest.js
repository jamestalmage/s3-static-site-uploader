var ExcludeFilter = require('../src/ExcludeFilter');

describe("ExcludeFilter", function(){
	var filter;

	beforeEach(function(){
		filter = new ExcludeFilter();
	});

	it("should add the pattern to patterns", function(){
		filter.addPattern('testPattern');
		expect(filter.getPatterns()).to.deep.equal(['testPattern']);
	});

	it("should not add the same pattern twice", function(){
		filter.addPattern('testPattern');
		filter.addPattern('testPattern');
		expect(filter.getPatterns()).to.deep.equal(['testPattern']);
	});

	it("should match added patterns", function(){
		filter.addPattern('/path/to/**');

		expect(filter.match('/path/to/my/File')).to.equal(true);
	});

	it("should match with multiple matching patterns", function(){
		filter.addPattern('/path/to/**');
		filter.addPattern('/path/to/my/*');

		expect(filter.match('/path/to/my/File')).to.equal(true);
	});

	it("should not match other patterns", function(){
		filter.addPattern('/path/to/your/*');
		filter.addPattern('/path/from/**');

		expect(filter.match('/path/to/my/File')).to.equal(false);
	});
});
