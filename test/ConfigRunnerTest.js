var GlobRunnerStub = require('../test-lib/GlobRunnerStub.js');
var RemoteRunnerStub = require('../test-lib/RemoteRunnerStub.js');
var SyncedFileCollectionStub = require('../test-lib/SyncedFileCollectionStub.js');
var S3PromiseWrapperStub = require('../test-lib/S3PromiseWrapperStub.js');
var S3Stub = require('../test-lib/S3Stub.js');


var ConfigRunner = requireCov('../src/ConfigRunner.js');


var globRunInstance = GlobRunnerStub.instance;
var remoteRunInstance = RemoteRunnerStub.instance;
var collectionInstance = SyncedFileCollectionStub.instance;
var s3Instance = S3Stub.instance;
var s3WrapperInstane = S3PromiseWrapperStub.instance;

describe('ConfigRunner', function () {
    afterEach(function(){
        GlobRunnerStub.reset();
        RemoteRunnerStub.reset();
        SyncedFileCollectionStub.reset();
        S3Stub.reset();
        S3PromiseWrapperStub.reset();
    });

    function createConfigRunner(bucketName,patterns){
        bucketName = bucketName || 'myBucket';
        if(arguments.length < 2) {
            patterns = ['json/*.json'];
        }
        else {
            patterns = Array.prototype.slice.call(arguments,1);
        }
        return  new ConfigRunner({bucketName:bucketName,patterns:patterns},GlobRunnerStub,RemoteRunnerStub,SyncedFileCollectionStub,S3PromiseWrapperStub,S3Stub);
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
        expect(RemoteRunnerStub).to.have.been.calledWith(match.any,match.any,s3WrapperInstane(0));
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
        createConfigRunner(null,'json/*.json','src/*.js');
        expect(globRunInstance(0).addPattern)
            .to.have.been.calledTwice
            .and.calledWith('json/*.json')
            .and.calledWith('src/*.js');
    });

});