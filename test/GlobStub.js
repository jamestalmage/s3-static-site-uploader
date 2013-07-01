var sinon = require('sinon');

function Glob(){

    var thisGlob = this;

    this.on = sinon.stub();

    this.on.returns(this);

    this.fire = function(eventType,remainingArgs){
        remainingArgs = Array.prototype.slice.call(arguments,1);
        thisGlob.on.args.forEach(function(args){
            if(eventType === args[0]){
                args[1].apply(thisGlob,remainingArgs);
            }
        });
    };

}


module.exports = Glob;