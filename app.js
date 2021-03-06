// Require dependencies
var express = require('express')
  , http = require('http')
  , passport = require('passport')
  , flash = require('connect-flash')
  , fs = require('fs')

// Define how to format log messages
  , logger_options = function(tokens, req, res) {
    var status = res.statusCode
      , color = 32;

    if (status >= 500) color = 31
    else if (status >= 400) color = 33
    else if (status >= 300) color = 36;

    return '\033[90m' + req.method
      + ' ' + req.headers.host+ req.originalUrl + ' '
      + '\033[' + color + 'm' + res.statusCode
      + ' \033[90m'
      + (new Date - req._startTime)
      + 'ms\033[0m';

// Create an Express app and an HTTP server
  }, app = module.exports = express()
  , server = http.createServer(app)
// Declare what port to listen on - set to "process.env.PORT" per modulus getting started.
  , EXPRESS_PORT = process.env.PORT || 9000
// Define some session-related settings
  , db = require('./models/db')
  , session_settings = {
      store: db.session_store
    , secret: 'M33pl3Huddl3'
    , sid_name: 'express.sid'
    , cookie: { maxAge: 31536000000 } // 365 days
  }

  , start = function() {
  module.exports = {
    app: app
  , server: server
  , session_settings: session_settings
  };

  // Set some Express settings
  app.set('view engine', 'ejs');
  app.set('views', __dirname + '/views');

  // Define which middleware the Express app should use
  // (and what order to apply them in)
  app.use(express.logger(logger_options)); // Log each request
  app.use(express.bodyParser()); // Parse POST options into req.body
  app.use(express.static(__dirname + '/public')); // Serve files found in the public directory
  app.use(express.cookieParser()); // Parse cookie into req.session
  app.use(express.session({
    store: session_settings.store, //where to store sessions
    secret: session_settings.secret, //seed used to randomize some aspect of sessions?
    key: session_settings.sid_name, //the name under which the session ID will be stored
    cookie: session_settings.cookie // dictates how long the cookie will last
  })); //enable session use with these settings
  app.use(passport.initialize()); // Initialize Passport authentication module
  app.use(passport.session()); // Set up Passport session
  /*app.use(function(req, res, next) {
    // Copy username from req.user into res.locals for use in views
    res.locals.username = req.user && req.user.username;
    next();
  });*/
  app.use(flash()); // Necessary to display Passport "flash" messages
  app.use(app.router); // Match against routes in routes.js

  //Development-mode-specific middleware configuration
  app.configure('development', function() {
    // Display "noisy" errors - show exceptions and stack traces
    app.use(express.errorHandler({
      dumpExceptions: true
    , showStack: true
    })); 
  });

  //Production-mode-specific middleware configuration
  app.configure('production', function() {
    // Display "quiet" errors - no exceptions or stack traces
    app.use(express.errorHandler());
  });

  // Define routes that the app responds to
  require('./routes');

  //tell this server to listen on port X.
  //thus, this server is accessible at the URL:
  //  [hostname]:X
  //where [hostname] is the IP address of our server, or any domains pointed at our server
  server.listen(EXPRESS_PORT);

  //this is printed after the server is up
  console.log('server listening on port %d in %s mode', server.address().port, app.settings.env);
}

start();