let socket = io();

socket.emit('new player');

var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;

let gravity = {
    gravityVal : 5,
    gravitySpeed : 0,
    ground : canvas.height
}

setInterval(function() {
    socket.emit('movement', movement);
    socket.emit('gravity',gravity);
    socket.emit('grounded',grounded);
}, 1000 / 60);

var context = canvas.getContext('2d');
socket.on('state', function(players) {
    context.clearRect(0, 0, 800, 600);
    context.fillStyle = 'green';
    for (var id in players) {
        var player = players[id];
        context.beginPath();
        context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
        context.fill();
    }
});