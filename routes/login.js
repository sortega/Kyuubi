;// Copyright Bitwise Labs. All rights reserved.

"use strict";

exports.authorize = function(req, res) {
    if (req.session.loggedIn) {
        res.send(200);
    } else if (req.body.username === 'admin' && req.body.password === 'admin!') {
        req.session.loggedIn = true;
        res.send(200);
    } else {
        res.json(401, {
            errorCode: "GEN-02",
            errorDescription: "Missing or invalid credentials."
        });
    }
};