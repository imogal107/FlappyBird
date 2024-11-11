

// script.js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bird, pipes, gameOver, frames;
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;
// Display initial best score
document.getElementById("bestScore").innerText = `Best Score: ${bestScore}`;
let gameStarted = false;
let sparkles = [];

// Pipe gap control
let horizontalDistance = 240; // Initial horizontal distance
let verticalGap = 175; // Initial vertical gap set to 175 units
const minHorizontalDistance = 150; // Minimum horizontal distance limit
const minVerticalGap = 130; // Minimum vertical gap limit

const playButton = document.getElementById("playButton");
const soundSettingsButton = document.getElementById("soundSettingsButton");
const soundSettingsPopup = document.getElementById("soundSettingsPopup");
const closeSettingsButton = document.getElementById("closeSettingsButton");
const toggleLobbyMusic = document.getElementById("toggleLobbyMusic");
const toggleInGameMusic = document.getElementById("toggleInGameMusic");
const lobbybox = document.getElementById("lobbybox");
const gameOverPopup = document.getElementById("gameOverPopup");
const retryButton = document.getElementById("retryButton");
const backButton = document.getElementById("backButton");
const scoreText = document.getElementById("score");


// Load images
const topPipeImg = new Image('');
const bottomPipeImg = new Image();
const canvasBackgroundImg = new Image();
const pinkBirdImg = new Image();
const blueBirdImg = new Image();
const greenBirdImg = new Image();
const redBirdImg = new Image();

// Assign image sources
canvasBackgroundImg.src = './images/background/background.png';
topPipeImg.src = './images/pipes/pipeTop.png';
bottomPipeImg.src = './images/pipes/pipeBottom.png';
pinkBirdImg.src = './images/birds/pinkbird.png';
blueBirdImg.src = './images/birds/bluebird.png';
greenBirdImg.src = './images//birds/greenbird.png';
redBirdImg.src = './images/birds/redbird.png';

// Add resize event listener to adjust canvas size dynamically on window resize
window.addEventListener('resize', function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Check if all images are loaded before starting the game
let imagesLoaded = 0;
const totalImages = 7;

function checkImagesLoaded() {
  imagesLoaded++;
  if (imagesLoaded === totalImages) {
    // Once all images are loaded, you can start the game
    gameLoop();
  }
}

topPipeImg.onload = checkImagesLoaded;
bottomPipeImg.onload = checkImagesLoaded;
canvasBackgroundImg.onload = checkImagesLoaded;
pinkBirdImg.onload = checkImagesLoaded;
blueBirdImg.onload = checkImagesLoaded;
greenBirdImg.onload = checkImagesLoaded;
redBirdImg.onload = checkImagesLoaded;



//sound effect paths
const pointSound = new Audio("./soundeffects/point-sound.mp3");
const dieSound = new Audio("./soundeffects/die-sound.mp3");
const flapSound = new Audio("./soundeffects/flap-sound.mp3");
const bgMusic = new Audio("./soundeffects/bgsound.mp3"); 
const igMusic = new Audio("./soundeffects/cool-jazz-loops.mp3");

// Set looping for background and in-game music
bgMusic.loop = true;
igMusic.loop = true;
let isLobbyMusicOn = false;
let isInGameMusicOn = true;
let inLobby = true;
igMusic.volume = 0.09;
bgMusic.volume = 0.09;

// Play bgMusic when on the lobby screen
// playLobbyMusic();

//intialize values for game
function initializeGame() {
  bird = {
    x: 50,
    y: 300,
    width: 30,
    height:30,
    gravity: 0.1,
    lift: -4,
    velocity: 0,
  };
  pipes = [];
  score = 0;
  gameOver = false;
  frames = 0;
  lastPipeFrame = 0;
  horizontalDistance = 240; // Reset horizontal distance to 240
  verticalGap = 175; // Reset vertical gap to 175 units
  gameStarted = true;
  document.getElementById("score").innerText = `Score: ${score}`;
  gameOverPopup.classList.add("hidden");
  gameOverPopup.style.opacity = 0;
  sparkles = [];
}

// Show sound settings popup
soundSettingsButton.addEventListener("click", () => {
  soundSettingsPopup.classList.remove("hidden");
});

// Close sound settings popup
closeSettingsButton.addEventListener("click", () => {
  soundSettingsPopup.classList.add("hidden");
});

// Toggle lobby music
toggleLobbyMusic.addEventListener("change", () => {
  isLobbyMusicOn = toggleLobbyMusic.checked;
  playLobbyMusic();
});

// Play lobby music
function playLobbyMusic() {
  if (isLobbyMusicOn) {
    bgMusic.play();
  } else {
    bgMusic.pause();
  }
}

// Toggle in-game music
toggleInGameMusic.addEventListener("change", () => {
  isInGameMusicOn = toggleInGameMusic.checked;
  playInGameMusic();
});

// Play in-game music
function playInGameMusic() {
  if (isInGameMusicOn && !inLobby) {
    igMusic.play();
  } else {
    igMusic.pause();
  }
}

// Start the game on the first click of the "Play" button
playButton.addEventListener("click", () => {
  // Stop the lobby background music and start in-game music
  inLobby = false;
  bgMusic.pause();
  bgMusic.currentTime = 0; // Reset to beginning in case of replay
  playInGameMusic(); // Start in-game music
  initializeGame();
  scoreText.style.display = "block";
  lobbybox.style.display = "none";
  gameLoop();
});

// Retry the game on "Retry" button click
retryButton.addEventListener("click", () => {
  // Remove the animation after 5 seconds
  setTimeout(() => {
    bestScoreText.style.animation = ""; // Reset the animation
  }, 0); // Stop the effect after 0 seconds
  igMusic.currentTime = 0; // Reset in-game music
  playInGameMusic();
  initializeGame();
  gameLoop();
});

backButton.addEventListener("click", () => {
  inLobby = true;
  // Hide the Game Over popup
  scoreText.style.display = "none";
  gameOverPopup.classList.add("hidden");
  playLobbyMusic();

  // Stop in-game music and reset its time
  igMusic.pause();
  igMusic.currentTime = 0;

  // Show the Play button to return to the lobby screen
  lobbybox.style.display = "flex";

  // Reset game state
  gameStarted = false;
  gameOver = false;
  score = 0;
  document.getElementById("score").innerText = `Score: ${score}`;

  // Clear pipes and reset bird position for fresh start
  pipes = [];
  bird.y = 300; // Reset bird's Y position
  bird.velocity = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground()

  // Remove the animation after 5 seconds
  setTimeout(() => {
    bestScoreText.style.animation = ""; // Reset the animation
  }, 0); // Stop the effect after 0 seconds
});

// Function to trigger the heartbeat effect
const bestScoreText = document.getElementById("bestScore");
function triggerHeartbeat() {
  // Add the heartbeat animation class to trigger the effect
  bestScoreText.style.animation = "heartbeat 0.6s ease-in-out infinite";
}

// Listen for jump action when game is started
document.addEventListener("keydown", () => {
  if (gameStarted && !gameOver) bird.velocity = bird.lift;
  flapSound.play();
});

// Prevent scrolling on touch devices when touching the game area
gameCanvas.addEventListener("touchmove", (event) => {
  event.preventDefault();
});

document.addEventListener("touchstart", () => {
  if (gameStarted && !gameOver) bird.velocity = bird.lift;
  flapSound.play();
});

// Function to draw the background image
function drawBackground() {
  ctx.drawImage(canvasBackgroundImg, 0, 0, canvas.width, canvas.height);
}


let birdImage;
function drawBird() {
  // Determine the bird color based on the score
  birdImage=pinkBirdImg
  if (score < 50) {
    birdImage = pinkBirdImg;
  } else if (score < 100) {
    birdImage = blueBirdImg;
  } else if (score < 200) {
    birdImage = greenBirdImg;
  } else {
    birdImage = redBirdImg;
  }

  ctx.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);

  drawSparkles();
}

function drawPipes() {
  pipes.forEach((pipe) => {
      // Top pipe
      ctx.drawImage(topPipeImg, pipe.x, 0 , pipe.width, pipe.top);
      // Bottom pipe
      ctx.drawImage(bottomPipeImg, pipe.x, canvas.height-pipe.bottom, pipe.width, pipe.bottom);
  });
}

let lastPipeFrame = 0; // Track the last frame a pipe was generated
function updatePipes() {
  // Generate a new pipe based on the updated horizontal distance
  if (frames - lastPipeFrame >= horizontalDistance) {
    let top =Math.floor(Math.random() * (canvas.height - verticalGap - 100)) + 50;
    let bottom = canvas.height - top - verticalGap;
    pipes.push({
      x: canvas.width,
      width: 50,
      top: top,
      bottom: bottom,
      passed: false,
    });
    lastPipeFrame = frames; // Update the lastPipeFrame to current frame
  }

  pipes.forEach((pipe) => {
    let pipeSpeed = 1.5; // Base speed
    if (score > 50 && score <= 60) {
      pipeSpeed = 2;
    } else if (score > 60 && score <= 75) {
      pipeSpeed = 2.5;
    } else if (score > 75 && score <= 90) {
      pipeSpeed = 2.75;
    } else if (score > 90 && score <= 105) {
      pipeSpeed = 3;
    } else if (score > 105 && score <= 120) {
      pipeSpeed = 3.25;
    } else if (score > 120) {
      pipeSpeed = 3.5;
    }
    // Move pipes horizontally
    pipe.x -= pipeSpeed;
    if (pipe.x + pipe.width < 0) { // Remove off-screen pipes
      pipes.shift();
    }
    // Check for collision with pipes
    if (
      bird.x < pipe.x + pipe.width &&
      bird.x + bird.width > pipe.x &&
      (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom)
    ) {
      endGame();
    }

    if (!pipe.passed && pipe.x + pipe.width < bird.x) {
      pointSound.play();
      score++;
      pipe.passed = true;
      document.getElementById("score").innerText = `Score: ${score}`;

      // Add sparkle effect
      createSparkles(
        bird.x + bird.width / 2,
        bird.y + bird.height / 2,
        birdImage
      );

      // Adjust horizontal distance permanently every 7 points
      if (score % 7 == 0 && horizontalDistance > minHorizontalDistance) {
        horizontalDistance -= 15;
        console.log(horizontalDistance);
      }

      // Start adjusting vertical gap after every 100 points
      if (
        horizontalDistance === minHorizontalDistance &&
        score > 6 &&
        score % 6 === 0 &&
        verticalGap > minVerticalGap
      ) {
        verticalGap -= 5; // Reduce vertical gap by 2 units
      }
    }
  });

  // Remove off-screen pipes
  pipes = pipes.filter((pipe) => pipe.x + pipe.width > 0);
}

//create sparkles (behind bird)
function createSparkles(x, y, color) {
  for (let i = 0; i < 10; i++) {
    sparkles.push({
      x: x,
      y: y,
      size: Math.random() * 4 + 1, // Random size
      dx: (Math.random() - 0.5) * 4, // Horizontal velocity
      dy: (Math.random() - 0.5) * 4, // Vertical velocity
      life: 20, // Particle life span
      color: color,
    });
  }
}

//draw sparkles (behind bird)
function drawSparkles() {
  for (let i = sparkles.length - 1; i >= 0; i--) {
    const sparkle = sparkles[i];
    ctx.fillStyle = sparkle.color;
    ctx.fillRect(sparkle.x, sparkle.y, sparkle.size, sparkle.size);
    sparkle.x += sparkle.dx;
    sparkle.y += sparkle.dy;
    sparkle.life--;

    if (sparkle.life <= 0) {
      sparkles.splice(i, 1); // Remove sparkle if its life ends
    }
  }
}

function updateBird() {
  // Increase bird fall speed slightly with the score (or at specific levels)
  if (score > 50 && score <= 60) {
    bird.gravity = 0.11;
    bird.lift = -4.1;
  } else if (score > 60 && score <= 75) {
    bird.gravity = 0.12;
    bird.lift = -4.2;
  } else if (score > 75 && score <= 90) {
    bird.gravity = 0.13;
    bird.lift = -4.3;
  } else if (score > 90 && score <= 105) {
    bird.gravity = 0.4;
    bird.lift = -4.4;
  } else if (score > 105 && score <= 120) {
    bird.gravity = 0.15;
    bird.lift = -4.5;
  } else if (score > 120) {
    bird.gravity = 0.155;
    bird.lift = -4.45;
  }

  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  // Check if bird is out of bounds
  if (bird.y + bird.height > canvas.height || bird.y < 0) {
    endGame();
  }
}

function endGame() {
  // Check if current score is greater than best score
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestScore", bestScore);
    document.getElementById("bestScore").innerText = `Best Score: ${bestScore}`;
    triggerHeartbeat();
  }

  gameOver = true;
  gameStarted = false;
  igMusic.pause(); // Pause in-game music on game over
  igMusic.currentTime = 0; // Reset to beginning for next play
  dieSound.play();
  // Bird tumbling fall animation
  let tumbleFrames = 145; // Number of frames for the tumbling fall
  let angle = 0;

  function tumbleFall() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground()
    // Draw pipes
    drawPipes();
    // Draw the bird with rotation
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2); // Move to bird center
    ctx.rotate((angle * Math.PI) / 180); // Rotate bird
    ctx.drawImage(birdImage, -bird.width / 2, -bird.height / 2, bird.width, bird.height); // Draw rotated bird
    ctx.restore();

    // Apply falling effect
    bird.y += 4; // Move bird downward
    angle += 10; // Increase rotation angle

    if (tumbleFrames > 0) {
      tumbleFrames--;
      requestAnimationFrame(tumbleFall);
    } else {
      showGameOverScreen();
    }
  }
  tumbleFall(); // Start the tumble fall animation
}

// Function to display the "Game Over" screen with fade-in effect
function showGameOverScreen() {
  gameOverPopup.classList.remove("hidden"); // Make the Game Over popup visible
  gameOverPopup.style.opacity = 0; // Reset opacity before fade-in
  let opacity = 0;
  function fadeIn() {
    opacity += 0.05;
    gameOverPopup.style.opacity = opacity;
    if (opacity < 1) {
      requestAnimationFrame(fadeIn);
    }
  }
  fadeIn(); // Start the fade-in animation for the Game Over popup
}


function gameLoop() {
  if (gameOver) return;

  frames++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawBird();
  drawPipes();
  updateBird();
  updatePipes();

  requestAnimationFrame(gameLoop);
}
