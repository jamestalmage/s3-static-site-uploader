function TestHook(GlobRunner,RemoteRunner,SyncedFileCollection,S3PromiseWrapper,AWS,fileUtils){
GlobRunner = GlobRunner || require('./GlobRunner.js');
RemoteRunner = RemoteRunner || require('./RemoteRunner.js');
SyncedFileCollection = SyncedFileCollection || require('./SyncedFileCollection.js');
S3PromiseWrapper = S3PromiseWrapper || require('./S3PromiseWrapper.js');
fileUtils = fileUtils || require('./file-utils.js');
AWS = AWS || require('aws-sdk');
var S3 = AWS.S3;

return function ConfigRunner(){
    var config;

    this.setConfig = function(conf){
        config = conf;
        return this;
    };

    this.run = function(){

        AWS.config.loadFromPath(config.credentials);

        var s3 = new S3();
        var s3Wrapper = new S3PromiseWrapper(s3);

        var collection = new SyncedFileCollection();
        var globRunner = new GlobRunner(collection);
        var remoteRunner = new RemoteRunner(config.bucketName,collection,s3Wrapper);

        var patterns = config.patterns;

        for(var i = 0; i < patterns.length; i ++){
            globRunner.addPattern(patterns[i]);
        }

        //   config.patterns.forEach(globRunner.addPattern);

        remoteRunner.run();
        globRunner.run();

        collection.allDone.then(function(actions){
            var deletes = [];
            actions.forEach(function(obj){
                switch(obj.action){
                    case 'delete':

                        deletes.push(obj.path);
                        break;
                    case 'upload':
                        fileUtils.getContents(obj.path).then(function(contents){
                            console.log('uploading: ' + obj.path);
                            s3Wrapper.putObject(config.bucketName,obj.path,contents).then(function(){
                                console.log('done uploading: ' + obj.path);
                            },function(reason){
                                console.log('error uploading: ' + obj.path);
                                console.log(reason);
                            });
                        });


                }
            });
            if(deletes.length !== 0) {
                console.log('deleting the following: ');
                deletes.forEach(function(path){console.log('\t' + path)});
                s3Wrapper.deleteObjects(config.bucketName,deletes).then(
                    function(){console.log('delete successful')},
                    function(reason){console.log('delete failed ' + reason); console.log(reason); });
            }
        });

    };
};
}

var ConfigRunner = TestHook();
ConfigRunner.TestHook = TestHook;

module.exports = ConfigRunner;