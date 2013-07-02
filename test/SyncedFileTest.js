var Q = require('Q');
var SyncedFile = requireCov('../src/SyncedFile.js');
var fileUtils = requireCov('../src/file-utils.js');

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
        file = new SyncedFile(fileName,fileUtils);
        action = engine.wrap(file.action);
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
        return action.then.expect.result.to.equal(actionType);
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


    it('when remoteHash is found, but local does not exist. Action is delete.', function(done){
        expectAction('delete').then.notify(done);

        file.foundRemote("HASH VALUE");
        file.globDone();
    });

    it('when remoteHash is found, and local has a different hash value, Action is upload',function(done){
        expectAction('upload').then.notify(done);

        file.foundRemote("HASH VALUE");
        file.foundFile();
        setTimeout(function(){
            fileUtils.getContentHash.firstCall.returnValue._deferred.resolve('Some Other Hash');
        },10);
    });


    it('when remoteHash is found, and local has the same hash value, Action is nothing',function(done){
        expectAction('nothing').then.notify(done);

        file.foundRemote("HASH VALUE");
        file.foundFile();
        setTimeout(function(){
            fileUtils.getContentHash.firstCall.returnValue._deferred.resolve('HASH VALUE');
        },10);
    });

    it('when local is found, and remote is not, Action is upload',function(done){
        expectAction('upload').then.notify(done);

        file.foundFile();
        file.remoteDone();
    });



});