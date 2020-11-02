(() => {
    var player;
    var container = document.currentScript.parentElement;
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");

    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    canvas.style.zIndex = 10;
    canvas.style.position = "absolute";

    container.appendChild(canvas);

    // Load sounds
    var hit = new Audio("./media/sounds/hit.mp3");
    hit.volume = 1;
    hit.load();
    var bgMusic = new Audio("./media/sounds/ChadCrouch-Algorithms.mp3");
    bgMusic.volume = 0.5;
    bgMusic.load();

    // Sound settings
    var audioPool = {};

    // Load player image
    var playerImage = new Image();
    playerImage.src = "./media/images/astronaut.png";
    var playerSize = 230;

    // Load sos sign
    var sosImage = new Image();
    sosImage.src = "./media/images/sos.png";

    // Load meteorites
    var meteoriteImage1 = new Image();
    meteoriteImage1.src = "./media/images/meteor1.png";

    var meteoriteImage2 = new Image();
    meteoriteImage2.src = "./media/images/meteor2.png";

    var meteoriteImage3 = new Image();
    meteoriteImage3.src = "./media/images/meteor3.png";

    // Load background images
    var bgSize = 500; //bg image size 500px x 500px

    var bg1 = new Image();
    bg1.src = "./media/images/stars3.png";

    var bg2 = new Image();
    bg2.src = "./media/images/stars2.png";

    var bg3 = new Image();
    bg3.src = "./media/images/stars1.png";

    // Background settings
    var background = {
        speed: 8,
        imagesX: Math.ceil(canvas.width / bgSize) + 1,
        imagesY: Math.ceil(canvas.height / bgSize) + 1,
        layers: [
            { x: 0, y: 0, scrollPos: 0, img: bg1 },
            { x: 0, y: 0, scrollPos: 0, img: bg2 },
            { x: 0, y: 0, scrollPos: 0, img: bg3 },
        ]

    }

    // Player settings
    var player = {
        speed: 192,
        lives: 5,
        points: 0,
        rotation: 'right',
        sosSigns: [],
        highScore: 0
    };

    // Meteorites
    var spawnMeteorites = false;
    var meteorites = {
        max: 10,
        speed: 256,
        loc: [],
        image: []
    };

    // Keyboard controls
    var keysDown = {};

    // Check keys pressed
    addEventListener("keydown", (key) => {
        keysDown[key.keyCode] = true;
    });
    addEventListener("keyup", (key) => {
        delete keysDown[key.keyCode];
    });

    // Center player
    var reset = () => {
        player.x = canvas.width / 2;
        player.y = canvas.height / 2;
        player.lives = 5;
        player.highScore = player.highScore < player.points ? player.points : player.highScore;
        player.points = 0;
        spawnMeteorites = true;

        meteorites.max = 10;
        meteorites.loc = [];
        meteorites.image = [];
    }

    // Helper for playing sounds that can be played concurrently
    const playAudio = (name, audio) => {
        if (!audioPool[name]) audioPool[name] = [];
        audioPool[name].push(audio.cloneNode().play());
        setTimeout(() => {
            audioPool[name].shift();
        }, 100);
    }

    var meteoriteGenerator = false;
    var generateMeteorite = () => {
        // Generate meteorites randomly
        if (meteorites.loc.length < meteorites.max) {
            meteorites.loc.push({
                x: canvas.width,
                y: Math.floor(Math.random() * (canvas.height - 100)) + 1,
            })
            var rnd = Math.floor(Math.random() * 3) + 1
            meteorites.image.push(rnd === 1 ? meteoriteImage1 : rnd === 2 ? meteoriteImage2 : meteoriteImage3);
        }
        meteoriteGenerator = false;
    }


    // Update game objects - change player position
    var update = (modifier) => {
        // Update background properties
        for (var i = 0; i < 3; i++) {
            var speedModifier = i;//i > 1 ? 1 * i : 1;
            background.layers[i].x -= (background.speed * speedModifier) * modifier;
            if (background.layers[i].x + (500 * background.imagesX) < 0) {
                background.layers[i].x = 0;
            }
        }

        if (window.focus && (bgMusic.ended || bgMusic.paused)) {
            bgMusic.play().catch(e => console.log("Error playing background music"))
        }

        // Up
        if (38 in keysDown || 87 in keysDown) {
            player.y -= player.speed * modifier;
            player.rotation = "Up";
        }
        // Down
        if (40 in keysDown || 83 in keysDown) {
            player.y += player.speed * modifier;
            player.rotation = "Down";
        }
        // Left
        if (37 in keysDown || 65 in keysDown) {
            player.x -= player.speed * modifier;
            player.rotation = "Left";
        }
        // Right
        if (39 in keysDown || 68 in keysDown) {
            player.x += player.speed * modifier;
            player.rotation = "Right";
        }

        // Up-Left
        if ((38 in keysDown || 87 in keysDown) && (37 in keysDown || 65 in keysDown)) {
            player.rotation = "Up-Left";
        }
        // Up-Right
        if ((38 in keysDown || 87 in keysDown) && (39 in keysDown || 68 in keysDown)) {
            player.rotation = "Up-Right";
        }
        // Down-Left
        if ((40 in keysDown || 83 in keysDown) && (37 in keysDown || 65 in keysDown)) {
            player.rotation = "Down-Left";
        }
        // Down-Right
        if ((40 in keysDown || 83 in keysDown) && (39 in keysDown || 68 in keysDown)) {
            player.rotation = "Down-Right";
        }

        // Check if player lives
        if (player.lives <= 0) {
            spawnMeteorites = false;
            if ((32 in keysDown)) {
                reset();
            }
        }

        if (spawnMeteorites) {
            // Check if generator is running (interal on)
            if (!meteoriteGenerator) {
                meteoriteGenerator = true;
                var rnd = Math.floor(Math.random() * (1000 - player.points * 10)) + 200;
                meteoriteGenerator = setTimeout(generateMeteorite, rnd)
            }

            // Update meteor positions
            for (var i = 0; i < meteorites.loc.length; i++) {
                meteorites.loc[i].x -= meteorites.speed * modifier;
            }

            // Update max meteors
            meteorites.max = 10 + Math.floor(player.points / 10);

            // Check if meteor collided with player or went outside viewport
            var meteoritesCopy = [...meteorites.loc];
            var meteoritesImage = [...meteorites.image];
            for (var i = 0; i < meteoritesCopy.length; i++) {
                if (meteoritesCopy[i].x + 100 <= 0) {
                    meteoritesCopy.splice(i, 1);
                    meteoritesImage.splice(i, 1);
                    player.points += 1;
                    break;
                }
                if (player.x <= (meteoritesCopy[i].x + 100) &&
                    meteoritesCopy[i].x <= (player.x + playerSize) &&
                    player.y <= (meteoritesCopy[i].y + 100) &&
                    meteoritesCopy[i].y <= (player.y + playerSize)) {
                    meteoritesCopy.splice(i, 1);
                    meteoritesImage.splice(i, 1);
                    playAudio("hit", hit);
                    player.sosSigns.push({ x: player.x, y: player.y })
                    player.lives = player.lives - 1;
                    setTimeout(() => {
                        player.sosSigns.shift();
                    }, 1000);
                }
            }
            meteorites.loc = meteoritesCopy;
            meteorites.image = meteoritesImage;
        }
    }

    // Draw everything on canvas
    var render = () => {
        // Render background
        context.fillStyle = "black";
        context.fillRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < 3; i++) {
            for (var x = 0; x < background.imagesX; x++) {
                for (var y = 0; y < background.imagesY; y++) {
                    context.drawImage(background.layers[i].img, background.layers[i].x + x * 500, y * 500);
                }
            }
            for (var x = 0; x < background.imagesX; x++) {
                for (var y = 0; y < background.imagesY; y++) {
                    context.drawImage(background.layers[i].img, background.imagesX * 500 + (background.layers[i].x + x * 500), y * 500);
                }
            }
        }

        // Render game objects if player is alive
        if (player.lives > 0) {
            if (player.sosSigns.length > 0) {
                for (var i = 0; i < player.sosSigns.length; i++) {
                    context.drawImage(sosImage, player.sosSigns[i].x, player.sosSigns[i].y)
                }
            }
            context.drawImage(playerImage, player.x, player.y);

            context.fillStyle = "green";
            context.textAlign = "left";
            context.font = "32px Helvetica";
            context.fillText("Lives: " + player.lives, 50, 100);
            context.fillText("Points: " + player.points, 50, 140);
            context.fillText("High score: " + player.highScore, 50, 180);

            // Render meteorites
            for (var i = 0; i < meteorites.loc.length; i++) {
                context.drawImage(meteorites.image[i], meteorites.loc[i].x, meteorites.loc[i].y);
            }
        } else {
            context.fillStyle = "green";
            context.textAlign = "left";
            context.font = "32px Helvetica";
            context.fillText("Lives: " + player.lives, 50, 100);
            context.fillText("Points: " + player.points, 50, 140);
            context.fillText("High score: " + player.highScore, 50, 180);
            context.fillStyle = "red";
            context.textAlign = "center";
            context.font = "42px Helvetica";
            context.fillText("You died!", canvas.width / 2, canvas.height / 2);
            context.fillText("Press space to play again", canvas.width / 2, canvas.height / 2 + 50);
        }

        // Debug texts
        //context.fillStyle = "green";
        //context.textAlign = "center";
        //context.font = "28px Helvetica";
        //context.fillText("max meteorites: " + meteorites.max, canvas.width / 2, 30);

    }

    // Main game loop
    var main = () => {
        // Run update function
        update(0.02);
        // Run render function
        render();

        // Start spawnig meteorites
        setTimeout(() => {
            spawnMeteorites = true;
        }, 1000)
        requestAnimationFrame(main);
    }

    // Cross-browser support for requestAnimationFrame
    var w = window;
    requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

    reset();
    main();
})()
