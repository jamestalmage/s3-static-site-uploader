function ConfigRunner(config,GlobRunner,RemoteRunner,SyncedFileCollection,S3PromiseWrapper,AWS){
    GlobRunner = GlobRunner || require('./GlobRunner.js');
    RemoteRunner = RemoteRunner || require('./RemoteRunner.js');
    SyncedFileCollection = SyncedFileCollection || require('./SyncedFileCollection.js');
    S3PromiseWrapper = S3PromiseWrapper || require('./S3PromiseWrapper.js');
    AWS = AWS || require('aws-sdk');
    var S3 = AWS.S3;


    AWS.config.loadFromPath(config.credentials);

    var s3 = new S3();
    var s3PromisWrapper = new S3PromiseWrapper(s3);

    var collection = new SyncedFileCollection();
    var globRunner = new GlobRunner(collection);
    var remoteRunner = new RemoteRunner(config.bucketName,collection,s3PromisWrapper);

    config.patterns.forEach(globRunner.addPattern);

    remoteRunner.run();
    globRunner.run();
}

module.exports = ConfigRunner;