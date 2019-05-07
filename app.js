/* * * * * * * * * * * * * * *\
 *       CONFIGURATION       *
\* * * * * * * * * * * * * * */

// Express
var express = require('express');
var app     = express();
var https = require('https');
const fs = require('fs');


require('./config/express')(app);
app.use(express.query()); 

// Socket.io
var server = require('https').createServer({
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem'),
passphrase: 'abc123'
},app),
    io = require('socket.io').listen(server);
// Env
require('dotenv').config()

//Body-parser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Autres 
var visualReco = require('./imageProcessing.js'),
    port       = process.env.PORT || 10000;

var alerte = false;

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
/* * * * * * * * * * * * * * *\
 *          ROUTES           *
\* * * * * * * * * * * * * * */

app.get('/',  function(req, res) {
  res.render('index');
});

app.get('/api/alerte',  function(req, res) {
	  console.log("ALERTE")
    console.log(alerte)
  	res.json(alerte);
});

/* * * * * * * * * * * * * * *\
 *      GESTION SOCKET       *
\* * * * * * * * * * * * * * */

// Socket connection that allows to have a chat
io.sockets.on('connection', function (socket, pseudo) {

  socket.on('image', function(data) { 
    // console.log("-- New Image --")
    visualReco.savePicture(data)
    .then(() => visualReco.classifyImage())
    .then(function(result) {
      alerte = result[0].alerte;
      socket.emit("result", result)
    })
  });
});

/* * * * * * * * * * * * * * *\
 *          SERVER           *
\* * * * * * * * * * * * * * */
// Start the server
server.listen(port);
console.log('Server listening on port: ', port)
