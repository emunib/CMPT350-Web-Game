let constants = require('../shared/constants.js');
let noise = require('./perlin.js').Simple1DNoise();

const segments = 100;
const amplitude = constants.WIDTH / 2;
const smoothness = 0.0085;

let points = [];
let ground = {
    getPoints() {
        if (points.length === 0) {
            for (let i = 0; i <= segments; i++) {
                let y = noise.getVal(i * constants.WIDTH / segments * smoothness) * amplitude;
                points.push({
                    x: i * constants.WIDTH / segments,
                    y: constants.HEIGHT - y
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
                p1.speed = (3.2 * dx / h);
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