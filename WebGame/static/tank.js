let movement = {
    left: false,
    right: false
};
document.addEventListener('keydown', (event)=> {
    switch (event.keyCode) {
        case 65: // A
            movement.left = true;
            break;
        case 68: // D
            movement.right = true;
            break;
    }
});
document.addEventListener('keyup', (event)=> {
    switch (event.keyCode) {
        case 65: // A
            movement.left = false;
            break;
        case 68: // D
            movement.right = false;
            break;
    }
});