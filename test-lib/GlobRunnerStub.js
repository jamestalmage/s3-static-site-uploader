
function GlobRunnerStub(){
    this.addPattern = sinon.spy();
    this.run = sinon.spy();
}

globRunnerSpy = sinon.spy(GlobRunnerStub);

globRunnerSpy.instance = function(index){
    return globRunnerSpy.thisValues[index];
};

module.exports= globRunnerSpy;