
var Q = require('Q');

var sandbox = sinon.sandbox.create();
function promiseStub(){
        var deferred = Q.defer();
        var promise = deferred.promise;
        promise._deferred = deferred;
    promise.toString = function(){return "HELLOOOO"};
        return promise;
}

function noOp(){}

var obj = {
    getContentHash:noOp,
    exists:noOp,
    restore:function(){
        sandbox.restore();
        sandbox.stub(obj,'getContentHash',promiseStub);
        sandbox.stub(obj,'exists',promiseStub);
    }
};

obj.restore();


module.exports=obj;
