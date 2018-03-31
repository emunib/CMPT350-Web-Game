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
            player.x -= 5;
        }
        if (data.right) {
            player.x += 5;
        }
        if (player.x < 0) {
            player.x = 0;
        }
        else if (player.x >= 800) {
            player.x = 800 - 1;
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
const amplitude = 800 / 2;
const smoothness = 0.01;

let generator = new Simple1DNoise();
let points = [];

function getPoints() {
    if (points.length === 0) {
        for (let i = 0; i <= segments; i++) {
            let y = generator.getVal(i * 800 / segments * smoothness) * amplitude;
            points.push({x: i * 800 / segments, y: 600 - y})
        }
    }
    return points
}


function ground(point, points) {
    if (!(Object.keys(point).length === 0 && point.constructor === Object)) {
        let i = Math.floor(point.x / (800 / segments));
        let p1 = points[i];
        let p2 = points[i + 1];

        let m = (p2.y - p1.y) / (p2.x - p1.x);
        let b = p1.y - m * p1.x;
        return m * point.x + b;
    }
}

