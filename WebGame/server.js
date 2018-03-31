// Dependencies
let express = require('express');
let http = require('http');
let path = require('path');
let socketIO = require('socket.io');
let app = express();
let server = http.Server(app);
let io = socketIO(server);
let constants = require('./shared/constants.js');

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));
app.use('/static', express.static(__dirname + '/shared'));
// Routing
app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
});
// Starts the server.
server.listen(5000, function () {
    console.log('Starting server on port 5000');
});
var players = {};
io.on('connection', function (socket) {
    socket.on('new player', function () {
        players[socket.id] = {
            x: 300,
            y: 0
        };
    });
    socket.on('movement', function (data) {
        var player = players[socket.id] || {};
        if (data.left) {
            player.x -= dist(3, -1, player);
        }
        if (data.right) {
            player.x += dist(3, 1, player);
        }
        if (player.x < 0) {
            player.x = 0;
        }
        else if (player.x >= constants.canvas.WIDTH) {
            player.x = constants.canvas.WIDTH - 1;
        }
        player.y = ground(player, getPoints())
    });
    socket.on('gravity', data => {

    });
});

setInterval(function () {
    io.sockets.emit('state', players, getPoints());
}, 1000 / 60);





var Simple1DNoise = function() {
    var MAX_VERTICES = 256;
    var MAX_VERTICES_MASK = MAX_VERTICES -1;
    var amplitude = 1;
    var scale = 1;

    var r = [];

    for ( var i = 0; i < MAX_VERTICES; ++i ) {
        r.push(Math.random());
    }

    var getVal = function( x ){
        var scaledX = x * scale;
        var xFloor = Math.floor(scaledX);
        var t = scaledX - xFloor;
        var tRemapSmoothstep = t * t * ( 3 - 2 * t );

        /// Modulo using &
        var xMin = xFloor & MAX_VERTICES_MASK;
        var xMax = ( xMin + 1 ) & MAX_VERTICES_MASK;

        var y = lerp( r[ xMin ], r[ xMax ], tRemapSmoothstep );

        return y * amplitude;
    };

    /**
     * Linear interpolation function.
     * @param a The lower integer value
     * @param b The upper integer value
     * @param t The value between the two
     * @returns {number}
     */
    var lerp = function(a, b, t ) {
        return a * ( 1 - t ) + b * t;
    };

    // return the API
    return {
        getVal: getVal,
        setAmplitude: function(newAmplitude) {
            amplitude = newAmplitude;
        },
        setScale: function(newScale) {
            scale = newScale;
        }
    };
};







const segments = 100;
const amplitude = constants.canvas.WIDTH / 2;
const smoothness = 0.01;

let generator = new Simple1DNoise();
let points = [];

function getPoints() {
    if (points.length === 0) {
        for (let i = 0; i <= segments; i++) {
            let y = generator.getVal(i * constants.canvas.WIDTH / segments * smoothness) * amplitude;
            points.push({x: i * constants.canvas.WIDTH / segments, y: constants.canvas.HEIGHT - y})
        }
    }
    return points
}

function dist(speed, dir, point) {
    if (!(Object.keys(point).length === 0 && point.constructor === Object)) {
        let i = Math.floor(point.x / (constants.canvas.WIDTH / segments));
        let p1 = points[i];
        let p2 = points[i + 1];

        let dx = (p2.x - p1.x);
        let dy = (p2.y - p1.y);
        let m = dy/dx;

        // if (m <= 1 && m >= -1) {
            let h = Math.sqrt(dx * dx + dy * dy);
            console.log((speed * dx / h) + (m * dir));
            return (speed * dx / h) + (m * dir / 4);
        // }

        // return speed - 0.2 * m * dir;

    }
}

function ground(point, points) {
    if (!(Object.keys(point).length === 0 && point.constructor === Object)) {
        let i = Math.floor(point.x / (constants.canvas.WIDTH / segments));
        let p1 = points[i];
        let p2 = points[i + 1];

        let m = (p2.y - p1.y) / (p2.x - p1.x);
        let b = p1.y - m * p1.x;
        return m * point.x + b;
    }
}