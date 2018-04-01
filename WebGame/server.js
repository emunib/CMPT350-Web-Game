// Dependencies
let express = require('express');
let http = require('http');
let path = require('path');
let socketIO = require('socket.io');
let app = express();
let server = http.Server(app);
let io = socketIO(server);
let Vector = require('victor');
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
let bullets = [];

io.on('connection', (socket) => {
    socket.on('new player', function () {
        players[socket.id] = {
            pos: new Vector(400, 0),
            ammo: 1
        };
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
    });

    socket.on('input', (data) => {
        let player = players[socket.id] || {};

        if (Object.keys(player).length !== 0) {
            let p = ground.getPoint(player.pos.x);
            let vel = new Vector(0, 0);
            if (data.left) {
                player.pos.x -= p.speed - p.m / 4;
            }
            if (data.right) {
                player.pos.x += p.speed + p.m / 4;
            }
            if (player.pos.x < 0) {
                player.pos.x = 0;
            } else if (player.pos.x >= constants.WIDTH) {
                player.pos.x = constants.WIDTH - 1;
            }
            player.pos.y = p.m * player.pos.x + p.b;

            if (data.fire) {
                if (player.ammo > 0) {
                    bullets.push({pos: player.pos.clone(), vel: new Vector(1, -6)});
                    player.ammo--;
                }
            } else {
                player.ammo = 1;
            }
        }
    });
});

setInterval(() => {
    bullets.forEach((bullet) => {
        bullet.vel.y += 0.1;
        bullet.pos.add(bullet.vel);
    });

    io.sockets.emit('state',
        Object.keys(players).map(function (key) {
            return players[key].pos;
        }),
        Object.keys(bullets).map(function (key) {
            return bullets[key].pos;
        }),
        ground.getPoints()
    );
}, 1000 / 60);