


function GlobRunner(Glob){
    var patterns = [];

    function addEachPattern(arrayLike){
        for(var i =0; i < arrayLike.length; i++){
            addPattern(arrayLike[i]);
        }
    }

    function addPattern(pattern){

        if(arguments.length > 1){
            addEachPattern(arguments);
        }
        else if(Object.prototype.toString.call(pattern) === '[object Array]'){
            addEachPattern(pattern);
        }
        else {
            if(!~patterns.indexOf(pattern)){
                patterns.push(pattern);
            }
        }
    }


    this.addPattern = addPattern;
    this.getPatterns = patterns.slice.bind(patterns);
}

module.exports = GlobRunner;