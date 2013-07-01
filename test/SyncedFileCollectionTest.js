var chai = require('chai');
var sinon = require('sinon');

chai.use(require('sinon-chai'));
chai.use(require('chai-things'));

var expect = chai.expect;

var SyncedFileCollection = require('../src/SyncedFileCollection.js');


describe('SyncedFileCollection', function () {

    var SyncedFileStub, collection;

    beforeEach(function(){
        SyncedFileStub = sinon.spy(require('./SyncedFileStub.js'));
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


});

