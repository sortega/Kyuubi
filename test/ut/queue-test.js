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

    it("must allow to push users to the created queue",
        function(done) {
            agent.post("/api/queue/foo")
                .send({
                    "action" : "push",
                    "member" : {
                        "phoneNumber" : "string"
                    }
                })
                .expect(200)
                .expect({
                    "id": "foo",
                    "name": "La cola de foo",
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
                        "phoneNumber" : "another"
                    }
                })
                .expect(200)
                .expect({
                    "id": "foo",
                    "name": "La cola de 1",
                    "members": [
                        {
                            "phoneNumber": "string"
                        },
                        {
                            "phoneNumber": "another"
                        }
                 ]})
                .end(done)})
});
