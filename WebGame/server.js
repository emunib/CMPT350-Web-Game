// Dependencies
let express = require('express');
let http = require('http');
let path = require('path');
let socketIO = require('socket.io');
let app = express();
let server = http.Server(app);
let io = socketIO(server);
let constants = require('./shared/constants.js');
let ground = require('./lib/ground.js');

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));
app.use('/shared', express.static(__dirname + '/shared'));

app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(5000, () => {
    console.log('Starting server on port 5000');
});

let players = {};

io.on('connection', (socket) => {
    socket.on('new player', function () {
        players[socket.id] = {
            x: 300,
            y: 0
        };
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
    });

    socket.on('movement', (data) => {
        let player = players[socket.id] || {};

        if (Object.keys(player).length !== 0) {
            let p = ground.getPoint(player.x);

            if (data.left) {
                player.x -= p.speed - p.m / 4;
            }
            if (data.right) {
                player.x += p.speed + p.m / 4;
            }
            if (player.x < 0) {
                player.x = 0;
            }
            else if (player.x >= constants.WIDTH) {
                player.x = constants.WIDTH - 1;
            }
            player.y = p.m * player.x + p.b;
        }
    });
});

setInterval(() => {
    io.sockets.emit('state', players, ground.getPoints());
}, 1000 / 60);