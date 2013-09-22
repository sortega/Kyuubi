;// Copyright Bitwise Labs. All rights reserved.

"use strict";

var q = require("Q");

function Sender(onsend) {

    function printMsg(dest, msg) {
        console.log("Message to " + dest + ": " + msg);
    }

    this.onsend = (typeof(onsend) === undefined) ? printMsg : onsend;

    this.send = function(dest, msg) {
        if (dest.search("^[0-9]+$") !== 0) {
            return q.reject(new Error(
                "Destination (" + dest + ") is not a phone number"));
        }
        if (msg.length === 0 || msg.length > 140) {
            return q.reject(new Error("Invalid message length"));
        }
        printMsg("Message to " + dest + ": " + msg);
        return q(true);
    };
};

module.exports = function(onsend) {
    return new Sender(onsend);
};
