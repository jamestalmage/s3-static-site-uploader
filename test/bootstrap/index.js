global.chai = require('chai');
global.sinon = require('sinon');
global.expect = chai.expect;
global.match = sinon.match;

chai.use(require('../../test-lib/BufferHelper.js'));
chai.use(require('sinon-chai'));
chai.use(require('chai-things'));

var PromiseEngine = require('promise-testing');
var engine = new PromiseEngine();
var chaiFlavor = require('promise-testing/lib/chai-flavor');

engine.use(chaiFlavor(chai));

global.engine = engine;

