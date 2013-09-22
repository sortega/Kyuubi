;// Copyright Bitwise Labs. All rights reserved.
"use strict";

var port = 3000;

var redis = require("./redis-mock");
var smsSvc = require("./sms-mock")();
var redisQueue = require("../../redis-queue")(redis);
exports.app = require("../../app").create(port, redisQueue, smsSvc);
