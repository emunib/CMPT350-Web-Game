let input = {
    left: false,
    right: false,
    fire: false,
    aimleft: false,
    aimright: false,
    powerup: false,
    powerdown: false,
    aim: {}
};

document.addEventListener('keydown', (event) => {
    switch (event.keyCode) {
        case 65: // A
            input.left = true;
            break;
        case 68: // D
            input.right = true;
            break;
        case 32: // SPACE
            input.fire = true;
            break;
        case 37: // LEFT
            input.aimleft = true;
            break;
        case 39: // RIGHT
            input.aimright = true;
            break;
        case 38: // UP
            input.powerup = true;
            break;
        case 40: // DOWN
            input.powerdown = true;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.keyCode) {
        case 65: // A
            input.left = false;
            break;
        case 68: // D
            input.right = false;
            break;
        case 32: // SPACE
            input.fire = false;
            break;
        case 37: // LEFT
            input.aimleft = false;
            break;
        case 39: // RIGHT
            input.aimright = false;
            break;
        case 38: // UP
            input.powerup = false;
            break;
        case 40: // DOWN
            input.powerdown = false;
            break;
    }
});