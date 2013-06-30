var GlobRunner = require('../src/GlobRunner.js');
var chai = require('chai');
var sinon = require('sinon');
chai.use(require('sinon-chai'));
chai.use(require('chai-things'));

var expect = chai.expect;

describe('GlobRunner', function () {

    describe('addPattern',function(){
        var globRunner,patterns;
        beforeEach(function(){
            globRunner = new GlobRunner();
            patterns = function (){
                    return globRunner.getPatterns();
                } ;
        });

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


    })

});
