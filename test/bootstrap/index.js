global.chai = require('chai');
global.sinon = require('sinon');
global.expect = chai.expect;
global.match = sinon.match;

chai.use(require('../../test-lib/BufferHelper.js'));
chai.use(require('sinon-chai'));
chai.use(require('chai-things'));

var Q = require('Q');
Q.longStackSupport = true;
var PromiseEngine = require('promise-testing/index.js');
var engine = new PromiseEngine();

var chaiFlavor = require('promise-testing/lib/chai-flavor');

engine.scanChai(chai);

global.engine = engine;
global.requireCov = function(path){
    if(process && process.env && process.env.S3_UPLOAD_COV){
        path = path.replace('../src/','../../src-cov/');
    }
    else {
        path = path.replace('../src/','../../src/');
    }
    return require(path);
};

function after(time,result){
    var deferred = Q.defer();

    setTimeout(deferred.resolve.bind(deferred,result),time);

    return engine.wrap(deferred.promise).then;
}

global.later = after;

