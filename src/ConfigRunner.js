function ConfigRunner(config,GlobRunner,RemoteRunner,SyncedFileCollection,S3PromiseWrapper,S3){
    GlobRunner = GlobRunner || require('./GlobRunner.js');
    RemoteRunner = RemoteRunner || require('./RemoteRunner.js');
    SyncedFileCollection = SyncedFileCollection || require('./SyncedFileCollection.js');
    S3PromiseWrapper = S3PromiseWrapper || require('./S3PromiseWrapper.js');
    S3 = S3 || require('aws-sdk').S3;



    var s3 = new S3();
    var s3PromisWrapper = new S3PromiseWrapper(s3);

    var collection = new SyncedFileCollection();
    var globRunner = new GlobRunner(collection);
    var remoteRunner = new RemoteRunner(config.bucketName,collection,s3PromisWrapper);

    config.patterns.forEach(globRunner.addPattern);
}

module.exports = ConfigRunner;