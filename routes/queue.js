;// Copyright Bitwise Labs. All rights reserved.

"use strict";

var q = require('q');

function Queue(redisQueue, smsService) {

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

    var sendSms = function(receipients, body) {
        if (body) {
            recipients = recipients || [];
            if (!(recipients instanceof Array)) {
                recipients = [recipients];
            }
            recipients.map(function(recipient) {
                smsService.send(recipient, body);
            });
        }
    };

    var sendNotificationSms = function(recipients, req) {
        return sendSms(recipients, req.body.notification);
    };

    var actions = {
        push: {
            getRecepients: function() { },
            queueAction: function(req, res, queue) {
                return queue.insert(JSON.stringify(req.body.member));
            },
            sendSms: function() { }
        },
        pop: {
            getRecepients: function(req, res, queue) {
                return queue.peek();
            },
            queueAction: function(req, res, queue) { return queue.pop(); },
            sendSms: sendNotificationSms
        },
        clear: {
            getRecepients: function(req, res, queue) {
                return queue.list(0, 0);
            },
            queueAction: function(req, res, queue) { return queue.clear(); },
            sendSms: sendNotificationSms
        }
    };

    this.get = function(req, res) {
        returnQueue(req.params.id, res);
    };

    this.dispatchAction = function(req, res) {
        if (req.body.action in actions) {
            var action = actions[req.body.action];
            var id = req.params.id;
            var queue = redisQueue.getQueue(id);
            action.getRecepients(queue)
                .then(function(recipients) {

                });
            action.queueAction(req, res, redisQueue.getQueue(id))
                .then(function() {
                    returnQueue(id, res);
                    action.sendSms(recipients, req);
                },
                function() {
                    // TODO: Error case something failed
                });
        } else {
            // TODO send error unsupported action;
        }
    };
};

module.exports = function(redisQueue, smsService) {
    return new Queue(redisQueue, smsService);
};

