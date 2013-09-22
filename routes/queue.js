;// Copyright Bitwise Labs. All rights reserved.

"use strict";

var redisQueue = require('../redis-queue')();

var returnQueue = function(id, res) {
    redisQueue.getQueue(id)
        .list(0, 0)
        .then(function(elems) {
            var members = elems.map(JSON.parse);
            var queue = {
                id: id,
                name: "La cola de " + id,
                members: members
            };
            res.json(200, queue);
        });
};

var sendNotificationSms = function(req, res) {
    // TODO: Send notification SMS
}

var actions = {
    push: {
        queueAction: function(req, res, queue) {
            return queue.insert(JSON.stringify(req.body.member));
        },
        sendSms: function(req, res) {
            // TODO
        }
    },
    pop: {
        queueAction: function(req, res, queue) { return queue.pop(); },
        sendSms: sendNotificationSms
    },
    clear: {
        queueAction: function(req, res, queue) { return queue.clear(); },
        sendSms: sendNotificationSms
    }
};

exports.get = function(req, res) {
    returnQueue(req.params.id, res);
};

exports.dispatchAction = function(req, res) {
    if (req.body.action in actions) {
        var action = actions[req.body.action];
        var id = req.params.id;
        action.queueAction(req, res, redisQueue.getQueue(id))
            .then(function() {
                returnQueue(id, res);
                action.sendSms(req, res);
            },
            function() {
                // TODO: Error case
            });
    } else {
        // TODO send error;
    }
};