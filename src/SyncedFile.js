//var fileUtils = require('./file-utils.js');

function SyncedFile (path,fileUtils,Q){
    fileUtils = fileUtils || require( './file-utils.js');
    Q = Q || require('Q');


    var exists = Q.defer();

    var remoteHash = Q.defer();


    function foundFile(){
        exists.resolve(true);
    }


    function globDone(){
        exists.resolve(false);
    }

    function foundRemote(hash){
        remoteHash.resolve(hash);
    }

    function remoteDone(){
        remoteHash.resolve(false);
    }

    this.foundFile = foundFile;
    this.foundRemote = foundRemote;
    this.globDone = globDone;
    this.remoteDone = remoteDone;

    var action = Q.defer();
    this.action = action.promise;

    Q.spread([exists.promise,remoteHash.promise],function(exists,remoteHash){
        if(exists && remoteHash){
            fileUtils.getContentHash(path).then(
                function(localHash){
                    if(localHash === remoteHash){
                        action.resolve('nothing');
                    }
                    else {
                        action.resolve('upload');
                    }
                },
                action.reject
            )
        }
        else if(exists){
            action.resolve('upload');
        }
        else if(remoteHash){
            action.resolve('delete');
        }
        else {
            action.reject('This should never happen');
            throw new Error('this should never happen!');
        }
    });
}

module.exports = SyncedFile;