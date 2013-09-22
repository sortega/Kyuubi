;// Copyright Bitwise Labs. All rights reserved.

/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var login = require('./routes/login');
var http = require('http');
var path = require('path');

var app = express();

var unsupportedVerb = function(req, res) {
    res.json(405, {
        errorCode: "GEN-03",
        errorDescription: "The HTTP verb is not supported in the REST resource. Request URL: " + req.path
    });
};

// all environments
app.set('port', process.env.PORT || 3000);
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

var loginPath = '/api/login';
app.post(loginPath, login.authorize);
app.all(loginPath, unsupportedVerb);

app.all('/api/*', function(req, res) {
    res.json(404, {
        errorCode: "GEN-04",
        errorDescription: "The REST resource was not found. Request URL: " + req.path
    });
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

exports.app = app;
