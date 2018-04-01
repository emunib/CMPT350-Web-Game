let constants = {
    canvas: {
        WIDTH: 800,
        HEIGHT: 600
    },
    player: {
        SPEED: 3
    }
};

if (typeof module === 'object') {
    module.exports = constants;
} else {
    window.constants = constants;
}