;// Copyright Bitwise Labs. All rights reserved.
"use strict";
var q = require("q"),
    _ = require("underscore");

function QueueSystem(redis) {

    var client = redis.createClient();

    function Queue(name) {
        function queuify(f) {
            return _.partial(q.nbind(f, client), name);
        }
        this.insert = queuify(client.rpush);
        this.pop = queuify(client.lpop);
        this.list = queuify(client.lrange);
        this.length = queuify(client.llen);
        this.clear = queuify(client.del);
    };

    this.getQueue = function(name) {
        return new Queue(name);
    };

    this.close = function(name) {
        client.quit();
    };
};

module.exports = function(redis) {
    if (!redis) {
        redis = require('redis');
    }
    return new QueueSystem(redis);
};
