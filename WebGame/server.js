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
            aim: new Vector(0, -20),
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
            if (data.left) {
                player.pos.x -= p.eqn.speed - p.eqn.m / 4;
            }
            if (data.right) {
                player.pos.x += p.eqn.speed + p.eqn.m / 4;
            }
            if (player.pos.x < 0) {
                player.pos.x = 0;
            } else if (player.pos.x >= constants.WIDTH) {
                player.pos.x = constants.WIDTH - 1;
            }
            player.pos.y = p.eqn.m * player.pos.x + p.eqn.b;

            if (data.aimleft) {
                player.aim.rotateDeg(-1);
            }

            if (data.aimright) {
                player.aim.rotateDeg(1);
            }

            if (data.powerup) {
                player.aim.add(player.aim.clone().normalize());
            }

            if (data.powerdown) {
                player.aim.subtract(player.aim.clone().normalize());
            }

            if (data.fire) {
                if (player.ammo > 0) {
                    bullets.push({pos: player.pos.clone(), vel: player.aim.clone().multiplyScalar(0.1)});
                    player.ammo--;
                }
            } else {
                player.ammo = 1;
            }
        }
    });
});

setInterval(() => {
    for (let i = bullets.length - 1; i >= 0; i--) {
        if (bullets[i].pos.x < 0 || bullets[i].pos.x >= constants.WIDTH) {
            bullets.splice(i, 1);
        } else {
            bullets[i].vel.y += 0.1;
            bullets[i].pos.add(bullets[i].vel);

            let p = ground.getPoint(bullets[i].pos.x);
            if (bullets[i].pos.y >= p.eqn.m * bullets[i].pos.x + p.eqn.b) {
                bullets.splice(i, 1);
            }
        }
    }

    io.sockets.emit('state',
        Object.keys(players).map((id) => {
            return {pos: players[id].pos, aim: players[id].aim};
        }),
        bullets.map((bullet) => {
            return bullet.pos;
        }),
        ground.getPoints().map((point) => {
            return point.pos;
        })
    );
}, 1000 / 60);