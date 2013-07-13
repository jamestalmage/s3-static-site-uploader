'use strict';

var fs = require('fs');
var Q = require('q');
var fileUtils = requireCov('../src/file-utils.js');


describe('file utils throttling', function () {
    var sandbox,fileName,options,callback,resolved;

    function readSuccess(index, result) {
        resolved[index] = true;
        callback[index]({}.undefinedStuff,result);
    }
    function readError(index, reason) {
        resolved[index] = true;
        callback[index](reason);
    }


    beforeEach(function(){
        sandbox = sinon.sandbox.create();
        fileName = [];
        options = [];
        callback = [];
        resolved = [];
        sandbox.stub(fs,'readFile',function(_filename,_opts,_callback){
            if(typeof _opts === 'function'){
                _callback = _opts;
                _opts = null;
            }
            resolved.push(false);
            fileName.push(_filename);
            options.push(_opts);
            callback.push(_callback);
        });
    });

    afterEach(function(){
        sandbox.restore();
        for(var i = 0; i < resolved.length; i++){
            if(!resolved[i]){
                readError(i,new Error("closing down test"));
            }
        }
    });

    describe('should honor the MAX_OPEN value',function(){
        it('when max is set to 2', function(done){
            fileUtils.MAX_OPEN = 2;
            fileUtils.getContents('test1.txt');
            fileUtils.getContents('test2.txt');
            fileUtils.getContents('test3.txt');
            fileUtils.getContents('test4.txt');

            later().then.expect(fs.readFile).to.have.been.calledTwice.then.notify(done);

        });

        it('when max is set to 3', function (done) {

            fileUtils.MAX_OPEN = 3;
            fileUtils.getContents('test1.txt');
            fileUtils.getContents('test2.txt');
            fileUtils.getContents('test3.txt');
            fileUtils.getContents('test4.txt');

            later().then.expect(fs.readFile).to.have.been.calledThrice.then.notify(done);
        });
    });

    it('should call delayed reads as other reads close',function(done){


        fileUtils.MAX_OPEN = 2;
        var c1 = fileUtils.getContents('test1.txt').then.expect.result.to.equal('Contents1');
        var c2 = fileUtils.getContents('test2.txt').then.expect.result.to.equal('Contents2');
        var c3 = fileUtils.getContents('test3.txt').then.expect.result.to.equal('Contents3');
        var c4 = fileUtils.getContents('test4.txt').then.expect.result.to.equal('Contents4');

        later().then.
            expect(fs.readFile).to.have.been.calledTwice
            .then(function(){
                readSuccess(0,'Contents1');
            })
            .then.expect(fs.readFile).to.have.been.calledThrice
            .then(function(){
                readSuccess(1,'Contents2');
                readSuccess(2,'Contents3');
            })
            .then(function(){
                expect(fs.readFile.callCount).to.equal(4);
                readSuccess(3,'Contents4');
                return Q.all([c1,c2,c3,c4])
            })
            .then.notify(done);
    });

    it('reducing MAX_OPEN will prevent further reads until openCount is sufficiently reduced',function(done){

        fileUtils.MAX_OPEN = 3;
        var c1 = fileUtils.getContents('test1.txt').then.expect.result.to.equal('Contents1');
        var c2 = fileUtils.getContents('test2.txt').then.expect.result.to.equal('Contents2');
        var c3 = fileUtils.getContents('test3.txt').then.expect.result.to.equal('Contents3');
        var c4 = fileUtils.getContents('test4.txt').then.expect.result.to.equal('Contents4');

        later().then.
            expect(fs.readFile).to.have.been.calledThrice
            .then(function(){
                fileUtils.MAX_OPEN = 2;
                readSuccess(0,'Contents1');
            })
            .then.expect(fs.readFile).to.have.been.calledThrice
            .then(function(){
                fileUtils.MAX_OPEN = 1;
                readSuccess(1,'Contents2');
            })
            .then.expect(fs.readFile).to.have.been.calledThrice
            .then(function(){
                readSuccess(2,'Contents3');
            })
            .then(function(){
                expect(fs.readFile.callCount).to.equal(4);
                readSuccess(3,'Contents4');
                return Q.all([c1,c2,c3,c4])
            })
            .then.notify(done);
    });


    it('reducing MAX_OPEN will prevent further reads until openCount is sufficiently reduced',function(done){

        fileUtils.MAX_OPEN = 2;
        var c1 = fileUtils.getContents('test1.txt').then.expect.result.to.equal('Contents1');
        var c2 = fileUtils.getContents('test2.txt').then.expect.result.to.equal('Contents2');
        var c3 = fileUtils.getContents('test3.txt').then.expect.result.to.equal('Contents3');
        var c4 = fileUtils.getContents('test4.txt').then.expect.result.to.equal('Contents4');

        later().then.
            expect(fs.readFile).to.have.been.calledTwice
            .then(function(){
                fileUtils.MAX_OPEN = 3;
            })
            .then.expect(fs.readFile).to.have.been.calledThrice
            .then(function(){
                fileUtils.MAX_OPEN = 4;
            })
            .then(function(){
                expect(fs.readFile.callCount).to.equal(4);
                readSuccess(0,'Contents1');
                readSuccess(1,'Contents2');
                readSuccess(2,'Contents3');
                readSuccess(3,'Contents4');
                return Q.all([c1,c2,c3,c4])
            })
            .then.notify(done);
    });


});
