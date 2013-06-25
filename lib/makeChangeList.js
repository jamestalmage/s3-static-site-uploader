
var Q = require('Q');
var fs = require('fs');
var glob = require('glob');
var crypto = require('crypto');
var util = require('util');

var readFile = Q.denodeify(fs.readFile);

var strip = /^"|"$/g;


function md5(str){
    return crypto.createHash('md5').update(str).digest('hex');
}




function makeList(onTheDrive,inTheCloud){
    var result = {
        add:[],
        delete:[],
        update:[],
        nochange:[]
    };
    for(var i in inTheCloud){
        if(inTheCloud.hasOwnProperty(i)){
            var cloud = inTheCloud[i];
            var key = cloud.Key;
            var hash = cloud.ETag.replace(strip,"");

            if(onTheDrive[key]){
                if(hash==onTheDrive[key]){
                    result.nochange.push(key);
                }
                else {
                    result.update.push(key);
                }
                delete onTheDrive[key];
            }
            else {
                result.delete.push(key);
            }
        }
    }

    for(var j in onTheDrive){
        result.add.push(j);
    }
    return result;
}

function makeAndHashGlobs(pattern){
    var files = {};
    var globDoneDefer = Q.defer();
    var promises = [];
    new glob.Glob(pattern)
        .on('match',function(match){
            var readFilePromise =  readFile(match)
                .then(function(contents){
                    var md = md5(contents);
                    files[match] = md;
                });
            readFilePromise.done();
            promises.push(readFilePromise);
        })
        .on('end',function(){
            Q.all(promises).then(function(){
                globDoneDefer.resolve(files);
            }).done();
        });
    return globDoneDefer.promise;
}

module.exports = {
    makeList:makeList,
    makeAndHashGlobs:makeAndHashGlobs
};