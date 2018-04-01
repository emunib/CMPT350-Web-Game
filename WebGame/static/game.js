let socket = io();

socket.emit('new player');

let canvas = document.getElementById('canvas');
canvas.width = window.constants.WIDTH;
canvas.height = window.constants.HEIGHT;

setInterval(() => {
    socket.emit('movement', movement);
}, 1000 / 60);

let context = canvas.getContext('2d');
socket.on('state', (players, points) => {
    context.clearRect(0, 0, window.constants.WIDTH, window.constants.HEIGHT);

    context.fillStyle = 'red';
    for (let id in players) {
        let player = players[id];
        context.beginPath();
        context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
        context.fill();
    }

    context.fillStyle = 'black';
    context.beginPath();
    context.moveTo(0, window.constants.HEIGHT);

    points.forEach((el) => {
        context.lineTo(el.x, el.y);
    });

    context.lineTo(window.constants.WIDTH, window.constants.HEIGHT);
    context.fill();
    context.closePath();
});