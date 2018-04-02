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
let randColor = require('randomcolor');

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
            aim: {
                angle: 0,
                power: 20
            },
            color: randColor({seed: socket.id}),
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
                if (player.timer < 0) {
                    player.aim.angle--;
                } else {
                    player.aim.angle -= 0.2;
                    player.timer--;
                }
            }

            if (data.aimright) {
                if (player.timer < 0) {
                    player.aim.angle++;
                } else {
                    player.aim.angle += 0.2;
                    player.timer--;
                    console.log(player.timer);
                }
            }

            if (!data.aimleft && !data.aimright) {
                player.timer = 30;
            }

            if (data.powerup) {
                player.aim.power++;
            }

            if (data.powerdown) {
                player.aim.power--;
            }

            if (player.aim.power > 100) {
                player.aim.power = 100;
            } else if (player.aim.power < 0) {
                player.aim.power = 0;
            }

            if (data.fire) {
                if (player.ammo > 0) {
                    let dir = new Vector(1, 0).rotateDeg(player.aim.angle);
                    bullets.push({
                        pos: player.pos.clone().add(dir.clone().multiplyScalar(10)),
                        vel: dir.clone().multiplyScalar(player.aim.power / 10)
                    });
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
        bullets[i].vel.y += 0.1;
        bullets[i].pos.add(bullets[i].vel);

        let hits = Object.keys(players).filter((id) => {
            return (Object.keys(players[id]).length !== 0) && bullets[i].pos.distanceSq(players[id].pos) < 125;
        });
        if (hits.length > 0) {
            bullets.splice(i, 1);
            hits.forEach((id) => {
                players[id] = {};
            })
        } else {
            if (bullets[i].pos.x < 0 || bullets[i].pos.x >= constants.WIDTH) {
                bullets.splice(i, 1);
            } else {
                let p = ground.getPoint(bullets[i].pos.x);
                if (bullets[i].pos.y >= p.eqn.m * bullets[i].pos.x + p.eqn.b) {
                    bullets.splice(i, 1);
                }
            }
        }
    }

    io.sockets.emit('state',
        Object.keys(players).map((id) => {
            return {pos: players[id].pos, aim: players[id].aim, color: players[id].color};
        }),
        bullets.map((bullet) => {
            return bullet.pos;
        }),
        ground.getPoints().map((point) => {
            return point.pos;
        })
    );
}, 1000 / 60);