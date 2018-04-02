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

    for (let id in players) {
        let player = players[id];
        if (Object.keys(player).length !== 0) {
            context.fillStyle = 'rgba(0, 0, 0, 0.02)';
            context.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            context.beginPath();
            context.arc(player.pos.x, player.pos.y, player.aim.power, 0, 2 * Math.PI);
            context.fill();
            context.stroke();

            context.fillStyle = 'rgba(0, 0, 0, 0.05)';
            context.beginPath();
            context.arc(player.pos.x, player.pos.y, player.aim.power, (player.aim.angle - 3) * (Math.PI / 180), (player.aim.angle + 3) * (Math.PI / 180))
            context.lineTo(player.pos.x, player.pos.y);
            context.fill();

            context.fillStyle = players[id].color;

            context.beginPath();
            context.arc(player.pos.x, player.pos.y, 10, 0, 2 * Math.PI);
            context.fill();
        }
    }

    context.fillStyle = 'blue';
    bullets.forEach((bullet) => {
        context.beginPath();
        context.arc(bullet.x, bullet.y, 5, 0, 2 * Math.PI);
        context.fill();
    });

    context.fillStyle = '#58D68D';
    context.beginPath();
    context.moveTo(0, window.constants.HEIGHT);

    points.forEach((point) => {
        context.lineTo(point.x, point.y);
    });

    context.lineTo(window.constants.WIDTH, window.constants.HEIGHT);
    context.fill();
    context.closePath();
});