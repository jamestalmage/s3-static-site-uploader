var Q = require('Q');


function S3PromiseWrapper(s3Instance){
    this._s3 = s3Instance;
}

S3PromiseWrapper.prototype.headBucket = function(bucketName){
    var _defer = Q.defer();
    Q.ninvoke(this._s3,'headBucket',{Bucket:bucketName}).then(
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

module.exports = S3PromiseWrapper;