// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseDashboard = require( 'parse-dashboard' )
var ParseServer = require('parse-server').ParseServer;
var path = require('path');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var dashboard = new ParseDashboard( { 
  'allowInsecureHTTP': true,
  'apps': [
    {
      'serverURL': 'http://localhost:1337/parse',
      'appName': 'myAppId',
      'appId': process.env.APP_ID || 'myAppId',
      'masterKey': process.env.MASTER_KEY || '', 
      "supportedPushLocales": ["en", "ru", "fr"]
    }
  ],
  'users': [
    {
      'user': process.env.PARSE_DASHBOARD_ADMIN_USERNAME || 'admin',
      'pass': process.env.PARSE_DASHBOARD_ADMIN_PASSWORD || 'Qwas7856',
      'apps': [{'appId': process.env.APP_ID || 'myAppId'}]
    }
  ]
}, {allowInsecureHTTP: true} )

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);
app.use('/dashboard', dashboard )
// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('Server is UP and Running');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
