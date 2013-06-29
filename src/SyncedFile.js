//var fileUtils = require('./file-utils.js');

function SyncedFile (path,fileUtils,Q){
    fileUtils = fileUtils || require( './file-utils.js');
    Q = Q || require('Q');


    var matchesGlob = false;

    var fetchingHash = false;
    var hashDefer = Q.defer();
    var hash = hashDefer.promise;

    var remoteHashDefer = Q.defer();
    var remoteHash = remoteHashDefer.promise;


    function foundFile(){
        matchesGlob = true;
        fetchHash();
    }

    function fetchHash(){
        if(fetchingHash) return;
        fetchingHash = true;
        fileUtils.getHashContents(path).then(hashDefer.resolve,hashDefer.reject).done();
    }

    function fetchHashIfFileExists(){
        if(fetchingHash) return;
        fileUtils.exists(path).then(function(exists){
            if(exists) {
                fetchHash();
            }
        }).done();
    }

    function foundRemote(hash){
        remoteHash.resolve(hash);
        fetchHashIfFileExists();
    }

    function globDone(){
        if(!fetchingHash){
            fetchingHash = true;
            hashDefer.resolve(false);
        }
    }

    function remoteDone(){
        if(remoteHash.isPending()){
            remoteHashDefer.resolve(false);
        }
    }

    this.foundFile = foundFile;
    this.foundRemote = foundRemote;
    this.globDone = globDone;
    this.remoteDone = remoteDone;

    var actionDefer = Q.defer();
    var action = actionDefer.promise;
    this.action = action;


    Q.spread([hash,remoteHash],function(hash,remoteHash){
        if(hash && remoteHash){
            if(hash === remoteHash){
                action.resolve('nothing');
            }
            else {
                action.resolve('upload');
            }
        }
        if(hash){
            action.resolve('upload');
        }
        if(remoteHash){
            action.resolve('delete');
        }
        throw new Error('this should never happen!');
    });


}

module.exports = SyncedFile;