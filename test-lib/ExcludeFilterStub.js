
function ExcludeFilterStub(){
    this.addPattern = sinon.spy();
    this.match = sinon.spy();
}

excludeFilterSpy = sinon.spy(ExcludeFilterStub);

excludeFilterSpy.instance = function(index){
    return excludeFilterSpy.thisValues[index];
};

module.exports= excludeFilterSpy;
