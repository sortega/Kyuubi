;// Copyright Bitwise Labs. All rights reserved.
"use strict";

var port = 3000;

var redis = require("../utils/redis-mock");
var redisQueue = require("../../redis-queue")(redis);
exports.app = require("../../app").create(port, redisQueue);
