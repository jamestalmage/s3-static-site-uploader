var Q = require('Q');

function SyncedFileStub(){
    this.foundFile = sinon.spy();
    this.globDone = sinon.spy();
    this.foundRemote = sinon.spy();
    this.remoteDone = sinon.spy();
    this.actionDefer = Q.defer();
    this.action = this.actionDefer.promise;
}


module.exports = SyncedFileStub;