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

module.exports = S3Stub;