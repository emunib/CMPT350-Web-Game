// Dependencies
let express = require('express');
let app = express();
let server = require('http').Server(app);
let passport = require('passport');
let session = require('express-session');
let SQLiteStore = require('connect-sqlite3')(session);
let GoogleStrategy = require('passport-google-oauth2').Strategy;
let socketIO = require('socket.io');
let passportSocketIo = require('passport.socketio');
let cookieParser = require('cookie-parser');
let io = socketIO(server);
let path = require('path');
let Vector = require('victor');
let constants = require('./shared/constants.js');
let ground = require('./lib/ground.js');
let randColor = require('randomcolor');
let Stopwatch = require('timer-stopwatch-dev');

let sessionStore = new SQLiteStore;
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(new GoogleStrategy({
        clientID: '206910541728-bl1qtui10ot9v7abcb70q7efv9qa9vvt.apps.googleusercontent.com',
        clientSecret: '8QF-6RA0R20v5Wu-NcCt_u1q',
        callbackURL: "http://localhost:5000/auth/google/callback"
    },
    (accessToken, refreshToken, profile, done) => {
        // asynchronous verification, for effect...
        process.nextTick(() => {
            return done(null, profile);
        });
    }
));

const PORT = process.env.PORT || 5000;
app.set('port', PORT);
app.use('/static', express.static(__dirname + '/static'));
app.use('/shared', express.static(__dirname + '/shared'));
app.use('/res', express.static(__dirname + '/res'));
app.use(cookieParser());
app.use(session({
    store: sessionStore,
    secret: 'mysecret',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/play', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

app.get('/', (req, res) => {
    res.redirect('/login');
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

server.listen(PORT, () => {
    console.log('Starting server on port: ' + PORT);
});

app.get('/auth/google',
    passport.authenticate('google', {scope: ['https://www.googleapis.com/auth/userinfo.profile']})
);

app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/play',
        failureRedirect: '/'
    })
);

app.get('/logout', (req, res) => {
    let ids = Object.keys(players).filter((id) => {
        return players[id].id === req.user.id
    });
    req.logout();
    ids.forEach((id) => {
        delete players[id]
    });
    res.redirect('/');
});

app.get('/new', ensureAuthenticated, (req, res) => {
    res.redirect('/play');
});

io.use(passportSocketIo.authorize({
    key: 'connect.sid',
    secret: 'mysecret',
    store: sessionStore,
    passport: passport,
}));

let players = {};
let activeSockets = [];
let viewers = {};
let bullets = [];
let status = {
    turn: 0,
    message: '',
    playing: false
};

let mainTimer = new Stopwatch(20000, {refreshRateMS: 10, almostDoneMS: 3000});
mainTimer.onTime((time) => {
    status.message =(Math.floor(time.ms / 100) / 10).toFixed(1);
}).onDone(() => {
    status.playing = true;
    turnTimer.start();
});

let turnTimer = new Stopwatch(10000);
turnTimer.onTime((time) => {
    status.message = (Math.floor(time.ms / 100) / 10).toFixed(1);
}).onDone(() => {
    status.turn++;
    turnTimer.reset();
});

io.on('connection', (socket) => {
    if (status.playing || Object.values(players).length > 5 || Object.values(players).some((player) => {
        return player.id === socket.request.user.id
    })) {
        viewers[socket.id] = {
            id: socket.request.user.id,
            name: socket.request.user.displayName,
        };
    } else {
        socket.on('new player', () => {
            mainTimer.start();
            activeSockets.push(socket.id);
            players[socket.id] = {
                id: socket.request.user.id,
                name: socket.request.user.displayName,
                pos: new Vector(400, 0),
                aim: {
                    angle: 0,
                    power: 20
                },
                color: randColor(),
                ammo: 1
            };
        });
    }

    socket.on('disconnect', () => {
        if (players.hasOwnProperty(socket.id)) {
            activeSockets.splice(activeSockets.indexOf(socket.id), 1);
            delete players[socket.id];
        } else {
            delete viewers[socket.id];
        }
    });

    socket.on('input', (data) => {
        let player = players[socket.id] || {};

        if (status.playing) {
            if (activeSockets[status.turn % activeSockets.length] === socket.id) {
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
        } else {
            if (Object.keys(player).length > 2) {
                let p = ground.getPoint(player.pos.x);
                player.pos.y = p.eqn.m * player.pos.x + p.eqn.b;
            }
        }
    });
});

setInterval(() => {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].vel.y += 0.1;
        bullets[i].pos.add(bullets[i].vel);

        let hits = Object.keys(players).filter((id) => {
            return (Object.keys(players[id]).length > 2) && bullets[i].pos.distanceSq(players[id].pos) < 125;
        });
        if (hits.length > 0) {
            bullets.splice(i, 1);
            hits.forEach((id) => {
                activeSockets.splice(activeSockets.indexOf(id), 1);
                players[id] = {
                    id: players[id].id,
                    name: players[id].name
                };
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

    if (status.playing && !turnTimer.isRunning()) {
        turnTimer.start();
    }

    io.sockets.emit('state', status.message,
        Object.keys(players).filter((id) => {
            return Object.keys(players[id]).length > 2
        }).map((id) => {
            return {
                name: players[id].name,
                pos: players[id].pos,
                aim: players[id].aim,
                color: players[id].color
            };
        }),
        bullets.map((bullet) => {
            return bullet.pos;
        }),
        ground.getPoints().map((point) => {
            return point.pos;
        })
    );
}, 1000 / 60);