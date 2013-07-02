TESTS = test/*.js
REPORTER = dot

test: node_modules
	 mocha

src-cov: clean-cov
	jscoverage src src-cov

test-cov: src-cov
	S3_UPLOAD_COV=1 mocha \
		--require ./test/bootstrap \
		--reporter html-cov \
		$(TESTS) \
		> coverage.html

node_modules: package.json
	npm install

clean: clean-cov

clean-cov:
	rm -rf src-cov
	rm -f coverage.html

clean-all: clean
	rm -rf node_modules
	

.PHONY: test test-cov
.PHONY: clean clean-cov clean-all 