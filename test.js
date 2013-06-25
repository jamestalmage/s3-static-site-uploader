var S3SiteMaker = require('./main.js');
var util = require('util');

var siteMaker = new S3SiteMaker();

siteMaker.loadCredentials('aws-credentials.json');

var bucketName = 'test-bucket-name-james-talmage3';


function logResponse(funcName){
    return function(response){
        console.log(funcName + ' Response: ' + util.inspect(response));
        return response;
    }
}

function logError(funcName, rethrow){
    return function(error){
        console.log(funcName + ' Error: ' + util.inspect(error));
        if(rethrow){
            throw error;
        }
    }
}


var fileToUpload = 'mysampleupload.txt';

siteMaker

    .headBucket(bucketName)
    .then(logResponse('headBucket existing'),logError('headBucket existing'))

    .then(function(){return siteMaker.headBucket('jamesTalmageMostLikelyNonExistentBucket4313')})
    .then(logResponse('headBucket nonexistent'),logError('headBucket nonexistent'))

    .then(function(){return siteMaker.headBucket('testBucket')})
    .then(logResponse('headBucket taken'),logError('headBucket taken'))

    .then(function(){return siteMaker.createBucket(bucketName)})
    .then(logResponse('createBucket'),logError('createBucket',true))

    .then(function(){
        return siteMaker.putBucketPolicy(bucketName,siteMaker.createReadAllBucketPolicy(bucketName));
    })
    .then(logResponse('putBucketPolicy'),logError('putBucketPolicy',true))

    .then(function(){
        return siteMaker.putBucketWebsite(bucketName,'index.html');
    })

    .then(function(){
        return siteMaker.readFile(fileToUpload);
    })
    .then(function(result){
        result = result.toString();
        console.log('MD5: '+ siteMaker.md5(result));
        return siteMaker.putObject(bucketName,fileToUpload,result);
    })


    .then(function(){
        return siteMaker.listObjects(bucketName);
    })
    .then(logResponse('listObjects'),logError('listObjects',true))

    .done();



//siteMaker.putBucketPolicy(bucketName,siteMaker.createReadAllBucketPolicy(bucketName)).done();