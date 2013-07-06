function SyncedFileCollectionStub(){
    this.foundFile = sinon.spy();
    this.foundRemote = sinon.spy();
    this.globDone = sinon.spy();
    this.remoteDone = sinon.spy();
}

var syncedFileSpy = sinon.spy(SyncedFileCollectionStub);

syncedFileSpy.instance = function(index){
    return syncedFileSpy.thisValues[index];
} ;

module.exports = syncedFileSpy;