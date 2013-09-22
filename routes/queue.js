;// Copyright Bitwise Labs. All rights reserved.

"use strict";

function Queue(redis) {
    var redisQueue = require('../redis-queue')(redis);
    var actions = {
        push: function(req, res) {
            var id = req.params.id;
            redisQueue.getQueue(id)
                .insert(JSON.stringify(req.body.member))
                .then(function() {
                    return getQueue(id)
                }).then(function(queue) {
                    res.json(200, queue);
                });
        },
        pop: function(req, res) {},
        clear: function(req, res) {}
    };

    var getQueue = function(id) {
        return redisQueue
            .getQueue(id)
            .list(0, 0)
            .then(function(elems) {
                var members = elems.map(JSON.parse);
                return {
                    id: id,
                name: "La cola de " + id,
                members: members
                };
            });
    }

    this.get = function(req, res) {
        getQueue(req.params.id).then(function(queue) {
            res.json(200, queue);
        });
    };

    this.dispatchAction = function(req, res) {
        var action = req.body.action;
        if (action in actions) {
            actions[req.body.action](req, res);
        } else {
            // TODO send error;
        }
    };
};

module.exports = function(redis) {
    if (!redis) {
        redis = require('redis');
    }
    return new Queue(redis);
};

