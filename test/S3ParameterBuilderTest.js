var builder = requireCov('../src/S3ParameterBuilder.js');

chai.use(function(chai, utils){
    chai.Assertion.addProperty('parsed',function(){
        var obj = this._obj;
        new chai.Assertion(obj).to.be.a.string;
        this._obj = JSON.parse(obj);
    });

    chai.Assertion.addProperty('bucketName',function(){
        return this.property('Bucket');
    });
});

describe('S3ParameterBuilder',function(){
    describe('createBucket', function () {
        it('adds the bucket name to the json object', function () {
            expect(builder.createBucket('myBucket')).to.deep.equal({Bucket:'myBucket'});
        });
    });

    describe('headBucket', function () {
        it('adds the bucket name to the json object', function () {
            expect(builder.headBucket('myBucket')).to.deep.equal({Bucket:'myBucket'});
        });
    });

    describe('bucketPolicy', function () {
        it('adds the bucket name to the json object', function () {
            expect(builder.putBucketPolicy('myBucket', {policyStuff: 'blah'})).to.have.bucketName.equal('myBucket');
        });

        it('adds the stringified policy to the JSON object', function(){
            expect(builder.putBucketPolicy('myBucket', {policyStuff: 'blah'}))
                .to.have.property('Policy').parsed.deep.equal({policyStuff:'blah'});
        });
    });

    describe('putObject', function () {
        function expectPutObject(fileName,mimeType){return expect(builder.putObject('myBucket',fileName || 'myKey','theBody', mimeType));}

        it('adds the bucket name to the json object', function () {
            expectPutObject().to.have.bucketName.equal('myBucket');
        });
        it('adds the key to to the JSON object', function() {
            expectPutObject().to.have.property('Key','myKey');
        });
        it('adds the body to the JSON object', function() {
            expectPutObject().to.have.property('Body','theBody');
        });
        it('figures out the content type of a \'.txt\' file and adds it to the JSON object', function(){
            expectPutObject('myFile.txt').to.have.property('ContentType','text/plain');
        });
        it('figures out the content type of a \'.html\' file and adds it to the JSON object', function(){
            expectPutObject('myFile.html').to.have.property('ContentType','text/html');
        });
        it('allows explicit setting of the mime type',function(){
            expectPutObject('myFile.txt','text/html').to.have.property('ContentType','text/html');
        })
    });

    describe('listObjects',function(){
        it('adds the bucket name to the parameter object', function () {
            expect(builder.listObjects('myBucket')).to.have.bucketName.equal('myBucket');
        });

        it('adds the prefix to the parameter object if present', function(){
            expect(builder.listObjects('myBucket','myPrefix')).to.have.property('Prefix','myPrefix');
        });

        it('does not add prefix to the parameter object if not specified', function(){
            expect(builder.listObjects('myBucket')).not.to.have.property('Prefix');
        });
    });

    describe('deleteObjects', function () {
        it('adds the bucket name to the parameter object', function () {
            expect(builder.deleteObjects('myBucket',['obj1','obj2'])).to.have.bucketName.equal('myBucket');
        });

        it('will delete a single object', function () {
            expect(builder.deleteObjects('myBucket',['obj1']))
                .to.have.property('Delete')
                .deep.equal({Objects:[{Key:'obj1'}]});
        });

        it('will delete multiple objects', function () {
            expect(builder.deleteObjects('myBucket',['obj1','obj2']))
                .to.have.property('Delete')
                .deep.equal({Objects:[{Key:'obj1'},{Key:'obj2'}]});
        });
    });

    describe('putBucketWebsite', function () {
        it('adds the bucket name to the parameter object', function () {
            expect(builder.putBucketWebsite('myBucket','index.html','error.html')).to.have.bucketName.equal('myBucket');
        });
        it('adds the index file to the parameter object', function () {
            expect(builder.putBucketWebsite('myBucket','index.html','error.html'))
                .to.have.deep.property('WebsiteConfiguration.IndexDocument.Suffix').equal('index.html');
        });
        it('adds the error file to the parameter object', function () {
            expect(builder.putBucketWebsite('myBucket','index.html','error.html'))
                .to.have.deep.property('WebsiteConfiguration.ErrorDocument.Key').equal('error.html');
        });
    });


});