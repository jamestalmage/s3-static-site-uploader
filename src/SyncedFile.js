//var fileUtils = require('./file-utils.js');

function SyncedFile (path,fileUtils,Q){
    fileUtils = fileUtils || require( './file-utils.js');
    Q = Q || require('Q');

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

    Q.spread([del.promise,remoteHash.promise],function(del,remoteHash){
        var exists = !del.delete;
        if(exists && remoteHash){
            fileUtils.getContentHash(path).then(
                function(localHash){
                    if(localHash === remoteHash){
                        resolveUpload(false);
                        action.resolve('nothing');
                    }
                    else {
                        resolveUpload(true);
                        action.resolve('upload');
                    }
                },
                action.reject
            )
        }
        else if(exists){
            resolveUpload(true);
            action.resolve('upload');
        }
        else if(remoteHash){
            resolveUpload(false);
            action.resolve('delete');
        }
        else {
            action.reject('This should never happen');
            throw new Error('this should never happen!');
        }
    });

    this.foundFile = foundFile;
    this.foundRemote = foundRemote;
    this.globDone = globDone;
    this.remoteDone = remoteDone;
    this.action = action.promise;
    this.delete = del.promise;
    this.upload = upload.promise;
}

module.exports = SyncedFile;