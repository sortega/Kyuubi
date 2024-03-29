;// Copyright Bitwise Labs. All rights reserved.

"use strict";

var app = require("../utils/app-mock").app,
    request = require("supertest");

describe("Login resource", function() {
    var agent = request(app);

    var verifyInvalidVerb = function(req) {
        return function(done) {
            req.expect(405, /.*GEN-03.*/)
                .end(done);
        };
    };

    it("must return 405 for GET requests",
        verifyInvalidVerb(agent.get("/api/login")));

    it("must return 405 for PUT requests",
        verifyInvalidVerb(agent.put("/api/login")));

    it("must return 405 for DELETE requests",
        verifyInvalidVerb(agent.del("/api/login")));

    it("must return 401 if no body is present", function(done) {
        agent.post("/api/login")
            .expect(401, /.*GEN-02.*/)
            .end(done);
    });

    it("must return 401 if incorrect body is provided", function(done) {
        agent.post("/api/login")
            .send({ flowers: "baduser", dogs: "admin!"})
            .expect(401)
            .end(done);
    });

    it("must return 401 if incorrect credentials are provided", function(done) {
        agent.post("/api/login")
            .send({ username: "baduser", password: "admin!"})
            .expect(401)
            .end(done);
    });

    it("must return 401 if incomplete credentials are provided", function(done) {
        agent.post("/api/login")
            .send({ username: "admin"})
            .expect(401)
            .end(done);
    });

    it("must return 200 and a logged in cookie if correct credentials is provided",
        function(done) {
            agent.post("/api/login")
                .send({ username: "admin", password: "admin!"})
                .expect(200)
                .expect('Set-Cookie', /.*loggedIn%22%3Atrue.*/)
                .end(done);
        });
});
