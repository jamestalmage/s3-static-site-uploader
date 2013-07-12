#!/usr/bin/env node
var ConfigRunner = require('../src/ConfigRunner.js');
var path = require('path');

var runner = new ConfigRunner();


var configPath = path.resolve('./aws-upload.conf.js');

var config = require(configPath);

runner.setConfig(config);

runner.run();