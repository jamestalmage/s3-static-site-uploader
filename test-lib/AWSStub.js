var AWSStub = {
    config:{
        loadFromPath:sinon.spy(),
        update:sinon.spy()
    },
    S3:require('./S3Stub.js'),
    reset:function(){
        AWSStub.config.loadFromPath.reset();
        AWSStub.config.update.reset();
        AWSStub.S3.reset();
    }
};

module.exports=AWSStub;

