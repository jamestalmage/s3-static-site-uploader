var sinon = require('sinon');

function Glob(){

    var thisGlob = this;

    this.on = sinon.stub();

    this.on.returns(this);

    this.fire = function(eventType,remainingArgs){
        remainingArgs = Array.prototype.slice.call(arguments,1);
        this.on.calls.forEach(function(onCall){
            if(eventType === onCall.arguments[0]){
                onCall.arguments[1].apply(thisGlob,remainingArgs);
            }
        });
    };

}


module.exports = Glob;