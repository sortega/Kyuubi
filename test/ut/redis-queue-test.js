;// Copyright Bitwise Labs. All rights reserved.
"use strict";
var redis = require("../utils/redis-mock");
var expect = require("expect.js"),
    redis_queue = require("../../redis-queue")(redis),
    q = require("q"),
    _ = require("underscore");

describe("Mocked queue redis_queue", function() {
    it("must allow pushing and popping", function(done) {
        var queue = redis_queue.getQueue('push&pop queue');
        queue.insert("1")
            .then(function(length) {
                expect(length).to.be(1);
                return queue.insert("2");
            })
            .then(function(length) {
                expect(length).to.be(2);
                return queue.pop();
            })
            .then(function(elem) {
                expect(elem).to.be("1");
                return queue.pop();
            })
            .then(function(elem) {
                expect(elem).to.be("2");
                return queue.pop();
            })
            .done(done);
    });

    it("must return null when popping from an empty queue", function(done) {
        var queue = redis_queue.getQueue('empty queue');
        queue.pop()
            .then(function(value) { expect(value).to.be(null); })
            .done(done);
    });

    describe("list ranges given a 10-elem queue", function() {
        var queue = redis_queue.getQueue('10-elems queue');
        before(function(done) {
            _.range(1, 11).reduce(function(accum, value) {
                return accum.then(queue.insert(value));
            }, q()).done(done);
        });

        after(function(done) {
            queue.clear()
                .then(function(ret) { expect(ret).to.be.ok(); })
                .done(done);
        });

        it("must retrieve queue length", function(done) {
            queue.length()
                .then(function(len) {
                    expect(len).to.be(10);
                })
                .done(done);
        });

        it("must select a subrange", function(done) {
            queue.list(0, 4)
                .then(function(elems) {
                    expect(elems).to.have.length(5);
                    expect(elems).to.contain('1');
                    expect(elems).to.contain('2');
                    expect(elems).to.contain('3');
                    expect(elems).to.contain('4');
                    expect(elems).to.contain('5');
                })
                .done(done);
        });

        it("must select all with negative end", function(done) {
            queue.list(0, -1)
                .then(function(elems) { expect(elems).to.have.length(10); })
                .done(done);
        });
    });
});

