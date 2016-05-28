

var strip = /^"|"$/g;

function RemoteRunner(bucketName,collection,s3,filter){

    function run(){
        s3.listObjects(bucketName).then(function(result){
            result.Contents.forEach(function(content){
                var key = content.Key;
                var tag = content.ETag;
                tag = tag.replace(strip,'');
                if(filter.match(key)) return;
                collection.foundRemote(key,tag);
            });
            collection.remoteDone();
        },console.log);
    }

    this.run = run;

}

module.exports = RemoteRunner;
