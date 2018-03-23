// Dependencies
let express = require('express');
let http = require('http');
let path = require('path');
let socketIO = require('socket.io');
let app = express();
let server = http.Server(app);
let io = socketIO(server);
app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));
// Routing
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
});
// Starts the server.
server.listen(5000, function() {
    console.log('Starting server on port 5000');
});
var players = {};
io.on('connection', function(socket) {
    socket.on('new player', function() {
        players[socket.id] = {
            x: 300,
            y: 300
        };
    });
    socket.on('movement', function(data) {
        var player = players[socket.id] || {};
        if (data.left) {
            player.x -= 5;
        }
        if (data.right) {
            player.x += 5;
        }
        // if (data.up) {
        //     player.y -= 5;
        // }
        // if (data.down) {
        //     player.y += 5;
        // }
        // player.gravitySpeed += player.gravity;
        // player.y += player.gravity;
        // if(player.y > 590){
        //     player.y = 590;
        // }
    });
    socket.on('gravity',data=>{
        var player = players[socket.id] || {};
        player.y += 5;
    });
    socket.on('canvas',data=>{
        var player = players[socket.id] || {};
        if(player.y > canvas.height-10){
            player.y = canvas.height-10;
        }
    });

});
setInterval(function() {
    io.sockets.emit('state', players);
}, 1000 / 60);