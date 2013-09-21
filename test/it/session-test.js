"use strict";
var app = require("../../app.js").app,
    expect = require("expect.js"),
    request = require("supertest");

describe("Front page", function() {
    var agent = request(app);

    it("must show login form (no cookies)", function(done) {
        agent.get("/")
            .expect("Content-Type", "text/plain")
            .expect(200, 'id="login-form"')
            .end(done);
    });
});
