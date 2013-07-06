var Q = require('Q');

function SyncedFileCollectionStub(){
    this.foundFile = sinon.spy();
    this.foundRemote = sinon.spy();
    this.globDone = sinon.spy();
    this.remoteDone = sinon.spy();
    this.allDoneDefer = Q.defer();
    this.allDone = this.allDoneDefer.promise;
}

var syncedFileSpy = sinon.spy(SyncedFileCollectionStub);

syncedFileSpy.instance = function(index){
    return syncedFileSpy.thisValues[index];
} ;

module.exports = syncedFileSpy;