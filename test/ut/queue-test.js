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
                        "phoneNumber" : "string"
                    }
                })
                .expect(200)
                .expect({
                    "id": "bar",
                    "name": "La cola de bar",
                    "members": [
                        {"phoneNumber": "string"}
                    ]
                })
                .end(done)})

    it("must allow further users to be added",
        function(done) {
            agent.post("/api/queue/foo")
                .send({
                    "action" : "push",
                    "member" : {
                        "phoneNumber" : "string"
                    }
                })
                .expect(200)
                .end(postAgain)
            function postAgain(err, req) {
                agent.post("/api/queue/foo")
                    .send({
                        "action" : "push",
                        "member" : {
                            "phoneNumber" : "another"
                        }
                    })
                    .expect(200)
                    .expect({
                        "id": "foo",
                        "name": "La cola de foo",
                        "members": [
                            {"phoneNumber": "string"},
                            {"phoneNumber": "another"}
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
                        "phoneNumber" : "string"
                    }
                })
                .expect(200)
                .end(postAgain)
            function postAgain(err, req) {
                agent.post("/api/queue/grr")
                    .send({
                        "action" : "push",
                        "member" : {
                            "phoneNumber" : "another"
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
                            {"phoneNumber": "string"},
                            {"phoneNumber": "another"}
                        ]
                    })
                    .end(done)
            };
        })

    it("must not allow for multiple pushes in one request",
        function(done) {
            agent.post("/api/queue/brr")
                .send({
                    "action": "push",
                    "member": {"phoneNumber": "string"},
                    "member": {"phoneNumber": "strong"}})
                .expect(400)
                .end(done)
        })

    it("must allow to pop the first added member",
        function(done) {
            agent.post("/api/queue/gro")
                .send({
                    "action" : "push",
                    "member" : {
                        "phoneNumber" : "first"
                    }
                })
                .expect(200)
                .end(postAgain)
            function postAgain(err, req) {
                agent.post("/api/queue/gro")
                    .send({
                        "action" : "push",
                        "member" : {
                            "phoneNumber" : "second"
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
                            {"phoneNumber": "second"}
                        ]
                    })
                    .end(done)
            }
        })
});
