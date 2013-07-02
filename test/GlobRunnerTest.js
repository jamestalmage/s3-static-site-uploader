var GlobRunner = requireCov('../src/GlobRunner.js');

describe('GlobRunner', function () {

    var globRunner,patterns,GlobStub,glob,CollectionStub,collection;

    function new_GlobRunner(){
        //constructor injection of stubs
        var ret = new GlobRunner(new CollectionStub(),GlobStub);

        engine.patch(ret,'run');

        return ret;

    }

    beforeEach(function(){
        GlobStub = sinon.spy(require('./GlobStub.js'));
        CollectionStub = sinon.spy(require('./SyncedFileCollectionStub.js'));
        expect(GlobStub).not.to.have.been.called; //proof counter has been reset.
        expect(CollectionStub).not.to.have.been.called; //proof counter has been reset.

        globRunner = new_GlobRunner();
        patterns = function (){
            return globRunner.getPatterns();
        };
        glob = function(index){
            return GlobStub.thisValues[index];
        };
        collection = function(index){
            return CollectionStub.thisValues[index];
        };
    });

    it('constructor creates a new SyncedFileCollection',function(){
        //constructor called in beforeEach
        expect(CollectionStub)
            .to.have.been.calledOnce
            .and.calledWithNew;
        new_GlobRunner();
        expect(CollectionStub)
            .to.have.been.calledTwice
            .and.to.have.always.been.calledWithNew;
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

            expect(GlobStub)
                .to.have.been
                .calledTwice
                .and.calledWith('pattern1')
                .and.calledWith('pattern2')
                .and.always.calledWithNew;
        });

        it('adds an on(\'match\') listener', function(){
            globRunner.addPattern('pattern1');
            globRunner.run();

            expect(glob(0).on).to.have.been.calledWith('match',match.any);
        });

        it('adds an on(\'end\') listener', function(){
            globRunner.addPattern('pattern1');
            globRunner.run();

            expect(glob(0).on).to.have.been.calledWith('end',match.any);
        });

        it('triggering the onMatch listener will cause a matching foundFile call to the collection',function(){
            globRunner.addPattern('pattern1');
            globRunner.run();
            glob(0).fire('match','path/to/my/File');

            expect(collection(0).foundFile)
                .to.have.been
                .calledOnce
                .and.calledWith('path/to/my/File');
        });

        it('subsequent onMatch calls will continue adding to the collection',function(){
            globRunner.addPattern('pattern1');
            globRunner.run();
            glob(0).fire('match','path/to/File1');
            glob(0).fire('match','path/to/File2');

            expect(collection(0).foundFile)
                .to.have.been
                .calledTwice
                .and.calledWith('path/to/File1')
                .and.calledWith('path/to/File2');
        });

        it('multiple patterns can be used to add to the collection',function(){
            globRunner.addPattern('pattern1','pattern2');
            globRunner.run();

            glob(0).fire('match','path/to/File1');
            glob(1).fire('match','path/to/File2');

            expect(collection(0).foundFile)
                .to.have.been
                .calledTwice
                .and.calledWith('path/to/File1')
                .and.calledWith('path/to/File2');
        });

        it('once all the globs end it calls globDone on the collection',function(done){
            globRunner.addPattern('pattern1','pattern2');
            globRunner.run().then.expect(collection(0).globDone).to.have.been.called.then.notify(done);

            glob(0).fire('end');//,'path/to/File1');
            glob(1).fire('end');//,'path/to/File2');
        });

        it('an error in the glob should cause the run promise to reject',function(done){
            globRunner.addPattern('pattern1','pattern2');
            globRunner.run().then.expect.rejection.then.notify(done);

            glob(0).fire('end');//,'path/to/File1');
            glob(1).fire('error');//,'path/to/File2');
        });

    });

});
