function S3PromiseWrapperStub(){
    var thisStub = this;
    [
        'createReadAllBucketPolicy',
        'checkBucketName',
        'createBucket',
        'headBucket',
        'putBucketPolicy',
        'putObject',
        'putBucketWebsite',
        'listObjects',
        'deleteObjects'
    ].forEach(function(fn){
            thisStub[fn] = sinon.spy(function (){
                var defer = require('q').defer();
                defer.promise._defer = defer;
                return defer.promise;
            });
        }
    );
}

var s3Spy = sinon.spy(S3PromiseWrapperStub);

s3Spy.instance = function(index){
    return s3Spy.thisValues[index];
};

module.exports = s3Spy;
