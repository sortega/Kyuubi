;// Copyright Bitwise Labs. All rights reserved.

"use strict";

var app = require("../utils/app-mock").app,
    request = require("supertest");

describe("Queue resource", function() {
    var agent = request(app);

    it("must initialize always an empty queue on any id",
        function(done) {
            agent.get("/api/queue/foo")
                .expect(200)
                .expect({"id": "foo", "name": "La cola de foo", "members": []})
                .end(done);
        });

    it("must allow to push users to a queue",
        function(done) {
            agent.post("/api/queue/bar")
                .send({
                    "action" : "push",
                    "member" : {
                        "phoneNumber" : "34666111333"
                    }
                })
                .expect(200)
                .expect({
                    "id": "bar",
                    "name": "La cola de bar",
                    "members": [
                        {"phoneNumber": "34666111333",
                         "id": 1}
                    ]
                })
                .end(done)})

    it("must allow further users to be added",
        function(done) {
            agent.post("/api/queue/foo")
                .send({
                    "action" : "push",
                    "member" : {
                        "phoneNumber" : "34666111333"
                    }
                })
                .expect(200)
                .end(postAgain)
            function postAgain(err, req) {
                agent.post("/api/queue/foo")
                    .send({
                        "action" : "push",
                        "member" : {
                            "phoneNumber" : "34666111222"
                        }
                    })
                    .expect(200)
                    .expect({
                        "id": "foo",
                        "name": "La cola de foo",
                        "members": [
                            {"id": 2, "phoneNumber": "34666111333"},
                            {"id": 3, "phoneNumber": "34666111222"}
                        ]
                    })
                    .end(done)
            };
        })

    it("returns an error if no member is present when pushing",
        function(done) {
            agent.post("/api/queue/foo")
                .send({
                    "action" : "push",
                })
                .expect(400)
                .expect({
                  "errorCode" : "QUE-01",
                  "errorMessage" : "Las operaciones de insercción deben tener " +
                                   "un número de teléfono" 
                })
                .end(done)
        })

    it("must return an updated view of the queue on GET",
        function(done) {
            agent.post("/api/queue/grr")
                .send({
                    "action" : "push",
                    "member" : {
                        "phoneNumber" : "34666111333"
                    }
                })
                .expect(200)
                .end(postAgain)
            function postAgain(err, req) {
                agent.post("/api/queue/grr")
                    .send({
                        "action" : "push",
                        "member" : {
                            "phoneNumber" : "34666111222"
                        }
                    })
                    .expect(200)
                    .end(retrieveAgain)
            };
            function retrieveAgain(err, req) {
                agent.get("/api/queue/grr")
                    .expect(200)
                    .expect({
                        "id": "grr",
                        "name": "La cola de grr",
                        "members": [
                            {"id": 4, "phoneNumber": "34666111333"},
                            {"id": 5, "phoneNumber": "34666111222"}
                        ]
                    })
                    .end(done)
            };
        })

    it("must allow to pop the first added member",
        function(done) {
            agent.post("/api/queue/gro")
                .send({
                    "action" : "push",
                    "member" : {
                        "phoneNumber" : "34666111333"
                    }
                })
                .expect(200)
                .end(postAgain)
            function postAgain(err, req) {
                agent.post("/api/queue/gro")
                    .send({
                        "action" : "push",
                        "member" : {
                            "phoneNumber" : "34666111222"
                        }
                    })
                    .expect(200)
                    .end(popTheFirst)
            };
            function popTheFirst(err, req) {
                agent.post("/api/queue/gro")
                    .send({
                        "action": "pop"
                    })
                    .expect(200)
                    .expect({
                        "id": "gro",
                        "name": "La cola de gro",
                        "members": [
                            {"id": 7, "phoneNumber": "34666111222"}
                        ]
                    })
                    .end(done)
            }
        })

    it("must accept a notification when popping from a queue",
        function(done) {
            agent.post("/api/queue/c3po")
                .send({
                    "action" : "push",
                    "member" : {
                        "phoneNumber" : "34666111333"
                    }
                })
                .expect(200)
                .end(popWithNotification)
            function popWithNotification(err, req) {
                agent.post("/api/queue/c3po")
                    .send({
                        "action": "pop",
                        "notification": "Composed by the client code"
                    })
                    .expect(200)
                    .expect({"id": "c3po", "name": "La cola de c3po", "members": []})
                    .end(done)
            };
        })

    it("must return error if popping from empty list",
        function(done) {
            agent.post("/api/queue/grb")
                .send({
                    "action": "pop"
                })
                .expect(400)
                .expect({
                  "errorCode" : "QUE-02",
                  "errorMessage" : "La cola está vacía."
                })
                .end(done)
        })

    it("must clear the queue if requested to",
        function(done) {
            agent.post("/api/queue/grc")
                .send({
                    "action" : "push",
                    "member" : {
                        "phoneNumber" : "34666111333"
                    }
                })
                .expect(200)
                .end(postAgain)
            function postAgain(err, req) {
                agent.post("/api/queue/grc")
                    .send({
                        "action" : "push",
                        "member" : {
                            "phoneNumber" : "34666111222"
                        }
                    })
                    .expect(200)
                    .expect({
                        "id": "grc",
                        "name": "La cola de grc",
                        "members": [
                            {"id": 8, "phoneNumber": "34666111333"},
                            {"id": 9, "phoneNumber": "34666111222"}
                        ]
                    })
                    .end(clearQueue)
            };
            function clearQueue(err, req) {
                agent.post("/api/queue/grc")
                    .send({
                        "action": "clear"
                    })
                    .expect(200)
                    .expect({"id": "grc", "name": "La cola de grc", "members": []})
                    .end(done)
            };
        })
});
