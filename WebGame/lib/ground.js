let constants = require('../shared/constants.js');
let noise = require('./perlin.js').Simple1DNoise();
let Vector = require('victor');

const segments = 100;
const amplitude = constants.WIDTH / 2;
const smoothness = 0.0085;

let points = [];
let ground = {
    getPoints() {
        if (points.length === 0) {
            for (let i = 0; i <= segments; i++) {
                let y = noise.getVal(i * constants.WIDTH / segments * smoothness) * amplitude;
                points.push({pos: new Vector(i * constants.WIDTH / segments, constants.HEIGHT - y)})
            }
            for (let i = 0; i < points.length - 1; i++) {
                let p1 = points[i];
                let p2 = points[i + 1];

                let diff = p2.pos.clone().subtract(p1.pos);
                let m = diff.y / diff.x;

                p1.eqn = {
                    m: m,
                    b: p1.pos.y - m * p1.pos.x,
                    speed: (3.2 * diff.x / diff.length())
                }
            }
        }
        return points
    },

    getPoint(x) {
        let i = Math.floor(x / (constants.WIDTH / segments));
        return this.getPoints()[i];
    }
};

module.exports = ground;