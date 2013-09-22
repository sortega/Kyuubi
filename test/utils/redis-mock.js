;// Copyright Bitwise Labs. All rights reserved.
"use strict";

function InMemorySystem() {
    var queues = {};

    function retrieveOrCreate(name) {
        var queue = queues[name];
        if (!queue) {
            queue = [];
            queues[name] = queue;
        }
        return queue;
    }

    function withQueue(operation) {
        // Replace queue name by queue elements as first argument
        return function wrappedOperation(name) {
            var args = Array.prototype.slice.call(arguments);
            args[0] = retrieveOrCreate(name);
            return operation.apply(this, args);
        };
    }

    this.rpush = withQueue(function(elems, element, callback) {
        elems.push(String(element));
        callback(null, elems.length);
    });

    this.lpop = withQueue(function(elems, callback) {
        callback(null, elems.shift() || null);
    });

    this.llen = withQueue(function(elems, callback) {
        callback(null, elems.length);
    });

    this.lrange = withQueue(function(elems, start, end, callback) {
        var actualEnd = (end < 0) ? elems.length : (end + 1);
        callback(null, elems.slice(start, actualEnd));
    });

    this.lindex = withQueue(function(elems, index, callback) {
        while (index < 0 ) {
            index = elems.length - index;
        }
        callback(null, elems[index] || null);
    });

    this.del = withQueue(function(elems, callback) {
        elems.length = 0;
        callback(null, true);
    });
}

exports.createClient = function() {
    return new InMemorySystem();
}
