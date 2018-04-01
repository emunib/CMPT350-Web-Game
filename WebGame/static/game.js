let socket = io();

socket.emit('new player');

var canvas = document.getElementById('canvas');
canvas.width = window.constants.canvas.WIDTH;
canvas.height = window.constants.canvas.HEIGHT;

let gravity = {
    gravityVal : 5,
    gravitySpeed : 0
};

setInterval(function() {
    socket.emit('movement', movement);
    socket.emit('gravity', gravity);
}, 1000 / 60);

var context = canvas.getContext('2d');
socket.on('state', function(players, points) {
    context.clearRect(0, 0, window.constants.canvas.WIDTH, window.constants.canvas.HEIGHT);

    context.fillStyle = 'red';
    for (let id in players) {
        var player = players[id];
        context.beginPath();
        context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
        context.fill();
    }

    context.fillStyle = 'black';
    context.beginPath();
    context.moveTo(0, window.constants.canvas.HEIGHT);
    points.forEach((el) => {
        context.lineTo(el.x, el.y);
    });
    context.lineTo(window.constants.canvas.WIDTH, window.constants.canvas.HEIGHT);
    context.fill();
    context.closePath();
});