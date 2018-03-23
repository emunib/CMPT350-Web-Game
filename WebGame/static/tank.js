let movement = {
    left: false,
    right: false
};
let gravity = {
    gravity : 0.05,
    gravitySpeed : 0
}
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