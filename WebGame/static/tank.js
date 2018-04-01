let input = {
    left: false,
    right: false,
    fire: false
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
    }
});