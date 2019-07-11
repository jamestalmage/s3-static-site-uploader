var RemoteRunner = requireCov('../src/RemoteRunner.js');
var SyncedFileCollectionStub = require('../test-lib/SyncedFileCollectionStub.js');
var S3PromiseWrapperStub = require('../test-lib/S3PromiseWrapperStub.js');
var ExcludeFilter = require('../src/ExcludeFilter.js');

describe('RemoteRunner', function () {
    var remoteRunner,s3Wrapper,collection,filter;

    beforeEach(function(){

        collection = new SyncedFileCollectionStub();
        s3Wrapper = new S3PromiseWrapperStub();
        filter = new ExcludeFilter();
        remoteRunner = new RemoteRunner('myBucket',collection,s3Wrapper,filter);
    });

    afterEach(function(){
        S3PromiseWrapperStub.reset();
    });

    describe('run', function () {
        it('lists the files in the bucket', function () {
            remoteRunner.run();

            expect(s3Wrapper.listObjects)
                .to.have.been.called;
        });

        it('it calls foundRemote on the collection for each remote path found ', function(done){
            remoteRunner.run();
            var lop = s3Wrapper.listObjects.firstCall.returnValue;

            lop._defer.resolve({
                IsTruncated:false,
                Contents:[
                    {Key:'file1',ETag:'"tag1"'},{Key:'file2',ETag:'"tag2"'}
                ]
            });

            later().expect(collection.foundRemote)
                .to.have.been.calledTwice
                .and.calledWith('file1','tag1')
                .and.calledWith('file2','tag2')
                .then.notify(done);
        });

        it('it does not call foundRemote for ignored paths', function(done){
            filter.addPattern('file1');

            remoteRunner.run();
            var lop = s3Wrapper.listObjects.firstCall.returnValue;

            lop._defer.resolve({
                IsTruncated:false,
                Contents:[
                    {Key:'file1',ETag:'"tag1"'},{Key:'file2',ETag:'"tag2"'}
                ]
            });

            later().expect(collection.foundRemote)
                .to.have.been.calledOnce
                .and.calledWith('file2','tag2')
                .then.notify(done);
        });

        it('once the listObjects returns there are no more values (IsTruncated == false) call remoteDone ', function(done){
            remoteRunner.run();
            var lop = s3Wrapper.listObjects.firstCall.returnValue;

            lop._defer.resolve({
                IsTruncated:false,
                Contents:[
                    {Key:'file1',ETag:'"tag1"'},{Key:'file2',ETag:'"tag2"'}
                ]
            });

            later().expect(collection.remoteDone).to.have.been.called.then.notify(done);
        });

        it('if listObjects result is truncated, fetch more of the list') ;


    });
});
