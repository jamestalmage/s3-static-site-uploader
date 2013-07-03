var Q = require('Q');

var fs = require('fs');
var crypto = require('crypto');

var readFile = Q.denodeify(fs.readFile);

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
    md5:md5,
    getContents: getFileContents,
    getContentHash: getContentHash,
    exists:exists
};