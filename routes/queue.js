;// Copyright Bitwise Labs. All rights reserved.

"use strict";

var q = require('q');

function Queue(redisQueue, smsService) {

    var getQueue = function(id) {
        return redisQueue.getQueue(id)
            .list(0, -1)
            .then(function(elems) {
                var members = elems.map(JSON.parse);
                return {
                    id: id,
                    name: "La cola de " + id,
                    members: members
                };
            });
    };

    var sendSms = function(receipients, body) {
        if (body) {
            recipients = recipients || [];
            if (!(recipients instanceof Array)) {
                recipients = [recipients];
            }
            return q.all(recipients.map(function(recipient) {
                return smsService.send(recipient, body);
            }));
        }
        return q();
    };

    var sendNotificationSms = function(recipients, req) {
        return sendSms(recipients, req.body.notification);
    };

    var actions = {
        push: {
            getRecepients: q,
            queueAction: function(req, res, queue) {
                if (req.body.member) {
                    return queue.insert(JSON.stringify(req.body.member));
                } else {
                    return q.reject({
                        errorCode: "QUE-01",
                        errorMessage: "Las operaciones de insercción deben tener un número de teléfono"
                    });
                }
            },
            sendSms: q
        },
        pop: {
            getRecepients: function(queue) {
                return q([queue.peek(), queue.get(3)]);
            },
            queueAction: function(req, res, queue) {
                return queue.pop().then(function(elem) {
                    if (elem === null) {
                        throw {
                            errorCode: "QUE-02",
                            errorMessage: "La cola está vacía."
                        };
                    }
                    return JSON.parse(elem);
                });
            },
            sendSms: function(recipients, req) {
                return q.all([
                    sendNotificationSms(recipients[0], req),
                    sendSms(recipients[1], "Su turno llegará en breve. Por favor, acérquese al local.")]);
            }
        },
        clear: {
            getRecepients: function(queue) {
                return queue.list(0, -1);
            },
            queueAction: function(req, res, queue) { return queue.clear(); },
            sendSms: sendNotificationSms
        }
    };

    this.get = function(req, res) {
        getQueue(req.params.id).then(function(queue) {
            res.json(200, queue);
        });
    };

    this.dispatchAction = function(req, res) {
        if (req.body.action in actions) {
            var action = actions[req.body.action];
            var id = req.params.id;
            var queue = redisQueue.getQueue(id);
            action.getRecepients(queue)
                .then(function(recipients) {
                    return action.queueAction(req, res, redisQueue.getQueue(id))
                        .then(function() {
                            return q.all([
                                getQueue(id),
                                action.sendSms(recipients, req)
                            ]);
                        }).spread(function(queue) {
                            res.json(200, queue);
                        },
                        function(err) {
                            res.json(400, err);
                        });
                }).done();
        } else {
            res.json(400, {
                errorCode: "QUE-03",
                errorMessage: "Acción de cola desconocida."
            });
        }
    };
};

module.exports = function(redisQueue, smsService) {
    return new Queue(redisQueue, smsService);
};

