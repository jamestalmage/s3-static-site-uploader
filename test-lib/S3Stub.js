function S3Stub(){
    var thisStub = this;
    [
        'createBucket',
        'headBucket',
        'putBucketPolicy',
        'putObject',
        'putBucketWebsite',
        'listObjects',
        'deleteObjects'
    ].forEach(function(fn){thisStub[fn] = sinon.stub();});
}

var s3StubSpy = sinon.spy(S3Stub);

s3StubSpy.instance = function(index){
    return s3StubSpy.thisValues[index];
};

module.exports = s3StubSpy;