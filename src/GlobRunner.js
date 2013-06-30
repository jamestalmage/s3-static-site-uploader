


function GlobRunner(Glob){
    Glob = Glob || require('glob').Glob;
    var patterns = [];
    var globs = [];

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


    function map(arr, fn){
        var ret = [];
        arr.forEach(function(val){arr.push(fn(val))});
        return ret;
    }

    function onMatch(pattern){
    }

    function createGlob(pattern){
        var glob =  new Glob(pattern);
        globs.push(glob);

        glob.on('match',onMatch);

        return glob;
    }



    function run(){
        patterns.forEach(createGlob);
    }

    this.run = run;

    this.addPattern = addPattern;
    this.getPatterns = patterns.slice.bind(patterns);
}

module.exports = GlobRunner;