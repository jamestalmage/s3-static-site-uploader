function SyncedFileCollectionStub(){
    this.foundFile = sinon.spy();
    this.foundRemote = sinon.spy();
    this.globDone = sinon.spy();
    this.remoteDone = sinon.spy();
}

module.exports = SyncedFileCollectionStub;