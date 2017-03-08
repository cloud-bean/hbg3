'use strict';

require('dotenv').load();
var app = require('./config/lib/app');
var server = app.start();
