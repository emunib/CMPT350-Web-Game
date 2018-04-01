let constants = {
    WIDTH: 800,
    HEIGHT: 600
};

if (typeof module === 'object') {
    module.exports = constants;
} else {
    window.constants = constants;
}