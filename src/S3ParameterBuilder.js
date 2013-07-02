var mime = require('mime');

var createParams = {
    createBucket:function(bucketName){
        return {
            Bucket: bucketName
        };
    },
    /*
     *  exists and is readable - promise resolves
     *  does not exist - promise rejected with code 404 (NotFound)
     *  exists and is forbidden - 403(Forbidden)
     */
    headBucket:function(bucketName){
        return {
            Bucket:bucketName
        };
    },
    putBucketPolicy:function(bucketName,policy){
        var policyString = JSON.stringify(policy);

        return {
            Bucket:bucketName,
            Policy:policyString
        };
    },
    putObject:function(bucketName, key, body, mimeType){
        mimeType = mimeType || mime.lookup(key);

        // console.log(body);
        return {
            Bucket:bucketName,
            Key: key,
            Body: body,//new Buffer(body),
            ContentType: mimeType
        };
    },
    putBucketWebsite:function(bucketName,index,error) {
        var params = {
            Bucket:bucketName,
            WebsiteConfiguration:{}
        };
        if(index){
            params.WebsiteConfiguration.IndexDocument = {
                Suffix:index
            };
        }
        if(error){
            params.WebsiteConfiguration.ErrorDocument = {
                Key:error
            };
        }
        return params;
    },
    listObjects:function(bucketName,prefix){
        var params = {
            Bucket:bucketName
        };
        if(prefix){
            params.Prefix = prefix;
        }
        return params;
    },
    deleteObjects:function(bucketName,keys){
        var objs = [];
        keys.forEach(function(key){
            objs.push({Key:key});
        });
        return {
            Bucket:bucketName,
            Delete:{Objects:objs}
        };
    }
};

module.exports = createParams;