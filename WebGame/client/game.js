let socket = io();

socket.emit('new player');

let canvas = document.getElementById('canvas');
canvas.width = window.constants.WIDTH;
canvas.height = window.constants.HEIGHT;
let message = "";

setInterval(() => {
    socket.emit('input', input);
}, 1000 / 120);

let context = canvas.getContext('2d');

socket.on('message', (msg) => {
    message = msg;
});

socket.on('refresh', () => {
    location.reload(true);
});

socket.on('state', (players, bullets, points) => {
    context.fillStyle = 'rgb(60, 60, 60)';
    context.fillRect(0, 0, window.constants.WIDTH, window.constants.HEIGHT);

    context.fillStyle = 'gainsboro'; // light grey
    bullets.forEach((bullet) => {
        context.beginPath();
        context.arc(bullet.x, bullet.y, 3.5, 0, 2 * Math.PI);
        context.fill();
    });

    for (let id in players) {
        let player = players[id];
        if (Object.keys(player).length !== 0) {
            context.fillStyle = 'rgba(255, 255, 255, 0.03)';
            context.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            context.beginPath();
            context.arc(player.pos.x, player.pos.y, player.aim.power, 0, 2 * Math.PI);
            context.fill();
            context.stroke();

            context.fillStyle = 'rgba(255, 255, 255, 0.1)';
            context.beginPath();
            context.arc(player.pos.x, player.pos.y, player.aim.power, (player.aim.angle - 3) * (Math.PI / 180), (player.aim.angle + 3) * (Math.PI / 180));
            context.lineTo(player.pos.x, player.pos.y);
            context.fill();

            context.fillStyle = players[id].color;
            context.strokeStyle = players[id].color;

            context.beginPath();
            context.moveTo(player.pos.x, player.pos.y);
            context.lineWidth = 3;
            context.lineTo(player.pos.x + Math.cos(player.aim.angle * Math.PI / 180) * 14, player.pos.y + Math.sin(player.aim.angle * Math.PI / 180) * 14);
            context.stroke();

            context.lineWidth = 1;
            context.beginPath();
            context.arc(player.pos.x, player.pos.y, 10, 0, 2 * Math.PI);
            context.fill();
        }
    }

    context.fillStyle = '#58D68D';
    context.beginPath();
    context.moveTo(0, window.constants.HEIGHT);

    points.forEach((point) => {
        context.lineTo(point.x, point.y);
    });

    context.lineTo(window.constants.WIDTH, window.constants.HEIGHT);
    context.fill();
    context.closePath();

    for (let id in players) {
        let player = players[id];
        if (Object.keys(player).length !== 0) {
            context.font = '15px Calibri';
            context.fillStyle = "white";
            context.textAlign = 'center';
            context.fillText(player.name, player.pos.x, player.pos.y - 20);

            context.strokeStyle = "red";
            context.beginPath();
            context.moveTo(player.pos.x - player.health * 25, player.pos.y - 15);
            context.lineTo(player.pos.x + player.health * 25, player.pos.y - 15);
            context.stroke();
        }
    }

    context.font = '30px Calibri';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.fillText(message, constants.WIDTH/2, 50);
});