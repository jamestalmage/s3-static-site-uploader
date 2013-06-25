var AWS = require('aws-sdk');
var Q = require('Q');
var crypto = require('crypto');
var fs = require('fs');
var mime = require('mime');

Q.longStackSupport = true;

function md5(str){
    return crypto.createHash('md5').update(str).digest('hex');
}

function base64(str){
    return new Buffer(str).toString('base64');
}

function Constructor(){
    this._s3 = new AWS.S3();
}

Constructor.prototype = {
    md5:md5,
    base64:base64,
    loadCredentials:function(path){
        this._s3.config.loadFromPath(path);
    },
    readFile: Q.denodeify(fs.readFile),
    createReadAllBucketPolicy:function(bucketName){
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
    }
};

var createParams = require('./lib/s3-parameter.js');

function addParameterFunction(functionName){
    Constructor.prototype[functionName] = function(){
        var params = createParams[functionName].apply(this,arguments);
        return Q.ninvoke(this._s3,functionName,params);
    }
}

for(var i in createParams){
    if(createParams.hasOwnProperty(i)){
        addParameterFunction(i);
    }
}

module.exports = Constructor;
