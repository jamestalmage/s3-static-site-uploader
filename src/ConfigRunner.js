function ConfigRunner(config,GlobRunner,RemoteRunner,SyncedFileCollection,S3PromiseWrapper,AWS,fileUtils){
    GlobRunner = GlobRunner || require('./GlobRunner.js');
    RemoteRunner = RemoteRunner || require('./RemoteRunner.js');
    SyncedFileCollection = SyncedFileCollection || require('./SyncedFileCollection.js');
    S3PromiseWrapper = S3PromiseWrapper || require('./S3PromiseWrapper.js');
    fileUtils = fileUtils || require('./file-utils.js');
    AWS = AWS || require('aws-sdk');
    var S3 = AWS.S3;


    AWS.config.loadFromPath(config.credentials);

    var s3 = new S3();
    var s3Wrapper = new S3PromiseWrapper(s3);

    var collection = new SyncedFileCollection();
    var globRunner = new GlobRunner(collection);
    var remoteRunner = new RemoteRunner(config.bucketName,collection,s3Wrapper);

    config.patterns.forEach(globRunner.addPattern);

    remoteRunner.run();
    globRunner.run();

    collection.allDone.then(function(actions){
        var deletes = [];
        actions.forEach(function(obj){
            if(obj.action === 'delete'){
                deletes.push(obj.path);
            }
            fileUtils.getContents(obj.path).then(function(contents){
                s3Wrapper.putObject(config.bucketName,obj.path,contents);
            });
        });
        s3Wrapper.deleteObjects(config.bucketName,deletes);
    });
}

module.exports = ConfigRunner;