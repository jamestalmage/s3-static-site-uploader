var Q = require('q');

var fs = require('fs');
var crypto = require('crypto');
var MAX_OPEN = 200;
var openCount = 0;
var cache = [];

function _readNextFile(){
    if(openCount < MAX_OPEN && cache.length > 0){
        openCount++;
        var nextCall = cache[0];
        cache = cache.slice(1);


        fs.readFile(nextCall.fileName,nextCall.options,function(err,result){
            try {
                if(err){
                    nextCall.deferred.reject(err);
                }
                else {
                    nextCall.deferred.resolve(result);
                }
            }
            finally {
                openCount--;
                _readNextFile();
            }
        });
    }
}

function readFile(fileName,opts){
    var deferred = Q.defer();
    cache.push({fileName:fileName, options:opts,deferred:deferred});
    _readNextFile();
    return deferred.promise;
}


function isArray(path) {
    return Object.prototype.toString.call(path) === '[object Array]';
}

function translate(input,fn){
    var arr = [];
    input.forEach(function(val){arr.push(fn(val));});
    return arr;
}

function promise_translate(input,fn){
    return translate(input,function(val){return val.then(fn);})
}

function bindArg2(fn,arg2){
    return function (val){return fn(val,arg2);}
}

function getFileContents(path,encoding){
    var _readFile = bindArg2(readFile,encoding);
    if( isArray(path)){
        return Q.all(translate(path,_readFile));
    }
    return readFile(path,encoding);
}

function md5(str){
    return crypto.createHash('md5').update(str).digest('hex');
}

function getContentHashPromises(paths){
    return promise_translate( translate(paths,readFile),md5);
}

function getContentHash(path){
    if(isArray(path)){
        return Q.all(getContentHashPromises(path));
    }
    return readFile(path).then(md5);
}

function exists(path){
    var deferred = Q.defer();
    fs.exists(path,deferred.resolve);
    return deferred.promise;
}


module.exports = {
    _fs:fs,
    md5:md5,
    getContents: getFileContents,
    getContentHash: getContentHash,
    exists:exists,
    get MAX_OPEN(){return MAX_OPEN;},
    set MAX_OPEN(mo){MAX_OPEN = mo; _readNextFile();}
};
