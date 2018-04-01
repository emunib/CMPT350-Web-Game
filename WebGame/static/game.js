let socket = io();

socket.emit('new player');

let canvas = document.getElementById('canvas');
canvas.width = window.constants.WIDTH;
canvas.height = window.constants.HEIGHT;

setInterval(() => {
    socket.emit('input', input);
}, 1000 / 60);

let context = canvas.getContext('2d');
socket.on('state', (players, bullets, points) => {
    context.clearRect(0, 0, window.constants.WIDTH, window.constants.HEIGHT);

    context.fillStyle = 'red';
    console.log(players);
    for (let id in players) {
        let player = players[id];
        if (Object.keys(player).length !== 0) {
            context.beginPath();
            context.arc(player.pos.x, player.pos.y, 10, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.moveTo(player.pos.x, player.pos.y);
            context.lineTo(player.pos.x + player.aim.x, player.pos.y + player.aim.y);
            context.stroke();
        }
    }

    context.fillStyle = 'blue';
    bullets.forEach((bullet) => {
        context.beginPath();
        context.arc(bullet.x, bullet.y, 5, 0, 2 * Math.PI);
        context.fill();
    });

    context.fillStyle = 'black';
    context.beginPath();
    context.moveTo(0, window.constants.HEIGHT);

    points.forEach((point) => {
        context.lineTo(point.x, point.y);
    });

    context.lineTo(window.constants.WIDTH, window.constants.HEIGHT);
    context.fill();
    context.closePath();
});