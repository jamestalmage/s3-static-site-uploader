var GlobRunnerStub = require('../test-lib/GlobRunnerStub.js');
var RemoteRunnerStub = require('../test-lib/RemoteRunnerStub.js');
var SyncedFileCollectionStub = require('../test-lib/SyncedFileCollectionStub.js');
var S3PromiseWrapperStub = require('../test-lib/S3PromiseWrapperStub.js');
var fileUtilsStub = require('../test-lib/file-utils-stub.js');
var AWSStub = require('../test-lib/AWSStub.js');
var S3Stub = AWSStub.S3;


var ConfigRunner = requireCov('../src/ConfigRunner.js');


var globRunInstance = GlobRunnerStub.instance;
var remoteRunInstance = RemoteRunnerStub.instance;
var collectionInstance = SyncedFileCollectionStub.instance;
var s3Instance = S3Stub.instance;
var s3WrapperInstance = S3PromiseWrapperStub.instance;

describe('ConfigRunner', function () {
    afterEach(function(){
        GlobRunnerStub.reset();
        RemoteRunnerStub.reset();
        SyncedFileCollectionStub.reset();
        AWSStub.reset();
        S3PromiseWrapperStub.reset();
        fileUtilsStub.restore();
    });

    function createConfig(bucketName,credentials,patterns){
        bucketName = bucketName || 'myBucket';
        credentials = credentials || './myCredentials.json';
        if(arguments.length < 3) {
            patterns = ['json/*.json'];
        }
        else {
            patterns = Array.prototype.slice.call(arguments,2);
        }
        return {bucketName:bucketName,credentials:credentials,patterns:patterns};
    }

    function createConfigRunner(bucketName,credentials,patterns){
        var config = createConfig.apply(null,arguments);
        return  new ConfigRunner(config,GlobRunnerStub,RemoteRunnerStub,SyncedFileCollectionStub,S3PromiseWrapperStub,AWSStub,fileUtilsStub);
    }

    it('creates a new GlobRunner', function () {
        createConfigRunner();
        expect(GlobRunnerStub).to.have.been.calledOnce.and.calledWithNew;
    });

    it('creates a new RemoteRunner', function () {
        createConfigRunner();
        expect(RemoteRunnerStub).to.have.been.calledOnce.and.calledWithNew;
    });

    it('creates a new SyncedFileCollection', function(){
        createConfigRunner();
        expect(SyncedFileCollectionStub).to.have.been.calledOnce.and.calledWithNew;
    });

    it('creates a new S3 instance',function(){
        createConfigRunner();
        expect(S3Stub).to.have.been.calledOnce.and.calledWithNew;
    });

    it('creates a new S3PromiseWrapper',function(){
        createConfigRunner();
        expect(S3PromiseWrapperStub).to.have.been.calledOnce.and.calledWithNew;
    });

    it('passes S3 to the Wrapper',function(){
        createConfigRunner();
        expect(S3PromiseWrapperStub).to.have.been.calledWith(s3Instance(0));

    });

    it('passes the config bucketName to the RemoteRunner',function(){
        createConfigRunner();
        expect(RemoteRunnerStub).to.have.been.calledWith('myBucket');
    });

    it('passes the SyncedFileCollection to the RemoteRunner',function(){
        createConfigRunner();
        expect(RemoteRunnerStub).to.have.been.calledWith(match.any,collectionInstance(0));
    });

    it('passes the S3PromiseWrapper to the RemoteRunner',function(){
        createConfigRunner();
        expect(RemoteRunnerStub).to.have.been.calledWith(match.any,match.any,s3WrapperInstance(0));
    })

    it('passes the SyncedFileCollection to the GlobRunner',function(){
        createConfigRunner();
        expect(GlobRunnerStub).to.have.been.calledWith(collectionInstance(0));
    });

    it('adds a single config pattern to the globRunner', function(){
        createConfigRunner();
        expect(globRunInstance(0).addPattern).to.have.been.calledOnce.and.calledWith('json/*.json');
    });

    it('adds multiple config patterns to the globRunner',function (){
        createConfigRunner(null,null,'json/*.json','src/*.js');
        expect(globRunInstance(0).addPattern)
            .to.have.been.calledTwice
            .and.calledWith('json/*.json')
            .and.calledWith('src/*.js');
    });

    it('calls run on the RemoteRunner',function(){
        createConfigRunner();
        expect(remoteRunInstance(0).run).to.have.been.calledOnce;
    });

    it('calls run on the GlobRunner',function(){
        createConfigRunner();
        expect(globRunInstance(0).run).to.have.been.calledOnce;
    });

    it('loads the credentials file specified in config into aws',function(){
        createConfigRunner();
        expect(AWSStub.config.loadFromPath)
            .to.have.been.calledOnce
            .and.calledWith('./myCredentials.json');
    });

    it('will call deleteObjects on s3Wrapper with appropriate bucket',function(done){
        createConfigRunner();
        collectionInstance(0).allDoneDefer.resolve([{action:'delete',path:'myDeletePath'}]);
        later()(function(){
            expect(s3WrapperInstance(0).deleteObjects)
                .to.have.been.calledOnce
                .and.calledWith('myBucket');
        }).then.notify(done);
    });

    it('will call deleteObjects on s3Wrapper with some other bucket',function(done){
        createConfigRunner('myOtherBucket');
        collectionInstance(0).allDoneDefer.resolve([{action:'delete',path:'myDeletePath'}]);
        later()(function(){
            expect(s3WrapperInstance(0).deleteObjects)
                .to.have.been.calledOnce
                .and.calledWith('myOtherBucket');
        }).then.notify(done);
    });

    it('will call deleteObjects on s3Wrapper with appropriate path',function(done){
        createConfigRunner();
        collectionInstance(0).allDoneDefer.resolve([{action:'delete',path:'myDeletePath'}]);
        later()(function(){
            expect(s3WrapperInstance(0).deleteObjects)
                .to.have.been.calledOnce
                .and.calledWith(match.any,['myDeletePath']);
        }).then.notify(done);
    });

    it('will call deleteObjects on s3Wrapper with a different path',function(done){
        createConfigRunner();
        collectionInstance(0).allDoneDefer.resolve([{action:'delete',path:'myOtherDeletePath'}]);
        later()(function(){
            expect(s3WrapperInstance(0).deleteObjects)
                .to.have.been.calledOnce
                .and.calledWith(match.any,['myOtherDeletePath']);
        }).then.notify(done);
    });

    it('will call deleteObjects on s3Wrapper with multiple delete paths',function(done){
        createConfigRunner();
        collectionInstance(0).allDoneDefer.resolve([{action:'delete',path:'myDeletePath'},{action:'delete',path:'myOtherDeletePath'}]);
        later()(function(){
            expect(s3WrapperInstance(0).deleteObjects)
                .to.have.been.calledOnce
                .and.calledWith(match.any,['myDeletePath','myOtherDeletePath']);
        }).then.notify(done);
    });

    it('will fetch file contents for path with action upload',function(done){
        createConfigRunner();
        collectionInstance(0).allDoneDefer.resolve([{action:'upload',path:'myUploadPath'}]);
        later()(function(){
            expect(fileUtilsStub.getContents).to.have.been.calledOnce.and.calledWith('myUploadPath');
        }).then.notify(done);
    });

    it('will fetch file contents for a different path with action upload',function(done){
        createConfigRunner();
        collectionInstance(0).allDoneDefer.resolve([{action:'upload',path:'myOtherUploadPath'}]);
        later()(function(){
            expect(fileUtilsStub.getContents).to.have.been.calledOnce.and.calledWith('myOtherUploadPath');
        }).then.notify(done);
    });

    it('will fetch file contents for both paths with action upload',function(done){
        createConfigRunner();
        collectionInstance(0).allDoneDefer.resolve([{action:'upload',path:'myOtherUploadPath'},{action:'upload',path:'myUploadPath'}]);
        later()(function(){
            expect(fileUtilsStub.getContents)
                .to.have.been.calledTwice
                .and.calledWith('myOtherUploadPath')
                .and.calledWith('myUploadPath');
        }).then.notify(done);
    });


    it('will upload file contents of given path',function(done){
        createConfigRunner();
        collectionInstance(0).allDoneDefer.resolve([{action:'upload',path:'myUploadPath'}]);
        later()(function(){
            fileUtilsStub.getContents.returnValues[0]._deferred.resolve('myContents');
            later()(function(){
                expect(s3WrapperInstance(0).putObject).to.have.been.calledOnce.and.calledWith('myBucket','myUploadPath','myContents');

            }).then.notify(done);
        });
    });


    it('will upload file contents of a different path',function(done){
        createConfigRunner();
        collectionInstance(0).allDoneDefer.resolve([{action:'upload',path:'myOtherUploadPath'}]);
        later()(function(){
            fileUtilsStub.getContents.returnValues[0]._deferred.resolve('myOtherContents');
            later()(function(){
                expect(s3WrapperInstance(0).putObject).to.have.been.calledOnce.and.calledWith('myBucket','myOtherUploadPath','myOtherContents');

            }).then.notify(done);
        });
    });


    it('will upload file contents of multiple paths',function(done){
        createConfigRunner();
        collectionInstance(0).allDoneDefer.resolve([{action:'upload',path:'myOtherUploadPath'},{action:'upload',path:'myUploadPath'}]);
        later()(function(){
            //TODO: To brittle - don't rely on execution order
            fileUtilsStub.getContents.returnValues[0]._deferred.resolve('myOtherContents');
            fileUtilsStub.getContents.returnValues[1]._deferred.resolve('myContents');
            later()(function(){
                expect(s3WrapperInstance(0).putObject)
                    .to.have.been.calledTwice
                    .and.calledWith('myBucket','myOtherUploadPath','myOtherContents')
                    .and.calledWith('myBucket','myUploadPath','myContents');

            }).then.notify(done);
        });
    });

    it('will handle mixed upload / deletes',function(done){
        createConfigRunner();
        collectionInstance(0).allDoneDefer.resolve([
            {action:'delete',path:'myDeletePath'},
            {action:'upload',path:'myUploadPath'}
        ]);
        later()(function(){
            expect(fileUtilsStub.getContents).to.have.been.calledOnce.and.calledWith('myUploadPath');
            expect(s3WrapperInstance(0).deleteObjects).to.have.been.calledOnce.and.calledWith('myBucket',['myDeletePath']);
            fileUtilsStub.getContents.returnValues[0]._deferred.resolve('myContents');

            later()(function(){
                expect(s3WrapperInstance(0).putObject)
                    .to.have.been.calledOnce
                    .to.have.been.calledWith('myBucket','myUploadPath','myContents');

            }).then.notify(done);
        }).then(null,done);

    });

    it('will not call delete if there are no objects to delete',function(done){
        createConfigRunner();
        collectionInstance(0).allDoneDefer.resolve([
            {action:'upload',path:'myOtherUploadPath'},
            {action:'upload',path:'myUploadPath'}
        ]);

        later()(function(){
            expect(s3WrapperInstance(0).deleteObjects).not.to.have.been.called;
        }).then.notify(done);

    });
});