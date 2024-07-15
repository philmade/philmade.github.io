let player;
let texts = [];
let bullets = [];
let bulletChars = ["P", "H", "I", "L", "*", "I", "S", "*", "T", "H", "E", "*", "O", "N", "E", "*"];
let bulletIndex = 0;
let documentTexts = [
    { header: "Phil Harper", content: "A BAFTA award-winning creative technologist with over 10 years of experience at the intersection of storytelling, technology and audience engagement. Skilled in directing and producing award-winning virtual reality, digital, and immersive content across multiple platforms. Self-taught and fluent in Python programming with a focus on experimental AI and data-led storytelling projects." },
    { header: "Web3, AI & Python", content: "Launched case.science, an AI-powered social network exploring perspectives on news stories using LLMs.\n\n Built several full-stack experimental AI projects, applying techniques like web scraping, data analysis, and visualization with Python, HTML, Javascript and hyperscript" },
    { header: "VR Director", content: "Co-directed one of the most commercially successful VR films of all time, The Antarctica Experience, which became an onsight VR exhibit across Australian museums" },
    // { header: "Founder, The Digger", content: "Writer and producer of substack series on pharmaceutical industry conflicts of interest with over 16k subscribers and 50% MoM growth in early months" },
    { header: "BBC Director and Producer", content: "Directed two award-winning VR films, '1942 Berlin Blitz' and 'Damming the Nile' \n\n Innovated and produced a new VR journalism format for BBC World Service across Congo, Sudan, Egypt and Ethiopia \n\n Helped establish BBC's capabilities in VR storytelling across content verticals" },
    { header: "Atlantic Productions - Head of Digital", content: "Co-directed BAFTA award-winning VR with Sir David Attenborough, 'David Attenborough's Great Barrier Reef' \n\n Produced First Life VR, also with Sir David Attenborough, and also showing at the Natural History Museum in London. \n\n Built Alchemy VR, a specialist VR production company at Atlantic Productions \n\n" },
    { header: "ITN Productions - Head of New Audiences", content: "Grew new online channel from 0 to 600k subscribers in 12 months \n\n Established data-driven approach to digital content and audience growth \n\n On-screen presenting talent." },
    { header: "Awards", content: "BAFTA - 2017 \n\n Rose d’Or - 2018 \n\n Broadcast Digital - 2019" }
];
let paragraphIndex = 0;
let particles = [];
let framesSinceLastTextBlock = 600;
let bgImage;
let gameStarted = false;
let canvasWidth, canvasHeight;
let bulletSound;
let score = 0;
let canvas
let gameOver = false;

function preload() {

    bgImage = loadImage('/images/startscreen.png');
    gameImage = loadImage('/images/gamescreen.png');
    spaceShipSprite = loadImage("/images/spaceship.png");
    logo = loadImage('/images/spacevitae.png')
    instructions = loadImage('/images/instructions.png')
    bulletSound = loadSound('/images/laser.mp3');
    backgroundMusic = loadSound('images/pulse.mp3');
}




function setup() {
    if (isMobile()) {
        canvasWidth = windowWidth;
        canvasHeight = windowHeight;
    } else {
        // Maximum width is 800 pixels
        canvasWidth = min(windowWidth, 400);
        // Maintain 1:2 aspect ratio
        canvasHeight = min(windowHeight, canvasWidth * 2);
    }
    canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('game');
    canvas.style('display', 'block');
    canvas.style('margin', 'auto');
    if (!isMobile()) {
        // Create volume slider only for non-mobile devices
        let sliderContainer = createDiv('');
        sliderContainer.position(10, height - 40);
        sliderContainer.style('display', 'flex');
        sliderContainer.style('align-items', 'center');
        sliderContainer.parent('game');

        let volumeLabel = createSpan('Volume: ');
        volumeLabel.style('color', 'white');
        volumeLabel.style('margin-right', '10px');
        volumeLabel.parent(sliderContainer);

        volumeSlider = createSlider(0, 1, 0.5, 0.1);
        volumeSlider.style('width', '80px');
        volumeSlider.parent(sliderContainer);
    }
    bgY1 = 0;
    bgY2 = -height;
    player = new Spaceship(bulletSound);

}

function draw() {
    // Calculate the width and height to draw the image
    let imgWidth = width;
    let imgHeight = imgWidth * (gameImage.height / gameImage.width);

    background(0);

    // Update the y-coordinates
    bgY1 += 0.5;
    bgY2 += 0.5;

    if (bgY1 > height) {
        bgY1 = -height;
    }

    if (bgY2 > height) {
        bgY2 = -height;
    }

    // Draw the background images
    if (gameStarted) {
        image(gameImage, 0, bgY1, imgWidth, imgHeight);
        image(gameImage, 0, bgY2, imgWidth, imgHeight);
    } else {
        image(bgImage, 0, 0, imgWidth, imgHeight);
    }

    if (!gameStarted) {
        loadScreen();
    } else if (gameOver) {
        displayLoseScreen();
    } else {
        updateAndDisplaySpaceship();
        checkEndGameOrContinue();
    }

    if (gameStarted) {
        if (!isMobile() && volumeSlider) {
            backgroundMusic.setVolume(volumeSlider.value());
            // bulletSound.setVolume(volumeSlider.value());
        } else {
            // Set a default volume for mobile
            backgroundMusic.setVolume(0.5);
            // bulletSound.setVolume(0.5);
        }
    }
}


function loadScreen() {
    let imgWidth = width;
    let imgHeight = imgWidth * (bgImage.height / bgImage.width);

    image(bgImage, 0, 0, imgWidth, imgHeight);
    image(logo, width / 12, height / 3, 350, 60);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(18);
    text("Use arrow keys or mouse to move", width / 2, height / 1.5);
    text("Space or click to shoot", width / 2, height / 1.4);

    // Add start button
    let buttonWidth = 200;
    let buttonHeight = 50;
    let buttonX = width / 2 - buttonWidth / 2;
    let buttonY = height / 1.2;

    fill(6, 182, 212);
    rect(buttonX, buttonY, buttonWidth, buttonHeight, 25);
    fill(255);
    textSize(24);
    text("Start Game", width / 2, height / 1.2 + buttonHeight / 2);

    // Check if button is clicked
    if (mouseIsPressed &&
        mouseX > buttonX && mouseX < buttonX + buttonWidth &&
        mouseY > buttonY && mouseY < buttonY + buttonHeight) {
        gameStarted = true;
        startBackgroundMusic();
    }
}

function startBackgroundMusic() {
    if (backgroundMusic.isLoaded() && !backgroundMusic.isPlaying()) {
        backgroundMusic.loop();
    }
}

function updateAndDisplaySpaceship() {
    player.update();
    player.show();

}


function checkEndGameOrContinue() {
    if (texts.length === 0 && paragraphIndex >= documentTexts.length) {
        displayWinScreen();
    } else {
        updateAndDisplayGameObjects();
        loadNewTextBlockIfNeeded();
        text('Score: ' + score, 40, 60);
        textAlign(CENTER);
    }
}

function loadNewTextBlockIfNeeded() {
    framesSinceLastTextBlock++;
    let shouldAddNewBlock = framesSinceLastTextBlock >= 600 || texts.length === 0;

    // If there are text blocks on the screen, check the y-coordinate of the last one
    if (texts.length > 0) {
        let lastBlock = texts[texts.length - 1];
        // Only add a new block if the last one has moved a certain distance down the screen
        shouldAddNewBlock = shouldAddNewBlock && lastBlock.y > lastBlock.height;
    }

    if (shouldAddNewBlock && paragraphIndex < documentTexts.length) {
        texts.push(new TextBlock(documentTexts[paragraphIndex]));
        paragraphIndex++;
        framesSinceLastTextBlock = 0;
    }
}

function updateAndDisplayGameObjects() {
    updateAndDisplayTextBlocks();
    updateAndDisplayBullets();
    updateAndDisplayParticles();
}

function updateAndDisplayTextBlocks() {
    for (let i = texts.length - 1; i >= 0; i--) {
        texts[i].update();
        texts[i].show();
        if (texts[i].checkCollision(player)) {
            console.log('Collision detected!');
            gameOver = true;
            break;
        }
    }
}

function updateAndDisplayBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].update();
        bullets[i].show();
        handleBulletOffScreen(i);
    }
}

function handleBulletOffScreen(i) {
    if (bullets[i].offscreen()) {
        bullets.splice(i, 1);
    } else {
        checkBulletHitsTextBlocks(i);
    }
}

function checkBulletHitsTextBlocks(i) {
    for (let j = texts.length - 1; j >= 0; j--) {
        if (bullets[i].hits(texts[j])) {
            handleBulletHit(i, j);
            break;
        }
    }
}

function handleBulletHit(i, j) {
    createExplosionParticlesAt(bullets[i].x, bullets[i].y, 20);
    bullets.splice(i, 1);
    score += round(random(1, 3));
    if (texts[j].hit()) {
        score += round(random(8, 36));
        createExplosionParticlesAt(texts[j].x + texts[j].width / 2, texts[j].y + texts[j].height / 2, 50, color(255, 200, 0));
        texts.splice(j, 1);
    }
}

function createExplosionParticles(i) {
    for (let n = 0; n < 5; n++) {
        let p = new Particle(bullets[i].x, bullets[i].y);
        particles.push(p);
    }
}

function createExplosionParticlesAt(x, y, numParticles, particleColor) {
    for (let n = 0; n < numParticles; n++) {
        let p = new Particle(x, y, particleColor);
        particles.push(p);
    }
}

function updateAndDisplayParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].show();
        if (particles[i].finished()) {
            particles.splice(i, 1);
        }
    }
}

function displayWinScreen() {
    background(bgImage);
    textSize(24);
    fill(255);
    textAlign(CENTER, CENTER);
    image(logo, width / 12, height / 3, 350, 60);
    text('You win!', width / 2, height / 1.5);
    text('Score: ' + score, width / 2, height / 1.4);
    text('Shoot me an email phil@imrge.co', width / 2, height / 1.3);

    // Get the position of the canvas
    let canvasPos = canvas.position();

    // Create a "Play Again" button
    replayButton = createButton('Play Again');
    // Set the button's position relative to the canvas
    replayButton.position(canvasPos.x + width / 3, canvasPos.y + height / 1.2);
    replayButton.mousePressed(restartGame);
    replayButton.style('font-size', '23px');
    replayButton.style('color', '#EDEDED');
    replayButton.style('background-color', '#F59D05');
    replayButton.style('padding', '10px');

    noLoop()
}

function restartGame() {
    // Reset game variables
    score = 0;
    paragraphIndex = 0;
    gameStarted = false;
    texts = [];
    bullets = [];

    // Remove the replay button
    replayButton.remove();


    // Restart the draw loop
    loop();
}

function displayLoseScreen() {
    background(bgImage);
    textSize(24);
    fill(255);
    textAlign(CENTER, CENTER);
    image(logo, width / 12, height / 3, 350, 60);
    text('You lost!', width / 2, height / 1.5);
    text('Score: ' + score, width / 2, height / 1.4);
    text('Shoot me an email phil@imrge.co', width / 2, height / 1.3);

    // Get the position of the canvas
    let canvasPos = canvas.position();

    // Create a "Play Again" button
    replayButton = createButton('Play Again');
    // Set the button's position relative to the canvas
    replayButton.position(canvasPos.x + width / 3, canvasPos.y + height / 1.2);
    replayButton.mousePressed(restartGame);
    replayButton.style('font-size', '23px');
    replayButton.style('color', '#EDEDED');
    replayButton.style('background-color', '#F59D05');
    replayButton.style('padding', '10px');

    noLoop()
    gameOver = false;
}

function mousePressed() {
    if (mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
        if (gameStarted) {
            player.fire();
        }
    }
}

function mouseMoved() {
    if (mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
        if (gameStarted) {
            player.x = mouseX;
            player.x = constrain(player.x, 0, width - player.size);
        }
    }
}



function keyPressed() {
    if (!gameStarted && keyCode === 32) {
        gameStarted = true;
    } else if (keyCode === 32) {  // SPACE bar
        player.fire();
    }
}

function touchStarted() {
    if (touches[0].x >= 0 && touches[0].x < width && touches[0].y >= 0 && touches[0].y < height) {
        if (!gameStarted) {
            gameStarted = true;
        } else {
            player.fire();
        }
    }
    return false;  // Prevent default behavior
}

function touchMoved() {
    if (touches[0].x >= 0 && touches[0].x < width && touches[0].y >= 0 && touches[0].y < height) {
        if (gameStarted) {
            player.x = touches[0].x;
            player.x = constrain(player.x, 0, width - player.size);
        }
    }
    return false;  // Prevent default behavior
}

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function windowResized() {
    if (isMobile()) {
        resizeCanvas(windowWidth, windowHeight);
    } else {
        let newWidth = min(windowWidth, 400);
        let newHeight = min(windowHeight, newWidth * 2);
        resizeCanvas(newWidth, newHeight);
    }
}

class Spaceship {
    constructor(bulletSound) {
        this.x = width / 2;
        this.y = height - 60;  // Changed from this.size to 50
        this.size = 50;
        this.spriteWidth = this.size;
        this.spriteHeight = this.size / 0.73;
        this.bulletSound = bulletSound;
        this.r = min(this.spriteWidth, this.spriteHeight) / 2;

    }

    update() {
        if (mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
            // Set spaceship's x-coordinate to mouse's x-coordinate
            this.x = mouseX;

            // Prevent spaceship from moving offscreen
            this.x = constrain(this.x, 0, width - this.size);
        }
    }

    show() {
        image(spaceShipSprite, this.x, this.y, this.spriteWidth, this.spriteHeight);
        rect(this.x, this.y)
    }

    fire() {
        let char = bulletChars[bulletIndex];
        bullets.push(new Bullet(this.x + this.spriteWidth / 2, this.y - this.spriteHeight / 2, char));
        this.bulletSound.setVolume(0.2); // Adjust this value as needed (0.0 to 1.0)
        this.bulletSound.play();
        bulletIndex++;
        if (bulletIndex >= bulletChars.length) {
            bulletIndex = 0;
        }
    }
}

class Bullet {
    constructor(x, y, char) {
        this.x = x;
        this.y = y;
        this.char = char;
        this.size = 20;
        this.speed = -5;
    }

    update() {
        this.y += this.speed;
    }

    show() {
        textSize(14);
        fill(255);
        text(this.char, this.x, this.y);
    }

    hits(text) {
        // Check if bullet's x-coordinate is within the range of the text         block's x-coordinates
        let withinX = this.x > text.x && this.x < text.x + text.width;

        // Check if bullet's y-coordinate is within the range of the text         block's y-coordinates
        let withinY = this.y > text.y + 30 && this.y < text.y + text.height;    // Assuming text size is 32

        let hit = withinX && withinY;
        if (hit) {
            console.log('Hit registered!');
        }
        return hit;
    }
    offscreen() {
        return this.y < 0;
    }
}

class TextBlock {
    constructor(textObject) {
        this.header = textObject.header;
        this.content = textObject.content;
        this.width = 350;  // Set a fixed width for the block
        this.height = 300;  // Set a fixed height for the block
        this.x = random(0, canvasWidth - this.width);
        this.y = 0;
        this.speed = random(0.5, 0.8);
        this.hits = 0;
        this.maxHits = Math.floor(random(6, 12));
        this.textColor = color(0);  // Start with white color
        this.headerColor = color(255, 105, 180);  // Pink color
        this.backgroundAlpha = 255;  // Start with fully opaque background
        this.r = min(this.width, this.height) / 2;
    }

    update() {
        this.y += this.speed;
    }

    show() {
        // Draw the header
        fill(this.headerColor);
        rect(this.x, this.y, this.width, 50);  // Increase height to 50
        fill(0);  // Black color for the header text
        textSize(16);  // Increase the size of the header text
        textAlign(LEFT);
        text(this.header, this.x + 5, this.y + 30); // Adjust y-coordinate

        // Draw the background for the text
        fill(255, 255, 255, this.backgroundAlpha);
        rect(this.x + 10, this.y + 60, this.width - 20, this.height - 60);

        // Draw the text
        textSize(14);
        fill(this.textColor);
        textAlign(CENTER);
        text(this.content, this.x + 10, this.y + 60, this.width - 20, this.height - 60);  // Leave space for the header
    }

    hit() {
        this.hits++;
        this.backgroundAlpha -= 255 / this.maxHits;  // Decrease alpha each time the block is hit

        if (this.hits >= this.maxHits) {
            createExplosionParticlesAt(this.x + this.width / 2, this.y + this.height / 2, 20, color(255, 0, 0))
            return true;
        } else {
            return false;
        }
    }

    checkCollision(spaceship) {
        let d = dist(this.x + this.width / 2, this.y + this.height / 2, spaceship.x + spaceship.spriteWidth / 2, spaceship.y + spaceship.spriteHeight / 2);
        return (d < this.r + spaceship.r);
    }
}
class Particle {
    constructor(x, y, particleColor) {
        this.x = x;
        this.y = y;
        this.vx = random(-3, 3);
        this.vy = random(-3, 3);
        this.alpha = 255;
        this.color = particleColor || color(random(150, 255), random(0, 100), random(0, 100));
        this.size = random(5, 15);
        this.rotation = random(TWO_PI);
        this.rotationSpeed = random(-0.1, 0.1);
        this.shape = random(['circle', 'square', 'triangle']);
    }

    finished() {
        return this.alpha < 0;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= 5;
        this.rotation += this.rotationSpeed;
    }

    show() {
        push();
        translate(this.x, this.y);
        rotate(this.rotation);
        noStroke();
        fill(red(this.color), green(this.color), blue(this.color), this.alpha);

        if (this.shape === 'circle') {
            ellipse(0, 0, this.size);
        } else if (this.shape === 'square') {
            rectMode(CENTER);
            rect(0, 0, this.size, this.size);
        } else if (this.shape === 'triangle') {
            triangle(0, -this.size / 2, -this.size / 2, this.size / 2, this.size / 2, this.size / 2);
        }

        pop();
    }
}

