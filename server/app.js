const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);//default namespace
const messageBoard = io.of("/messageBoard");//custom namespace
const redisConnection = require("./redis-connection");
const nrpSender = require("./routes/nrp-sender-shim");
const appdata = require("./data");
const mbData = appdata.messageBoard;

const configRoutes = require("./routes");

app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', req.get('Access-Control-Request-Headers'));
    next();
});

app.use(bodyParser.json());

app.get('/messages', (req, res) => {
        res.sendFile(__dirname + '/index.html');//sending static file
    });

messageBoard.on('connection', (socket) => {//listening for a connection event
  console.log('a user connected');
  socket.on('join-room', (data) => {
    socket.leave(data.previousRoom);
    socket.join(data.newRoom);
    let messageFromRoomArray = [];
    //send new room id and db messages for that room
    mbData.getMessagesByRoom(data.newRoom)
        .then((messageFromRoomArray) => {
             let changes = {
        newRoom : data.newRoom,
        dbMessages : messageFromRoomArray
    };
    socket.emit("joined-room", changes);
            return messageFromRoomArray;
        }).catch((e) => {
            return e.message;
        });

  });

  socket.on('send-message', async (msg) => {//listening for 'send message' event
    //when event received, server publishes message via Redis to tell worker to add message to DB
    console.log("info socket received:");
    console.log(msg.userName);
    console.log(msg.userMessage);
    try {
      
        //publish message to worker to upload to DB
        let response = await nrpSender.sendMessage({
            redis: redisConnection,
            eventName: "addMessageToMessageBoardCollections",
            data: {
                userName: msg.userName,
				userMessage: msg.userMessage,
                room: msg.room
            }
        });
        //will let me know if in DB
        console.log("in db: " + JSON.stringify(response));
        //messageBoard.emit('receive-message', response);

        //send user's message to message board
        messageBoard.to(msg.room).emit('receive-message', msg.userName, msg.userMessage);

        socket.emit('request-credentials');
      } 
      catch (e) {
        messageBoard.emit('receive-message', e.message);
    }

  });


});

configRoutes(app);
/*http.listen(3001, () => {  
    console.log("We've now got a server!");
    console.log("Your routes will be running on http://localhost:3001");
});*/
http.listen(3002, () => {  
    console.log("We've now got a server!");
    console.log("Your routes will be running on http://localhost:3002");
});
