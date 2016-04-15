function TestHook(SyncedFile,Q)   {
SyncedFile = SyncedFile || require('./SyncedFile.js');
Q = Q || require('q');
Path = require('path');

return function SyncedFileCollection(source){

    var map = {};
    var actions = [];

    var cwd = Path.resolve(process.cwd(), source);

    function get(path){
        var obj = map[path];
        if(!obj){
            obj = map[path] = new SyncedFile(path, cwd);
            actions.push(obj.action);
            if(isGlobDone){
                obj.globDone();
            }
            if(isRemoteDone){
                obj.remoteDone();
            }
        }
        return obj;
    }

    function foundFile(path){
        if(isGlobDone) throw new Error('Glob is supposed to be done');
        get(path).foundFile();
    }

    function foundRemote(path,hash){
        if(isRemoteDone) throw new Error('Remote is supposed to be done');
        get(path).foundRemote(hash);
    }

    var isGlobDone = false;
    var isRemoteDone = false;
    var scansDone = Q.defer();

    function globDone(){
        if(isGlobDone) throw new Error('globDone already called');
        isGlobDone = true;
        for(var i in map){
            if(map.hasOwnProperty(i)){
                map[i].globDone();
            }
        }
        if(isRemoteDone) scansDone.resolve();
    }

    function remoteDone(){
        if(isRemoteDone) throw new Error('remoteDone already called');
        isRemoteDone = true;
        for(var i in map){
            if(map.hasOwnProperty(i)){
                map[i].remoteDone();
            }
        }
        if(isGlobDone) scansDone.resolve();
    }

    this.cwd = cwd;

    this.foundFile = foundFile;
    this.foundRemote = foundRemote;
    this.globDone = globDone;
    this.remoteDone = remoteDone;

    this.allDone = scansDone.promise.then(function(){
        return Q.all(actions);
    });

};
}

var SyncedFileCollection = TestHook();
SyncedFileCollection.TestHook = TestHook;

module.exports = SyncedFileCollection;
