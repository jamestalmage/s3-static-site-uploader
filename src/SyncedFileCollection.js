
function SyncedFileCollection(SyncedFile){
    SyncedFile = SyncedFile || require('./SyncedFile.js');

    var map = {};

    function get(path){
        return map[path] || (map[path] = new SyncedFile(path));
    }

    function foundFile(path){
        get(path).foundFile();
    }

    function foundRemote(path,hash){
        get(path).foundRemote(hash);
    }

    function globDone(){
        for(var i in map){
            if(map.hasOwnProperty(i)){
                map[i].globDone();
            }
        }
    }

    this.foundFile = foundFile;
    this.foundRemote = foundRemote;
    this.globDone = globDone;
}

module.exports = SyncedFileCollection;