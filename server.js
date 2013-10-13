;// Copyright Bitwise Labs. All rights reserved.
"use strict";

var port = process.env.PORT || 3000;
var redis_implementation = "redis";

var redis = require(redis_implementation);
var redisQueue = require("./redis-queue")(redis);
var smsService = require("./test/utils/sms-mock")();
var app = require("./app").create(port, redisQueue, smsService);
var http = require('http');

http.createServer(app).listen(port, function(){
  console.log('Kyuubi web server listening on port ' + port);
});

