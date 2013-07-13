

var strip = /^"|"$/g;

function RemoteRunner(bucketName,collection,s3){
    s3 = s3 || require('./S3PromiseWrapper.js');

    function run(){
        s3.listObjects(bucketName).then(function(result){
            result.Contents.forEach(function(content){
                var key = content.Key;
                var tag = content.ETag;
                tag = tag.replace(strip,'');
                collection.foundRemote(key,tag);
            });
            collection.remoteDone();
        },console.log);
    }

    this.run = run;

}

module.exports = RemoteRunner;