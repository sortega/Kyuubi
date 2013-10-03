;// Copyright Bitwise Labs. All rights reserved.

/*
 * GET login page.
 */

exports.showForm = function(req, res){
  res.render('index', { title: 'Kyuubi' });
};

exports.authorize = function(req, res) {
    if (req.body.username === 'admin' && req.body.password === 'admin!') {
        req.session.loggedIn = true;
        res.send(200);
    } else {
        res.json(401, {
            errorCode: "GEN-02",
            errorDescription: "Credenciales incorrectos."
        });
    }
};
