function TestHook(fileUtils,Q){
fileUtils = fileUtils || require( './file-utils.js');
Q = Q || require('q');

return function SyncedFile (path){

    var del = Q.defer();
    var upload = Q.defer();
    var remoteHash = Q.defer();
    var action = Q.defer();

    function foundFile(){
        resolveDelete(false);
    }

    function globDone(){
        resolveDelete(true);
    }

    function foundRemote(hash){
        remoteHash.resolve(hash);
    }

    function remoteDone(){
        remoteHash.resolve(false);
    }

    function resolveDelete(_del){
        del.resolve({'delete':_del,path:path});
    }

    function resolveUpload(_upload) {
        upload.resolve({'upload':_upload,path:path});
    }

    function resolveAction(_action){
        action.resolve({'action':_action,path:path});
    }

    Q.spread([del.promise,remoteHash.promise],function(del,remoteHash){
        var exists = !del.delete;
        if(exists && remoteHash){
            fileUtils.getContentHash(path).then(
                function(localHash){
                    if(localHash === remoteHash){
                        resolveUpload(false);
                        resolveAction('nothing');
                    }
                    else {
                        resolveUpload(true);
                        resolveAction('upload')
                    }
                },
                function(reason){
                    console.log(reason);
                    action.reject(reason);
                    throw reason;
                }
            )
        }
        else if(exists){
            resolveUpload(true);
            resolveAction('upload');
        }
        else if(remoteHash){
            resolveUpload(false);
            resolveAction('delete');
        }
        else {
            console.log('THIS SHOULD NEVER HAPPEN - SyncedFile in impossible state');
            action.reject('This should never happen');
            throw new Error('this should never happen!');
        }
    }).done();

    this.foundFile = foundFile;
    this.foundRemote = foundRemote;
    this.globDone = globDone;
    this.remoteDone = remoteDone;
    this.action = action.promise;
    this.delete = del.promise;
    this.upload = upload.promise;
};
}

var SyncedFile = TestHook();
SyncedFile.TestHook = TestHook;

module.exports = SyncedFile;
