;// Copyright Bitwise Labs. All rights reserved.

"use strict";

var app = require("../../app").app,
    request = require("supertest");

describe("The api", function() {
    var agent = request(app);

    it("must return 404 for unknown resources", function(done){
        agent.get("/api/foobar")
            .expect(404, /.*GEN-04.*/)
            .end(done);
    });
});
