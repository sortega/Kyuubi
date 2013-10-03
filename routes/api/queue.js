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

    var sendSms = function(recipients, body) {
        if (!body) {
            return q();
        }
        recipients = recipients || [];
        if (!(recipients instanceof Array)) {
            recipients = [recipients];
        }
        return q.all(recipients.map(function(recipient) {
            return smsService.send(recipient, body);
        }));
    };

    var sendNotificationSms = function(recipients, req) {
        return sendSms(recipients, req.body.notification);
    };

    var extractPhone = function(queueElem) { return queueElem && queueElem.phoneNumber; };

    var id = 1;
    var actions = {
        push: {
            getRecepients: function(queue, req) {
                if (req.body.member && req.body.member.phoneNumber) {
                    return q(req.body.member.phoneNumber);
                }
                return q();
            },
            queueAction: function(req, res, queue) {
                if (req.body.member) {
                    var member = req.body.member;
                    member.id = id++;
                    return queue.insert(JSON.stringify(req.body.member));
                } else {
                    return q.reject({
                        errorCode: "QUE-01",
                        errorMessage: "Las operaciones de insercción deben tener un número de teléfono"
                    });
                }
            },
            sendSms: function(recipients, req) {
                return sendSms(recipients, "Tu número es el " + req.body.member.id);
            }
        },
        pop: {
            getRecepients: function(queue) {
                return q.all([
                    queue.peek().then(extractPhone),
                    queue.get(3).then(extractPhone)
                ]);
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
                return queue.list(0, -1).then(function(elems) {
                    return elems.map(extractPhone);
                });
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
        if (!(req.body.action in actions)) {
            res.json(400, {
                errorCode: "QUE-03",
                errorMessage: "Acción de cola desconocida."
            });
            return;
        }
        var action = actions[req.body.action];
        var id = req.params.id;
        var queue = redisQueue.getQueue(id);
        var recipientsPromise = action.getRecepients(queue, req);
        recipientsPromise.then(function() {
            return q.all([recipientsPromise, action.queueAction(req, res, redisQueue.getQueue(id))]);
        }).spread(function(recipients) {
            return q.all([getQueue(id), action.sendSms(recipients, req)]);
        }).spread(
            function(queue) {
                res.json(200, queue);
            },
            function(err) {
                console.log("Error when processing REST queue request:");
                console.log(err);
                res.json(400, err);
            }
        ).done();
    };
};

module.exports = function(redisQueue, smsService) {
    return new Queue(redisQueue, smsService);
};

