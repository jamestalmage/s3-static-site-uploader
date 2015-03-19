function TestHook(Q, paramBuilder){
    Q = Q || require('q');

    paramBuilder = paramBuilder || require('./S3ParameterBuilder.js')



function S3PromiseWrapper(s3Instance){
    this._s3 = s3Instance;
}

S3PromiseWrapper.prototype.checkBucketName = function(bucketName){
    var _defer = Q.defer();
    this.headBucket(bucketName).then(
        function(result){
            _defer.resolve('owned');
        },
        function(reason){
            switch(reason.statusCode) {
                case 403:
                    _defer.resolve('forbidden');
                    break;
                case 404:
                    _defer.resolve('available');
                    break;
                default:
                    _defer.reject(reason);
            }
        }
    );
    return _defer.promise;
};

S3PromiseWrapper.createReadAllBucketPolicy = function(bucketName){
    return {
        "Version": "2008-10-17",
        "Statement": [
            {
                "Sid": "PublicReadForGetBucketObjects",
                "Effect": "Allow",
                "Principal": {
                    "AWS": "*"
                },
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::" + bucketName + "/*"
            }
        ]
    };
};

function addParameterFunction(functionName){
    S3PromiseWrapper.prototype[functionName] = function(){
        var params = paramBuilder[functionName].apply(this,arguments);
        return Q.ninvoke(this._s3,functionName,params);
    }
}

for(var i in paramBuilder){
    if(paramBuilder.hasOwnProperty(i)){
        addParameterFunction(i);
    }
}
return S3PromiseWrapper;

}

var S3PromiseWrapper = TestHook();
S3PromiseWrapper.TestHook = TestHook;

module.exports = S3PromiseWrapper;
