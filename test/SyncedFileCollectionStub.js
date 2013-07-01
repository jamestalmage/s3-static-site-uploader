var sinon = require('sinon');

function SyncedFileCollectionStub(){
    this.foundFile = sinon.spy();
    this.foundRemote = sinon.spy();
}

module.exports = SyncedFileCollectionStub;