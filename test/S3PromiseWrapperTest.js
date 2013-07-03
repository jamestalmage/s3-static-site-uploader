var S3Stub = require('./../test-lib/S3Stub.js');
var S3PromiseWrapper = requireCov('../src/S3PromiseWrapper.js');
var Q = require('Q');

engine.use(function(props,handlers){
    props.addProperty('firstCall',handlers.echoHandler);
    props.addProperty('callArgWith',handlers.executableEchoHandler);

    props.addProperty('on',handlers.buildHandler({recordExecution:['obj'],playback:function(lastResult,next,ctx){next(this.obj);}}));

})

describe('S3PromiseWrapper', function () {
    var s3, wrapper;

    beforeEach(function(){
        s3 = new S3Stub();
        wrapper = new S3PromiseWrapper(s3);
        engine.patch(wrapper,'headBucket');
        engine.patch(wrapper,'checkBucketName');
    });

    function later(result){
        return after(0,result);
    }

    function after(time,result){
        var deferred = Q.defer();

        setTimeout(deferred.resolve.bind(deferred,result),time);

        return engine.wrap(deferred.promise).then;
    }

    describe('checkBucketName', function () {
        it('calls headBucket on s3 with bucketName',function(done){
            wrapper.checkBucketName('myBucket');

            later().expect(s3.headBucket)
                .to.have.been
                .calledOnce
                .and.calledWith(match({Bucket:'myBucket'}))
                .then.notify(done);
        });

        it('existing buckets to which you have access (http success) resolve to "owned"',function(done){
            s3.headBucket.callsArgWithAsync(1,null,{RequestId: '955C7251CF7337EE'});
            wrapper.checkBucketName('myBucket').then.expect.result.to.equal('owned').then.notify(done);
        });

        it('existing buckets to which you do not have access (http error 403) resolve to "forbidden"',function(done){
            s3.headBucket.callsArgWithAsync(1,{statusCode: 403,code:'Forbidden',name:'Forbidden',retryable:false});
            wrapper.checkBucketName('myBucket').then.expect.result.to.equal('forbidden').then.notify(done);
        });

        it('non existent buckets (http error 404) resolve to "available"',function(done){
            s3.headBucket.callsArgWithAsync(1,{statusCode: 404,code:'NotFound',name:'NotFound',retryable:false});
            wrapper.checkBucketName('myBucket').then.expect.result.to.equal('available').then.notify(done);
        });

        it('other http errors reject the promise',function(done){
            s3.headBucket.callsArgWithAsync(1,
                {statusCode: 408, code:'RequestTimeout', name:'RequestTimeout',retryable:false}
            );
            wrapper.checkBucketName('myBucket').then.expect.rejection.deep.equal(
                {statusCode: 408, code:'RequestTimeout', name:'RequestTimeout',retryable:false}
            ).then.notify(done);
        });
    });
});