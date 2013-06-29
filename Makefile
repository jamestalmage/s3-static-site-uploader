test: node_modules
	 mocha

node_modules: package.json
	npm install

clean: clean-all

clean-all:
	rm -rf node_modules
	

.PHONY: test