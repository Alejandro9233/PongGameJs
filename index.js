let playerName = "Player 1";
let difficultySelected = false;
let ballSpeed = 1.1;

document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("name");
  const easyButton = document.getElementById("easyButton");
  const mediumButton = document.getElementById("mediumButton");
  const hardButton = document.getElementById("hardButton");
  const startButton = document.getElementById("startButton");

  startButton.disabled = true;

  [easyButton, mediumButton, hardButton].forEach((button) => {
    button.addEventListener("click", () => {
      difficultySelected = button.value;
      checkInputs();
    });
  });

  nameInput.addEventListener("input", checkInputs);

  function checkInputs() {
    if (nameInput.value && difficultySelected) {
      startButton.disabled = false;
    } else {
      startButton.disabled = true;
    }
  }

  function setGameDifficulty(difficultySelected) {
    const canvas = document.getElementById("pongCanvas");

    const shadowColors = {
      easy: "rgba(117, 255, 25, 0.905)",
      medium: "rgba(255, 182, 25, 0.905)",
      hard: "rgba(255, 1, 1, 0.814)",
      default: "rgba(255, 255, 255, 0.186)",
    };

    const velocity = {
      easy: "4s",
      medium: "2s",
      hard: "1s",
    };

    const ballSpeedDic = {
      easy: 1.1,
      medium: 1.2,
      hard: 1.3,
    };

    let shadowColor =
      shadowColors[difficultySelected] || shadowColors["default"];

    let shadowPulse = velocity[difficultySelected] || velocity["easy"];

    ballSpeed = ballSpeedDic[difficultySelected] || ballSpeedDic["easy"];

    canvas.style.boxShadow = `0px 0px 10px 10px ${shadowColor}`;
    canvas.style.animation = `shadow-pulse-${difficultySelected} ${shadowPulse} infinite`;
  }

  startButton.addEventListener("click", (event) => {
    event.preventDefault();
    document.getElementById("previewScreen").style.display = "none";
    if (!gameStarted) {
      gameStarted = true;
      playerName = nameInput.value;
      setGameDifficulty(difficultySelected);
      update();
    }
  });
});

// GAME CODE

// Get the canvas element and its context
const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

// Resize the canvas to fit the window size
function resizeCanvas() {
  canvas.width = window.innerWidth * 0.9;
  canvas.height = window.innerHeight * 0.9;
}

// Call resizeCanvas when the window resizes
window.addEventListener("resize", resizeCanvas);

// Call resizeCanvas at the beginning to set the initial canvas size
resizeCanvas();

// Define the properties of the ball
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 10,
  dx: 2,
  dy: 2,
};

// Define the properties of the paddles
const paddleWidth = 20;
const paddleHeight = 110;
const player = {
  x: 10,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  dy: 2,
};
const computer = {
  x: canvas.width - (paddleWidth + 10),
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  dy: 2,
};

// Draw the ball
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();
}

// Draw the paddles
function drawPaddle(x, y, width, height) {
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();
}

function drawScores() {
  const fontSize = canvas.width / 30;
  ctx.font = fontSize + "px 'Garamond'";
  ctx.fillStyle = "white";
  ctx.fillText(playerName + ": " + playerScore, fontSize, fontSize);
  ctx.fillText(
    "Computer: " + computerScore,
    canvas.width - fontSize * 6.2,
    fontSize
  );
}

// Variables to store whether arrow keys are pressed
let upArrowPressed = false;
let downArrowPressed = false;
// Variable to control if the game has started
let gameStarted = false;

let playerScore = 0;
let computerScore = 0;
let updateCounter = 0;

// Event to start the game when a key is pressed
window.addEventListener("keydown", function (event) {
  if (!gameStarted) {
    return; // Do nothing if the game has not started
  }
});

const keyActions = {
  ArrowUp: {
    keydown: () => (upArrowPressed = true),
    keyup: () => (upArrowPressed = false),
  },
  ArrowDown: {
    keydown: () => (downArrowPressed = true),
    keyup: () => (downArrowPressed = false),
  },
};

["keydown", "keyup"].forEach((eventType) => {
  window.addEventListener(eventType, function (event) {
    const action = keyActions[event.key]?.[eventType];
    if (action) action();
  });
});

// Update the player paddle position
function updatePaddle() {
  if (upArrowPressed && player.y > 0) {
    player.y -= player.dy;
  } else if (downArrowPressed && player.y < canvas.height - player.height) {
    player.y += player.dy;
  }
}

// Reset the game
function resetGame() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.dx = 2;
  ball.dy = 2;
}

// Generate a random number between min and max
function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

// Update the ball position and detect collisions
function updateBall() {
  if (!gameStarted) {
    return; // Prevent updating the ball if the game has not started
  }

  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
    ball.dy = -ball.dy; // Change the direction of movement on the y-axis
  }

  if (ball.x + ball.radius > canvas.width) {
    playerScore++; // Increase player's score
    resetGame(); // Reset the game if the ball hits the right edge
    if (playerScore === 1) {
      endGame(playerName);
    }
  } else if (ball.x - ball.radius < 0) {
    computerScore++; // Increase computer's score
    resetGame(); // Reset the game if the ball hits the left edge
    if (computerScore === 7) {
      endGame("Computer");
    }
  }

  // Collision with player paddle
  if (
    ball.y + ball.radius > player.y &&
    ball.y - ball.radius < player.y + player.height &&
    ball.dx < 0
  ) {
    if (ball.x - ball.radius < player.x + player.width) {
      ball.dx = -ball.dx; // Change the direction of movement on the x-axis by reversing the speed
      ball.dx *= ballSpeed; // Increase the ball speed based on the difficulty
      ball.dy += getRandom(-1, 1); // Add a small random value to dy
    }
  }

  // Collision with computer paddle
  if (
    ball.y + ball.radius > computer.y &&
    ball.y - ball.radius < computer.y + computer.height &&
    ball.dx > 0
  ) {
    if (ball.x + ball.radius > computer.x) {
      ball.dx = -ball.dx; // Change the direction of movement on the x-axis by reversing the speed
      ball.dx *= ballSpeed; // Increase the ball speed based on the difficulty
      ball.dy += getRandom(-1, 1); // Add a small random value to dy
      // Do not increase the ball speed when hit by the computer paddle
    }
  }
}
function endGame(winner) {
  const endGameMessage =
    winner !== "Computer"
      ? `Congratulations ${winner}! You have won the game. Do you want to play again?`
      : `Sorry! ${winner} has won the game. Do you want to play again?`;

  alert(endGameMessage);

  restartButton.addEventListener("click", () => {
    // Refresca la página cuando se hace clic en el botón de reinicio
    location.reload();
  });
}

function updateComputerPaddle() {
  updateCounter++;

  if (updateCounter % 5 !== 0) {
    // Execute on all cycles except every fifth cycle
    const paddleMid = computer.y + computer.height / 2;
    if (paddleMid < ball.y) {
      computer.y += computer.dy;
    } else if (paddleMid > ball.y) {
      computer.y -= computer.dy;
    }
  } else {
    updateCounter = 0; // Reset the counter every fifth cycle
  }

  // Prevent the paddle from going out of the canvas
  if (computer.y < 0) {
    computer.y = 0;
  } else if (computer.y + computer.height > canvas.height) {
    computer.y = canvas.height - computer.height;
  }
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBall();
  drawPaddle(player.x, player.y, player.width, player.height);
  drawPaddle(computer.x, computer.y, computer.width, computer.height);
  drawScores();
  updatePaddle();
  updateBall();
  updateComputerPaddle();
  requestAnimationFrame(update);
}

// Start the game
update();
