;// Copyright Bitwise Labs. All rights reserved.

/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var login = require('./routes/login');
var queues = require('./routes/queues');
var path = require('path');

exports.create = function(port, redisQueue, smsService) {
    var app = express();
    var queue = require('./routes/queue')(redisQueue, smsService);

    var unsupportedVerb = function(req, res) {
        res.json(405, {
            errorCode: "GEN-03",
            errorDescription: "El verbo HTTP no está soportado por el recurso " +
                "URL: " + req.path
        });
    };

    // all environments
    app.set('port', port);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('.q(%X0l(KD"})]6r'));
    app.use(express.cookieSession({ secret: 'g12**"3f"<Xq52k' }));
    app.use(app.router);
    app.use(require('less-middleware')({ src: __dirname + '/public' }));
    app.use(express.static(path.join(__dirname, 'public')));

    // development only
    if ('development' == app.get('env')) {
        app.use(express.errorHandler());
    }

    app.get('/', routes.index);
    app.get('/queue', queues.showDefaultQueue);

    var loginPath = '/api/login';
    app.post(loginPath, login.authorize);
    app.all(loginPath, unsupportedVerb);

    var queuePath = '/api/queue/:id';
    app.get(queuePath, queue.get);
    app.post(queuePath, queue.dispatchAction);
    
    app.all(queuePath, unsupportedVerb);

    app.all('/api/*', function(req, res) {
        res.json(404, {
            errorCode: "GEN-04",
            errorDescription: "El recuso no ha sido encontrado. " +
                "URL: " + req.path
        });
    });

    return app;
}
