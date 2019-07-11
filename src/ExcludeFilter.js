
var minimatch = require('minimatch');

function ExcludeFilter(){
	var patterns = [];

	function addPattern(pattern){
		if(!~patterns.indexOf(pattern)){
			patterns.push(pattern);
		}
	}

	function match(path){
		var pattern;
		for(var i = 0; i < patterns.length; i++){
			pattern = patterns[i];
			if(minimatch(path, pattern)) return true;
		}
		return false;
	}

	this.addPattern = addPattern;
	this.getPatterns = patterns.slice.bind(patterns);
	this.match = match;
}

module.exports = ExcludeFilter;
