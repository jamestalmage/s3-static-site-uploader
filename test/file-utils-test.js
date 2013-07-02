    'use strict';

    var fileUtils = requireCov('../src/file-utils.js');

    engine.patch(fileUtils,'getContents');
    engine.patch(fileUtils,'getContentHash');
    engine.patch(fileUtils,'exists');

    describe('file-utils',function(){

        var testFilePath,testFileHash;
        var testFilePath2,testFileHash2;

        beforeEach(function(){
            testFilePath = './test/testfile.txt';
            testFileHash = require('crypto').createHash('md5').update('hello!').digest('hex');

            testFilePath2 = './test/testfile2.txt';
            testFileHash2 = require('crypto').createHash('md5').update('goodbye!').digest('hex');
        });

        describe('getContents ',function(){
            it(' should fetch the contents of a single file', function (done) {
                fileUtils.getContents(testFilePath)
                    .then.expect.result.to.deep.equal(new Buffer('hello!'))
                    .then.notify(done);
            });

            it(' should fetch the contents of a file with the expected encoding', function (done) {
                fileUtils.getContents(testFilePath,'utf-8')
                    .then.expect.result.to.equal('hello!')
                    .then.notify(done);
            });

            it(' should fetch a Buffer with the file contents', function (done) {
                fileUtils.getContents(testFilePath)
                    .then.expect.result.to.have.utf8Contents.that.equal('hello!')
                    .then.notify(done);
            });

            it(' should fetch an array of files as an Array',function (done) {
                fileUtils.getContents([testFilePath,testFilePath2])
                    .then.expect.result.to.deep.equal([new Buffer('hello!'),new Buffer('goodbye!')])
                    .then.notify(done);
            });
            
        });

        describe('getHashOfContents',function(){
            it(' should fetch the hash value of the contents of a file', function (done) {
                fileUtils.getContentHash(testFilePath)
                    .then.expect.result.to.equal(testFileHash)
                    .then.notify(done);
            });

            it(' should fetch the hash value of multiple files as an Array', function (done) {
                fileUtils.getContentHash([testFilePath,testFilePath2])
                    .then.expect.result.to.deep.equal([testFileHash,testFileHash2])
                    .then.notify(done);
            });
        });

        describe('fileExists',function(){
            it(' should resolve to true if the file exists', function (done) {
                fileUtils.exists(testFilePath)
                    .then.expect.result.to.equal(true)
                    .then.notify(done);
            });
            it(' should resolve to false if the file does not exists', function (done) {
                fileUtils.exists('./nonexistentfilethereman.txt')
                    .then.expect.result.to.equal(false)
                    .then.notify(done);
            });
        })

    });


