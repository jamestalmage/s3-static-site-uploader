
function RemoteRunnerStub(){
    this.run = sinon.spy();
}

var remoteRunnerStub = sinon.spy(RemoteRunnerStub);

remoteRunnerStub.instance = function(index){
    return remoteRunnerStub.thisValues[index];
};

module.exports = remoteRunnerStub;