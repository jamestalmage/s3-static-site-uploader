//var fileUtils = require('./file-utils.js');

function SyncedFile (path,fileUtils,Q){
    fileUtils = fileUtils || require( './file-utils.js');
    Q = Q || require('Q');

    var del = Q.defer();
    var upload = Q.defer();
    var remoteHash = Q.defer();
    var action = Q.defer();

    function foundFile(){
        del.resolve(false);
    }

    function globDone(){
        del.resolve(true);
    }

    function foundRemote(hash){
        remoteHash.resolve(hash);
    }

    function remoteDone(){
        remoteHash.resolve(false);
    }

    Q.spread([del.promise,remoteHash.promise],function(del,remoteHash){
        var exists = !del;
        if(exists && remoteHash){
            fileUtils.getContentHash(path).then(
                function(localHash){
                    if(localHash === remoteHash){
                        upload.resolve(false);
                        action.resolve('nothing');
                    }
                    else {
                        upload.resolve(true);
                        action.resolve('upload');
                    }
                },
                action.reject
            )
        }
        else if(exists){
            upload.resolve(true);
            action.resolve('upload');
        }
        else if(remoteHash){
            upload.resolve(false);
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