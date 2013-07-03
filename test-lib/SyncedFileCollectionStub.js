function SyncedFileCollectionStub(){
    this.foundFile = sinon.spy();
    this.foundRemote = sinon.spy();
    this.globDone = sinon.spy();
}

module.exports = SyncedFileCollectionStub;