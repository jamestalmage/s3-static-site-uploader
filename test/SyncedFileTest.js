var Q = require('Q');
var fileUtils = requireCov('../src/file-utils.js');
var SyncedFile = requireCov('../src/SyncedFile.js').TestHook(fileUtils,Q);

describe('SyncedFile', function () {
    var sandbox,fileName;

    beforeEach(function(){
        sandbox = sinon.sandbox.create();
    });

    afterEach(function(){
        sandbox.restore();
    });

    function promiseStub(obj,method){
        sandbox.stub(obj,method,function(){
            var deferred = Q.defer();
            var promise = deferred.promise;
            promise._deferred = deferred;
            return promise;
        });
    }

    beforeEach(function(){
        promiseStub(fileUtils,'getContentHash');
        promiseStub(fileUtils,'exists');
    });

    var file, action;
    beforeEach(function(){
        fileName = './test/testfile.txt';
        file = new SyncedFile(fileName);
        action = file.action = engine.wrap(file.action);
        file.delete = engine.wrap(file.delete);
        file.upload = engine.wrap(file.upload);
    });

    function assertHashNotCalled(done){
        setTimeout(function(){
            try {
                expect(fileUtils.getContentHash).not.to.have.beenCalled;
                expect(fileUtils.exists).not.to.have.beenCalled;
                if(done){
                    done();
                }
            }
            catch(e){
                if(done) {
                    done(e);
                }
                throw e;
            }
        })
    }

    function expectAction(actionType){
        return expectThen('action',{'action':actionType,path:'./test/testfile.txt'});
        //return action.then.expect.result.to.equal(actionType);
    }

    function expectDelete(val){
        return expectThen('delete',{'delete':val,path:'./test/testfile.txt'});
    }

    function expectUpload(val){
        return expectThen('upload',{'upload':val,path:'./test/testfile.txt'});
    }

    function expectThen(prop,value){
        return file[prop].then.expect.result.to.eql(value);
    }

    it('constructor does not immediately hash the file', function (done) {
        assertHashNotCalled(done);
    });

    it('foundFile does not immediately trigger a fetch of the hash', function (done) {
        file.foundFile();
        assertHashNotCalled(done);
    });

    it('foundRemote does not immediately trigger a fetch of the hash', function (done) {
        file.foundRemote("HASH VALUE");
        assertHashNotCalled(done);
    });

    describe('action promise',function(){

        it('resolves to delete when remoteHash is found, but local does not exist', function(done){
            expectAction('delete').then.notify(done);

            file.foundRemote("HASH VALUE");
            file.globDone();
        });

        it('resolves to upload when remoteHash is found, and local has a different hash value',function(done){
            expectAction('upload').then.notify(done);

            file.foundRemote("HASH VALUE");
            file.foundFile();
            setTimeout(function(){
                fileUtils.getContentHash.firstCall.returnValue._deferred.resolve('Some Other Hash');
            },10);
        });


        it('resolves to nothing when remoteHash is found, and local has the same hash value',function(done){
            expectAction('nothing').then.notify(done);

            file.foundRemote("HASH VALUE");
            file.foundFile();
            setTimeout(function(){
                fileUtils.getContentHash.firstCall.returnValue._deferred.resolve('HASH VALUE');
            },10);
        });

        it('resolves to upload when local is found, and remote is not',function(done){
            expectAction('upload').then.notify(done);

            file.foundFile();
            file.remoteDone();
        });

    });

    describe('delete promise',function(){

        it('resolves to true if found remotely, but not locally',function(done){
            expectDelete(true).then.notify(done);
            file.foundRemote('HASH VALUE');
            file.globDone();
        });

        it('resolves to false if found locally, but not remotely',function(done){
            expectDelete(false).then.notify(done);
            file.foundFile();
            file.remoteDone();
        });

        it('resolves to false if found found both places - even before local hash is fetched',function(done){
            expectDelete(false).then.notify(done);
            file.foundFile();
            file.foundRemote('remoteHash');
        });

    });

    describe('upload promise',function(){

        it('resolves to false if found remotely, but not locally',function(done){
            expectUpload(false).then.notify(done);
            file.foundRemote('HASH VALUE');
            file.globDone();
        });

        it('resolves to true if found locally, but not remotely',function(done){
            expectUpload(true).then.notify(done);
            file.foundFile();
            file.remoteDone();
        });

        it('resolves to false if found found both places - and both hashes are the same',function(done){
            expectUpload(false).then.notify(done);
            file.foundFile();
            file.foundRemote('remoteHash');
            setTimeout(function(){
                fileUtils.getContentHash.firstCall.returnValue._deferred.resolve('remoteHash');
            },10);
        });

        it('resolves to true if found found both places - and the hashes are different',function(done){
            expectUpload(true).then.notify(done);
            file.foundFile();
            file.foundRemote('remoteHash');
            setTimeout(function(){
                fileUtils.getContentHash.firstCall.returnValue._deferred.resolve('some other remoteHash');
            },10);
        });

    });

});