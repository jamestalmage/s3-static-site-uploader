var GlobRunner = require('../src/GlobRunner.js');
var chai = require('chai');
var sinon = require('sinon');
var GlobStub = require('./GlobStub.js');

chai.use(require('sinon-chai'));
chai.use(require('chai-things'));

var expect = chai.expect;

describe('GlobRunner', function () {

    var globRunner,patterns,globStub;
    beforeEach(function(){
        globStub = sinon.spy(GlobStub);
        globRunner = new GlobRunner(globStub);
        patterns = function (){
            return globRunner.getPatterns();
        } ;
    });

    describe('addPattern',function(){

        it('should add the pattern to patterns',function(){
            globRunner.addPattern('testPattern');

           expect(patterns()).to.deep.equal(['testPattern']) ;
        });

        it('should not add the same pattern twice',function(){
            globRunner.addPattern('testPattern');
            globRunner.addPattern('testPattern');
            expect(patterns()).to.deep.equal(['testPattern']) ;
        });

        it('should add each argument as a pattern',function(){
            globRunner.addPattern('testPattern1','testPattern2');
            expect(patterns()).to.have.members(['testPattern1','testPattern2']);
            expect(patterns()).to.have.lengthOf(2);
        });

        it('should add each member of array arguments as a pattern',function(){
            globRunner.addPattern(['testPattern1','testPattern2']);
            expect(patterns()).to.have.members(['testPattern1','testPattern2']);
            expect(patterns()).to.have.lengthOf(2);
        });

        it('multiple array arguments are all added',function(){
            globRunner.addPattern(['testPattern1','testPattern2'],['testPattern3','testPattern4']);
            expect(patterns()).to.have.members(['testPattern1','testPattern2','testPattern3','testPattern4']);
            expect(patterns()).to.have.lengthOf(4);
        });

        it('adding with array will also prevent duplicate patterns',function(){
            globRunner.addPattern(['testPattern1','testPattern2'],['testPattern1','testPattern2']);
            expect(patterns()).to.have.members(['testPattern1','testPattern2']);
            expect(patterns()).to.have.lengthOf(2);
        });

    });

    describe('run',function(){

        it('creates a glob for each added pattern', function(){
            globRunner.addPattern('pattern1','pattern2');
            globRunner.run();
            expect(globStub).to.have.been.calledTwice;
            expect(globStub).to.have.always.been.calledWithNew;
            expect(globStub).to.have.been.calledWith('pattern1');
            expect(globStub).to.have.been.calledWith('pattern2');
        });

        it('it adds an on(\'match\') listener', function(){
            globRunner.addPattern('pattern1');
            globRunner.run();
            expect(globStub.thisValues[0].on).to.have.been.called;
            expect(globStub.thisValues[0].on).to.have.been.calledWith('match',sinon.match.any);
        });




    });

});
