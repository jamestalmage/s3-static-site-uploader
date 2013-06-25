var lists = require('./lib/makeChangeList.js');
var util = require('util');
var S3Promise = require('./main.js');
var Q = require('Q');

var start = Date.now();
var s3 = new S3Promise();

var files = lists.makeAndHashGlobs('json/*.json');

s3.loadCredentials('aws-credentials.json');

var bucketName = 'test-bucket-name-james-talmage3';
var names = s3.listObjects(bucketName);

Q.spread([files,names],function(onDisk,inCloud){
    var list = lists.makeList(onDisk,inCloud.Contents);
    var promises = [];

    if(list.delete.length > 0){

        promises.push(
            s3.deleteObjects(bucketName,list.delete)
        );
    }

    function upload(fileName){
        var uploadPromise = s3
            .readFile(fileName)
            .then(function(contents){return s3.putObject(bucketName,fileName,contents)});
        promises.push(uploadPromise);
    }

    list.add.forEach(upload);
    list.update.forEach(upload);

    return Q.all(promises);
}).then(function(){
        console.log(util.inspect(arguments));
        var time = Date.now() - start;
        time = time/1000;
        console.log('upload completed in: ' + time + ' seconds' );
    }).done();




