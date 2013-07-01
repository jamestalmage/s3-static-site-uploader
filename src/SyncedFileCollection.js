
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

    this.foundFile = foundFile;
    this.foundRemote = foundRemote;
}

module.exports = SyncedFileCollection;