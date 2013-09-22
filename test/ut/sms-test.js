;// Copyright Bitwise Labs. All rights reserved.

"use strict";

var sms = require("../utils/sms-mock")(),
    expect = require("expect.js"),
    q = require("q"),
    _ = require("underscore");

describe("Mocked SMS service", function() {

    function expectSendError(dest, msg, done) {
        sms.send(dest, msg)
            .catch(function (error) { expect(error).to.be.a(Error); })
            .done(done);
    }

    it("must allow message sending", function(done) {
        sms.send("34639747229", "Welcome to Kyuubi!")
            .then(function (result) { expect(result).to.be(true); })
            .done(done);
    });

    it("must fail for alphabetic destination", function(done) {
        expectSendError("helloworld", "Welcome to Kyuubi!", done);
    });

    it("must fail for alphanumeric destination", function(done) {
        expectSendError("3463974abcd", "Welcome to Kyuubi!", done);
    });

    it("must fail for destination with spaces", function(done) {
        expectSendError("  34639747229  ", "Welcome to Kyuubi!", done);
    });

    it("must fail for empty message", function(done) {
        expectSendError("34639747229", "", done);
    });

    it("must fail for too long message", function(done) {
        expectSendError(
            _.range(200).reduce(function (msg, n) { return msg + n; }, ""),
            "",
            done);
    });
});
