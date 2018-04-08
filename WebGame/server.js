// Dependencies
let express = require('express');
let app = express();
let server = require('http').Server(app);
let passport = require('passport');
let session = require('express-session');
let SQLiteStore = require('connect-sqlite3')(session);
let GoogleStrategy = require('passport-google-oauth2').Strategy;
let FacebookStrategy = require('passport-facebook').Strategy;
let socketIO = require('socket.io');
let passportSocketIo = require('passport.socketio');
let cookieParser = require('cookie-parser');
let io = socketIO(server);
let path = require('path');
let Vector = require('victor');
let constants = require('./shared/constants.js');
let ground = require('./lib/ground.js');
let randColor = require('randomcolor');

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

passport.use(new FacebookStrategy({
        clientID: '405200069927909',
        clientSecret: '90c041ae4b68c5a889e2fc1164943507',
        callbackURL: "https://cmpt-350-webgame.appspot.com/auth/facebook/callback"
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

app.get('/auth/facebook',
    passport.authenticate('facebook')
);

app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/play',
        failureRedirect: '/'
    })
);

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/play',
        failureRedirect: '/'
    })
);

app.get('/logout', function(req, res){
    let ids = Object.keys(players).filter((id) => {return players[id].id === req.user.id});
    req.logout();
    ids.forEach((id) => {delete players[id]});
    res.redirect('/');
});

let players = {};
let viewers = {};
let bullets = [];

io.use(passportSocketIo.authorize({
    key: 'connect.sid',
    secret: 'mysecret',
    store: sessionStore,
    passport: passport,
}));

io.on('connection', (socket) => {
    if (Object.values(players).some((player) => {
        return player.id === socket.request.user.id
    })) {
        viewers[socket.id] = {};
    } else {
        socket.on('new player', () => {
            players[socket.id] = {
                id: socket.request.user.id,
                name: socket.request.user.displayName,
                pos: new Vector(400, 0),
                aim: {
                    angle: 0,
                    power: 20
                },
                color: randColor(),
                ammo: 1,
            };
        });
    }

    socket.on('disconnect', () => {
        if (players.hasOwnProperty(socket.id)) {
            players[socket.id] = {id: socket.request.user.id};
        } else {
            delete viewers[socket.id];
        }
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