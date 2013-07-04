var SyncedFileCollection = requireCov('../src/SyncedFileCollection.js');

describe('SyncedFileCollection', function () {

    var SyncedFileStub, collection;

    beforeEach(function(){
        SyncedFileStub = sinon.spy(require('./../test-lib/SyncedFileStub.js'));
        expect(SyncedFileStub).not.to.have.been.called; // proof the call count has been reset
        collection = new SyncedFileCollection(SyncedFileStub);
    });

    function fileStub(index){
        return SyncedFileStub.thisValues[index];
    }

    describe('foundFile',function(){
        it('should create a new SyncedFile the first time a particular path is found', function () {
            collection.foundFile('myPath');
            expect(SyncedFileStub).to.have.been.calledOnce;
        });

        it('should pass the path to the SyncedFiles constructor', function () {
            collection.foundFile('myPath');
            expect(SyncedFileStub).to.have.been.calledOnce;
            expect(SyncedFileStub).to.have.been.calledWith('myPath');
        });

        it('should not create new SyncedFiles for paths it already knows about', function () {
            collection.foundFile('myPath');
            expect(SyncedFileStub).to.have.been.calledOnce;
            collection.foundFile('myPath');
            expect(SyncedFileStub).to.have.been.calledOnce;
        });

        it('should create new SyncedFiles on subsequent calls if it has never seen that particular path before', function () {
            collection.foundFile('myPath');
            expect(SyncedFileStub).to.have.been.calledOnce;
            collection.foundFile('myPath2');
            expect(SyncedFileStub).to.have.been.calledTwice;
            expect(SyncedFileStub).to.have.been.calledWith('myPath');
            expect(SyncedFileStub).to.have.been.calledWith('myPath2');
        });

        it('should not create new SyncedFiles if it was already found remotely', function () {
            collection.foundRemote('myPath','someHash');
            expect(SyncedFileStub).to.have.been.calledOnce;
            collection.foundFile('myPath');
            expect(SyncedFileStub).to.have.been.calledOnce;
        });

        it('should call SyncedFile.foundFile on newly discovered paths',function(){
            collection.foundFile('myPath');
            expect(fileStub(0).foundFile).to.have.been.calledOnce;
        });

        it('should call SyncedFile.foundFile on paths previously discovered by remote',function(){
            collection.foundRemote('myPath');
            expect(fileStub(0).foundFile).not.to.have.been.calledOnce;
            collection.foundFile('myPath');
            expect(fileStub(0).foundFile).to.have.been.calledOnce;
        });
    });

    describe('foundRemote',function(){
        it('should create a new SyncedFile the first time a particular path is found', function () {
            collection.foundRemote('myPath','myHash');
            expect(SyncedFileStub).to.have.been.calledOnce;
        });

        it('should pass the path to the SyncedFiles constructor', function () {
            collection.foundRemote('myPath','myHash');
            expect(SyncedFileStub).to.have.been.calledOnce;
            expect(SyncedFileStub).to.have.been.calledWith('myPath');
        });

        it('should not create new SyncedFiles for paths it already knows about', function () {
            collection.foundRemote('myPath','myHash');
            expect(SyncedFileStub).to.have.been.calledOnce;
            collection.foundRemote('myPath','myHash');
            expect(SyncedFileStub).to.have.been.calledOnce;
        });

        it('should create new SyncedFiles on subsequent calls if it has never seen that particular path before', function () {
            collection.foundRemote('myPath','myHash');
            expect(SyncedFileStub).to.have.been.calledOnce;
            collection.foundRemote('myPath2','myHash2');
            expect(SyncedFileStub).to.have.been.calledTwice;
            expect(SyncedFileStub).to.have.been.calledWith('myPath');
            expect(SyncedFileStub).to.have.been.calledWith('myPath2');
        });

        it('should not create new SyncedFiles if it was already found locally', function () {
            collection.foundFile('myPath');
            expect(SyncedFileStub).to.have.been.calledOnce;
            collection.foundRemote('myPath','someHash');
            expect(SyncedFileStub).to.have.been.calledOnce;
        });

        it('should call SyncedFile.foundRemote on newly discovered paths',function(){
            collection.foundRemote('myPath','myHash');
            expect(fileStub(0).foundRemote).to.have.been.calledOnce;
            expect(fileStub(0).foundRemote).to.have.been.calledWith('myHash');
        });

        it('should call SyncedFile.foundRemote on paths previously discovered by remote',function(){
            collection.foundFile('myPath');
            expect(fileStub(0).foundRemote).not.to.have.been.calledOnce;
            collection.foundRemote('myPath','myHash');
            expect(fileStub(0).foundRemote).to.have.been.calledOnce;
            expect(fileStub(0).foundRemote).to.have.been.calledWith('myHash');
        });
    });

    describe('globDone',function(){
        it('should call globDone on each SyncedFile created',function(){
            collection.foundFile('myFile');
            collection.foundFile('yourFile');
            collection.globDone();
            expect(fileStub(0).globDone).to.have.been.called;
            expect(fileStub(1).globDone).to.have.been.called;
        });
    });

    describe('remoteDone',function(){
        it('should call remoteDone on each SyncedFile created', function () {
            collection.foundFile('myFile');
            collection.foundFile('yourFile');
            collection.remoteDone();
            expect(fileStub(0).remoteDone).to.have.been.called;
            expect(fileStub(1).remoteDone).to.have.been.called;
        });
    });

    describe('allDone',function(){

        it('is pending prior to globDone', function (done) {
            collection.remoteDone();
            later()(function(){
                expect(collection.allDone.isPending()).to.be.true;
            }).then.notify(done);
        });

        it('is pending prior to remoteDone', function (done) {
            collection.globDone();
            later()(function(){
                expect(collection.allDone.isPending()).to.be.true;
            }).then.notify(done);
        });

        it('is fulfilled once glob and remote are done, and no files were found', function (done) {
            collection.globDone();
            collection.remoteDone();
            later()(function(){
                expect(collection.allDone.isFulfilled()).to.be.true;
            }).then.notify(done);
        });

        it('is fulfilled once glob and remote are done, and only local files were found', function (done) {
            //Relies on implementation details of SyncedFile - can't use a stub
            collection = new SyncedFileCollection();
            collection.foundFile('file1');
            collection.foundFile('file2');
            collection.globDone();
            collection.remoteDone();
            later()(function(){
                expect(collection.allDone.isFulfilled()).to.be.true;
            }).then.notify(done);
        });

        it('is fulfilled once glob and remote are done, and only remote files were found', function (done) {
            //Relies on implementation details of SyncedFile - can't use a stub
            collection = new SyncedFileCollection();
            collection.foundRemote('file1','hash1');
            collection.foundRemote('file2','hash2');
            collection.globDone();
            collection.remoteDone();
            later()(function(){
                expect(collection.allDone.isFulfilled()).to.be.true;
            }).then.notify(done);
        });

        var fileUtilsStub = require('../test-lib/file-utils-stub');
        afterEach(function(){
            fileUtilsStub.restore();
        });

        var SyncedFile = requireCov('../src/SyncedFile');

        function SyncedFileWithStubbedFileSystem(fileName){
            return new SyncedFile(fileName,fileUtilsStub);
        }

        it('is fulfilled once glob and remote are done, and all found files matched', function (done) {
            //Relies on implementation details of SyncedFile - can't use a stub
            collection = new SyncedFileCollection(SyncedFileWithStubbedFileSystem);
            collection.foundRemote('file1','hash1');
            collection.foundRemote('file2','hash2');
            collection.foundFile('file1');
            collection.globDone();
            collection.remoteDone();
            later()(function(){
                var promise = fileUtilsStub.getContentHash.withArgs('file1').firstCall.returnValue;
                promise._deferred.resolve('hash1');
                return later(); //adds an additional delay
            }).then(function(){
                expect(collection.allDone.isFulfilled()).to.be.true;
            }).then.notify(done);
        });


        it('is fulfilled once glob and remote are done, and all found files don\'t match', function (done) {
            //Relies on implementation details of SyncedFile - can't use a stub
            collection = new SyncedFileCollection(SyncedFileWithStubbedFileSystem);
            collection.foundRemote('file1','hash1');
            collection.foundRemote('file2','hash2');
            collection.foundFile('file1');
            collection.globDone();
            collection.remoteDone();
            later()(function(){
                var promise = fileUtilsStub.getContentHash.withArgs('file1').firstCall.returnValue;
                promise._deferred.resolve('hash1b');
                return later(); //adds an additional delay
            }).then(function(){
                    expect(collection.allDone.isFulfilled()).to.be.true;
                }).then.notify(done);
        });




    });


});

