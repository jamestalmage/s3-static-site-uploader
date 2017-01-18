#!/usr/bin/env node
var ConfigRunner = require('../src/ConfigRunner.js');
var path = require('path');

var runner = new ConfigRunner();


var configPath = process.argv[2] || './aws-upload.conf.js';

var config = require(path.resolve(configPath));

runner.setConfig(config);

runner.run();
