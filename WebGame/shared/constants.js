let constants = {
    WIDTH: 800,
    HEIGHT: 500
};

if (typeof module === 'object') {
    module.exports = constants;
} else {
    window.constants = constants;
}