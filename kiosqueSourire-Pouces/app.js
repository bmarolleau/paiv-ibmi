/* * * * * * * * * * * * * * *\
 *       CONFIGURATION       *
\* * * * * * * * * * * * * * */

// Express
var express = require('express');
var app     = express();

require('./config/express')(app);
app.use(express.query()); 

// Socket.io
var server = require('http').createServer(app),
    io = require('socket.io').listen(server);
// Env
require('dotenv').config()

//Body-parser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Autres 
var port = process.env.PORT || 10000;
var vr   = require('./imageTreatment.js');

/* * * * * * * * * * * * * * *\
 *          ROUTES           *
\* * * * * * * * * * * * * * */

/* -- WEBSITE -- */

app.get('/',  function(req, res) {
  res.render('index');
});


/* * * * * * * * * * * * * * *\
 *      GESTION SOCKET       *
\* * * * * * * * * * * * * * */

// Socket connection that allows to have a chat
io.sockets.on('connection', function (socket, pseudo) {

  socket.on('image', function(data) { 
    // console.log("-- New Image --")
    vr.savePicture(data)
    .then(imgFile => vr.classifyImage(imgFile))
    .then(result => socket.emit("emotion", result))

  });

});

/* * * * * * * * * * * * * * *\
 *          SERVER           *
\* * * * * * * * * * * * * * */
// Start the server
server.listen(port);
console.log('Server listening on port: ', port)