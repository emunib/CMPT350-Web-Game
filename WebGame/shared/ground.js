let constants = require('./constants.js');

var Simple1DNoise = function () {
    var MAX_VERTICES = 256;
    var MAX_VERTICES_MASK = MAX_VERTICES - 1;
    var amplitude = 1;
    var scale = 1;

    var r = [];

    for (var i = 0; i < MAX_VERTICES; ++i) {
        r.push(Math.random());
    }

    var getVal = function (x) {
        var scaledX = x * scale;
        var xFloor = Math.floor(scaledX);
        var t = scaledX - xFloor;
        var tRemapSmoothstep = t * t * (3 - 2 * t);

        /// Modulo using &
        var xMin = xFloor & MAX_VERTICES_MASK;
        var xMax = (xMin + 1) & MAX_VERTICES_MASK;

        var y = lerp(r[xMin], r[xMax], tRemapSmoothstep);

        return y * amplitude;
    };

    /**
     * Linear interpolation function.
     * @param a The lower integer value
     * @param b The upper integer value
     * @param t The value between the two
     * @returns {number}
     */
    var lerp = function (a, b, t) {
        return a * (1 - t) + b * t;
    };

    // return the API
    return {
        getVal: getVal,
        setAmplitude: function (newAmplitude) {
            amplitude = newAmplitude;
        },
        setScale: function (newScale) {
            scale = newScale;
        }
    };
};

const segments = 100;
const amplitude = constants.canvas.WIDTH / 2;
const smoothness = 0.008;

let generator = new Simple1DNoise();
let points = [];
let ground = {
    getPoints() {
        if (points.length === 0) {
            for (let i = 0; i <= segments; i++) {
                let y = generator.getVal(i * constants.canvas.WIDTH / segments * smoothness) * amplitude;
                points.push({
                    x: i * constants.canvas.WIDTH / segments,
                    y: constants.canvas.HEIGHT - y
                })
            }
            for (let i = 0; i < points.length - 1; i++) {
                let p1 = points[i];
                let p2 = points[i + 1];

                let dx = (p2.x - p1.x);
                let dy = (p2.y - p1.y);
                let m = dy / dx;
                let h = Math.sqrt(dx * dx + dy * dy);

                p1.m = m;
                p1.b = p1.y - m * p1.x;
                p1.speed = (constants.player.SPEED * dx / h);
            }
        }
        return points
    },

    getPoint(x) {
        let i = Math.floor(x / (constants.canvas.WIDTH / segments));
        return this.getPoints()[i];
    }
};

module.exports = ground;