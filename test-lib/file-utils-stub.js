
var Q = require('q');

var sandbox = sinon.sandbox.create();
function promiseStub(){
        var deferred = Q.defer();
        var promise = deferred.promise;
        promise._deferred = deferred;
        return promise;
}

function noOp(){}

var obj = {
    getContentHash:noOp,
    exists:noOp,
    getContents:noOp,
    restore:function(){
        sandbox.restore();
        sandbox.stub(obj,'getContentHash',promiseStub);
        sandbox.stub(obj,'exists',promiseStub);
        sandbox.stub(obj,'getContents',promiseStub);
    }
};

obj.restore();


module.exports=obj;
