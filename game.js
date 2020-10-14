(() => {
    var player;
    var container = document.currentScript.parentElement;
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");

    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    canvas.style.zIndex = 10;
    canvas.style.position = "absolute";
    //canvas.style.backgroundColor = "black";

    container.appendChild(canvas);

    // Load player image
    var playerReady = false;
    var playerImage = new Image();
    playerImage.onload = () => {
        playerReady = true;
    }
    playerImage.src = "./playertemp.png";

    // Load sos sign
    var sosReady = false;
    var sosImage = new Image();
    sosImage.onload = () => {
        sosReady = true;
    }
    sosImage.src = "./sos.png";

    // Load sounds
    var soundRedy = false;
    var sound = new Audio();
    sound.onload = () => {
        soundRedy = true;
    }
    sound.src = "./cough.wav";

    // Load background images
    var bg1Ready = false;
    var bg1Image = new Image();
    bg1Image.onload = () => {
        bg1Ready = true;
    }
    bg1Image.src = "./stars3.png";

    var bg1 = {
        x: 0,
        y: 0,
        scrollPos: 0
    }

    var bg2Ready = false;
    var bg2Image = new Image();
    bg2Image.onload = () => {
        bg2Ready = true;
    }
    bg2Image.src = "./stars2.png";

    var bg2 = {
        x: 0,
        y: 0,
        scrollPos: 0
    }

    var bg3Ready = false;
    var bg3Image = new Image();
    bg3Image.onload = () => {
        bg3Ready = true;
    }
    bg3Image.src = "./stars1.png";

    var bg3 = {
        x: 0,
        y: 0,
        scrollPos: 0
    }

    // Background settings - images are 500px x 500px
    var background = {
        speed: 8,
        imagesX: Math.ceil(canvas.width / 500) + 1,
        imagesY: Math.ceil(canvas.height / 500) + 1
    }

    // Player settings
    var player = {
        speed: 128,
        sosSigns: []
    };

    var actionTimeout = false;

    // Keyboard controls
    var keysDown = {};

    // Check keys pressed
    addEventListener("keydown", (key) => {
        keysDown[key.keyCode] = true;
    });
    addEventListener("keyup", (key) => {
        delete keysDown[key.keyCode];
        if (key.keyCode === 32) actionTimeout = false;
    });

    // Center player
    var reset = () => {
        player.x = canvas.width / 2;
        player.y = canvas.height / 2;
    }

    // Update game objects - change player position
    var update = (modifier) => {
        // Update scrolling background properties
        bg1.x -= background.speed * modifier;
        if (bg1.x + (500 * background.imagesX) < 0) {
            bg1.x = 0;
        }

        bg2.x -= (background.speed * 1.25) * modifier;
        if (bg2.x + (500 * background.imagesX) < 0) {
            bg2.x = 0;
        }

        bg3.x -= (background.speed * 3) * modifier;
        if (bg3.x + (500 * background.imagesX) < 0) {
            bg3.x = 0;
        }

        // Up
        if (38 in keysDown || 87 in keysDown) {
            player.y -= player.speed * modifier;
        }
        // Down
        if (40 in keysDown || 83 in keysDown) {
            player.y += player.speed * modifier;
        }
        // Left
        if (37 in keysDown || 65 in keysDown) {
            player.x -= player.speed * modifier;
        }
        // Right
        if (39 in keysDown || 68 in keysDown) {
            player.x += player.speed * modifier;
        }
        // Space
        if (32 in keysDown && !actionTimeout) {
            player.sosSigns.push({ x: player.x, y: player.y })
            if (soundRedy) sound.play();
            actionTimeout = true;
        }
    }

    // Draw everything on canvas
    var render = () => {
        // Render background
        context.fillStyle = "black";
        context.fillRect(0, 0, canvas.width, canvas.height);
        if (bg1Ready) {
            for (var x = 0; x < background.imagesX; x++) {
                for (var y = 0; y < background.imagesY; y++) {
                    context.drawImage(bg1Image, bg1.x + x * 500, y * 500);
                }
            }
            for (var x = 0; x < background.imagesX; x++) {
                for (var y = 0; y < background.imagesY; y++) {
                    context.drawImage(bg1Image, background.imagesX * 500 + (bg1.x + x * 500), y * 500);
                }
            }
        }
        if (bg2Ready) {
            for (var x = 0; x < background.imagesX; x++) {
                for (var y = 0; y < background.imagesY; y++) {
                    context.drawImage(bg2Image, bg2.x + x * 500, y * 500);
                }
            }
            for (var x = 0; x < background.imagesX; x++) {
                for (var y = 0; y < background.imagesY; y++) {
                    context.drawImage(bg2Image, background.imagesX * 500 + (bg2.x + x * 500), y * 500);
                }
            }
        }

        if (bg3Ready) {
            for (var x = 0; x < background.imagesX; x++) {
                for (var y = 0; y < background.imagesY; y++) {
                    context.drawImage(bg3Image, bg3.x + x * 500, y * 500);
                }
            }
            for (var x = 0; x < background.imagesX; x++) {
                for (var y = 0; y < background.imagesY; y++) {
                    context.drawImage(bg3Image, background.imagesX * 500 + (bg3.x + x * 500), y * 500);
                }
            }
        }

        // Render player
        if (playerReady) {
            if (player.sosSigns.length > 0) {
                for (var i = 0; i < player.sosSigns.length; i++) {
                    context.drawImage(sosImage, player.sosSigns[i].x, player.sosSigns[i].y)
                }
            }
            context.drawImage(playerImage, player.x, player.y);
        }

    }

    // Main game loop
    var main = () => {
        // Run update function
        update(0.02);

        // Run render function
        render();

        requestAnimationFrame(main);
    }

    // Cross-browser support for requestAnimationFrame
    var w = window;
    requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

    reset();
    main();
})()
