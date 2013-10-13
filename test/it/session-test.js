;// Copyright Bitwise Labs. All rights reserved.
"use strict";
var app = require("../utils/app-mock.js").app,
    expect = require("expect.js"),
    request = require("supertest");

describe("Front page", function() {
    var agent = request(app);

    it("must show login form (no cookies)", function(done) {
        agent.get("/")
            .expect("Content-Type", /text\/html.*/)
            .expect(200, /.*id="login".*/)
            .end(done);
    });
});
