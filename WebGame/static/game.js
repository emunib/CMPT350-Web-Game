let socket = io();

socket.emit('new player');

let canvas = document.getElementById('canvas');
canvas.width = window.constants.WIDTH;
canvas.height = window.constants.HEIGHT;

setInterval(() => {
    socket.emit('input', input);
}, 1000 / 60);

let context = canvas.getContext('2d');
socket.on('state', (message, players, bullets, points) => {
    context.fillStyle = 'rgb(60, 60, 60)';
    context.fillRect(0, 0, window.constants.WIDTH, window.constants.HEIGHT);

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

            context.font = '15px Calibri';
            context.fillStyle = player.color;
            context.textAlign = 'center';
            context.fillText(player.name, player.pos.x, player.pos.y-20);

            context.fillStyle = players[id].color;

            context.beginPath();
            context.arc(player.pos.x, player.pos.y, 10, 0, 2 * Math.PI);
            context.fill();
        }
    }

    context.fillStyle = 'gainsboro'; // light grey
    bullets.forEach((bullet) => {
        context.beginPath();
        context.arc(bullet.x, bullet.y, 3.5, 0, 2 * Math.PI);
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


    context.font = '30px Calibri';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.fillText(message, constants.WIDTH/2, 50);
});