const express = require('express');
const app = express();
const fs = require('fs');

const jwt = require('jsonwebtoken');

const options = {
  key: fs.readFileSync('./cert/key.pem'),
  cert: fs.readFileSync('./cert/certificate.pem')
};

const server = require('https').Server(options,app);
const io = require('socket.io')(server);

const exphbs  = require('express-handlebars');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const helpers = require('handlebars-helpers')();
const _ = require('lodash');
const cors = require('cors');

const sessionMiddleware = session({
  secret: "changeit",
  resave: false,
  saveUninitialized: false
});

//Load Routes from directory
const users = require('./routes/user');
const rides = require('./routes/rides');
const { Console } = require('console');
const db = require('./database').db;

//Enable CORS for Cordova
app.use(cors({ origin: 'https://localhost' }))

//Connect with Database
db.connect(function(err){
    if (err){
      console.log(err.message);
    } else{
      console.log("Connected to database");
    }
});


//Handlebars setup
const hbs = exphbs.create({ /* config */ });


app.use(fileUpload());

// Static Files

app.use(express.static('upload'));
app.use(express.static('public'));

//Body Parser Start
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json()); 
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

//Engine Set
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

//PORT 
app.set('port', process.env.PORT || 3000);

app.use(sessionMiddleware);

app.use(function (req, res, next) {
    res.locals.session = req.session.userId;
    next();
});

app.use('/', users); 
app.use('/', rides);

//404
app.use(function(req,res){
    res.status(404);
    res.render('404');
});

//500
app.use(function(err,req,res,next){
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

//Socket.io
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));

io.on('connection', (socket,req) => {
  console.log('a user connected ' + socket.id);
  const userId = socket.handshake.query.userId;
  console.log(userId);

  socket.on('join_room',(receiverId) =>{
    let roomId = receiverId.toString()
    console.log("Server sent to room: " + roomId)
    roomId = parseInt(roomId.split('').sort().join(''));
    socket.join(roomId);
  })

  socket.on('chat message', (msg) => {
    //insert msg to database
    const senderId = userId;
    const receiverId = msg.receiverId;
    console.log("Server got from client the receiver Id :" + receiverId + " and the sender Id: ", senderId);

    let timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

    db.query(`SELECT name FROM Users WHERE id = ${senderId}`, (err,result) =>{
      if (err){
        throw err;
      }else{
        let username = result[0].name;
        let roomId = receiverId.toString() + senderId.toString();

        roomId = parseInt(roomId.split('').sort().join(''));
        text = msg.message;

        console.log("Server got from client this message: " + text);

        messageData = {
          text: text,
          senderUsername: username,
          timestamp: timestamp, 
          senderId: senderId
        }

        io.to(roomId).emit('message', messageData);
        
        
        console.log("Server sent to client: ",  messageData );

        db.query(`INSERT INTO messages (senderId, receiverId, message, timestamp) VALUES (${senderId}, ${receiverId}, '${text}', '${timestamp}')`, (err) => {
          if (err) throw err;
        });
      }
    });
  });
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

module.exports.io = io;

//Connection
server.listen(app.get('port'), function(){
  console.log('Express started on https://localhost:' + app.get('port') + '/login; press Ctrl+C to terminate.');
});