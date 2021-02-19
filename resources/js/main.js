// Selecting Variables
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const startPanel = document.querySelector(".startPanel");
const panelHeighScore = document.getElementById("scoreBox");
const button = document.querySelector("button");

const img1 = document.querySelector('.img1');
const img2 = document.querySelector('.img2');
const explain = document.querySelector('.explain');

// Some explanations
// alert('MOBILE USERS: Use click. \nCOMPUTER USERS: Use "Space" to UP, "Shift" for down');

// Creating variables that we are going to use...
let score,
    scoreText,
    highScore,
    highScoreText,
    player,
    gravity,
    gameSpeed,
    jumpNow,
    getDown,
    enemies = [],
    keys = {};

// If local storage is empty, add a item.
if (!localStorage.getItem("highScoreForDino")) {
    localStorage.setItem("highScoreForDino", 0);
}

// Make mouse object
let mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2,
};

// Event listeners for keydown, keyup, mousedown, touchstart.
document.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    e.preventDefault();
});
document.addEventListener("keyup", (e) => {
    keys[e.code] = false;
});

window.addEventListener("mousedown", (e) => {
    jumpNow = true;
    getDown = true;
    mouse.x = e.x;
    mouse.y = e.y;
});

window.addEventListener("touchstart", (e) => {
    jumpNow = true;
    getDown = true;
    mouse.x = e.changedTouches[0].clientX;
    mouse.y = e.changedTouches[0].clientY;
});

// Canceling jumpNow and getDown boolean
setInterval(() => {
    jumpNow = false;
}, 500);

setInterval(() => {
    getDown = false;
}, 2000);

// Player object
class Player {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;

        // Some variables we are going to use.
        this.weight = 0;
        this.jumpForce = 10;
        this.originalHeight = height;
        this.grounded = false;
        this.jumpTimer = 0;
    }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.closePath();
    }
    // Jump function.
    jump() {
        if (this.grounded && this.jumpTimer == 0) {
            this.jumpTimer = 1;
            this.weight = -this.jumpForce;
        } else if (this.jumpTimer > 0 && this.jumpTimer < 15) {
            this.jumpTimer++;
            this.weight = -this.jumpForce - this.jumpTimer / 50;
        }
    }
    update() {
        // Jump
        if (keys["Space"] || keys["KeyW"]) {
            this.jump();
        } else if (jumpNow && mouse.y < canvas.height / 2) {
            this.jump();
        } else {
            this.jumpTimer = 0;
        }

        // Shrinks
        if (keys["ShiftRight"] || keys["ShiftLeft"]) {
            this.height = this.originalHeight / 2;
        } else if (getDown && mouse.y > canvas.height / 2) {
            this.height = this.originalHeight / 2;
            setTimeout(() => {
                this.height = this.originalHeight;
            }, 1000);
        } else {
            this.height = this.originalHeight;
        }

        this.y += this.weight;

        // Gravity
        if (this.y + this.height < canvas.height) {
            this.weight += gravity;
            this.grounded = false;
        } else {
            this.weight = 0;
            this.grounded = true;
            this.y = canvas.height - this.height;
        }

        this.draw();
    }
}

// Create enemy object.
class Enemy {
    constructor(x, y, width, height, image) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = image;

        this.dx = -gameSpeed;
    }
    draw() {
        ctx.beginPath();
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        ctx.closePath();
    }
    update() {
        this.x += this.dx;
        this.dx = -gameSpeed;
        this.draw();
    }
}

// Creating Text Object to draw text.
class text {
    constructor(text, x, y, align, color, size) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.align = align;
        this.color = color;
        this.size = size;
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.font = this.size + "px sans-serif";
        ctx.textAlign = this.align;
        ctx.fillText(this.text, this.x, this.y);
    }
}

// To spread the enemies.
function spawnEnemy() {
    let size = Math.round(Math.random() * 40 + 30);
    let type = Math.round(Math.random() * 1);           // Type of enemy.
    let enemy = new Enemy(
        canvas.width + size,
        canvas.height - size,
        size,
        size,
        img1
    );

    // There will be two types of enemy.
    // 1) tree      2) bird
    if (type == 1) {
        enemy.y -= player.originalHeight - 10;
        enemy.image = img2;
    }
    enemies.push(enemy);
}

// Start game.
function start() {
    canvas.width = window.innerWidth;
    canvas.height = 500;
    score = 0;
    highScore = 0;

    // Get the high Score.
    if (localStorage.getItem("highScoreForDino")) {
        highScore = localStorage.getItem("highScoreForDino");
    } else {
        localStorage.setItem("highScoreForDino", 0);
    }

    // Declare the game speed and gravity.
    gameSpeed = 4;
    gravity = 1;
    player = new Player(window.innerWidth / 20, 0, 50, 50, "#ff5858");

    scoreText = new text("Score: " + score, 25, 25, "left", "white", "20");
    highScoreText = new text(
        "High Score: " + highScore,
        25,
        50,
        "left",
        "white",
        "20"
    );

    animate();
}

// Animate function.
let spawnTimer = 100;
function animate() {
    let animateId = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.update();

    // Draw Ground.
    ctx.fillStyle = "white";
    ctx.fillRect(0, canvas.height - 4, canvas.width, 4);

    // If spawn timer is less then 0, Enemy comes.
    spawnTimer--;
    if (spawnTimer <= 0) {
        spawnEnemy();
        // To make the game faster.
        spawnTimer = 150 - gameSpeed * 8;

        // Fixing the speed.
        if (spawnTimer < 50) {
            spawnTimer = 50;
        }
    }
    
    scoreText.text = "Score: " + score;
    scoreText.draw();
    highScoreText.draw();
    gameSpeed += 0.003;

    enemies.forEach((enemy, index) => {
        enemy.update();

        if (enemy.x + enemy.width < 0) {
            enemies.splice(index, 1);
        }

        if (
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        ) {
            panelHeighScore.textContent = score;
            panelHeighScore.parentNode.classList.toggle("shown");
            if (score > highScore) {
                localStorage.setItem("highScoreForDino", score);
                highScoreText.text = "High Score: " + highScore;
            }
            cancelAnimationFrame(animateId);
        }

        score++;
    });
}

button.addEventListener("click", () => {
    score = 0;
    enemies = [];
    explain.classList.add('remove');
    panelHeighScore.parentNode.classList.toggle("shown");
    start();
});
