;// Copyright Bitwise Labs. All rights reserved.
"use strict";

exports.showDefaultQueue = function(req, res) {
    if (req.session.loggedIn) {
        res.render('queue', { title: 'Tu cola' });
    } else {
        res.redirect("/");
    }
};
