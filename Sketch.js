let grid = [];
let cols, rows; 
let size = 60;
let currentPlayer = 1;  // Start with player 1
let gameOver = false;
let timer = 0;  // Timer to delay the coin placement

let handPose;
let video;
let hands = [];
let options = {flipped: true};

let lastX = -1, lastY = -1;  // To track the previous position of the finger

function preload() {
  handPose = ml5.handPose(options);
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, {flipped: true});
  video.size(640, 480);
  video.hide();
  handPose.detectStart(video, gotHands);

  cols = floor(width / size);
  rows = floor(height / size);

  // Initialize the grid (0 means empty, 1 = player 1, 2 = player 2)
  for (let i = 0; i < cols; i++) {
    grid[i] = [];
    for (let j = 0; j < rows; j++) {
      grid[i][j] = 0; // Empty spot
    }
  }
}

function draw() {
  background(255);

  // ml5.js handPose Model
  image(video, 0, 0, width, height);

  // Only process hand tracking if game isn't over
  if (!gameOver) {
    for (let i = 0; i < hands.length; i++) {
      let hand = hands[i];
      for (let j = 0; j < hand.keypoints.length; j++) {
        let indexFinger = hand.keypoints[8];  // The index finger tip

        // Update last position and only proceed if the finger has moved significantly
        if (lastX !== -1 && (abs(indexFinger.x - lastX) > 10 || abs(indexFinger.y - lastY) > 10)) {
          // Detect the column where the finger is
          let column = floor(indexFinger.x / size);

          // Start the timer to place the coin after a delay
          if (timer <= 0) {
            placeCoin(column);
            timer = 30;  // Set a delay (frames)
          }
        }

        // Update last position
        lastX = indexFinger.x;
        lastY = indexFinger.y;
      }
    }
  }

  // Decrement timer
  if (timer > 0) {
    timer--;
  }

  // Draw the Connect 5 grid and coins
  drawBoard();

  // Display the winner message if the game is over
  if (gameOver) {
    textSize(32);
    fill(0);
    textAlign(CENTER, CENTER);
    text(`Player ${currentPlayer === 1 ? 2 : 1} Wins!`, width / 2, height / 2);
  }
}

function drawBoard() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j] !== 0) {
        // Draw the coin in the grid
        noStroke();
        if (grid[i][j] === 1) {
          fill(255, 223, 0);  // Player 1 (yellow)
        } else if (grid[i][j] === 2) {
          fill(255, 0, 0);    // Player 2 (red)
        }
        ellipse(i * size + size / 2, j * size + size / 2, size * 0.8, size * 0.8);
      }
    }
  }
}

function placeCoin(column) {
  // Find the first empty row in the selected column
  let y = -1;
  for (let i = rows - 1; i >= 0; i--) {
    if (grid[column][i] === 0) {
      y = i;
      break;
    }
  }

  if (y !== -1) {
    // Place the coin
    grid[column][y] = currentPlayer;

    // Check for a winner after the coin is placed
    if (checkWin(column, y)) {
      gameOver = true;  // Set the game to over if there is a winner
    }

    // Switch to the other player
    currentPlayer = (currentPlayer === 1) ? 2 : 1;
  }
}

function checkWin(x, y) {
  let directions = [
    [1, 0],  // Horizontal
    [0, 1],  // Vertical
    [1, 1],  // Diagonal down-right
    [1, -1]  // Diagonal up-right
  ];

  for (let dir of directions) {
    let count = 1; // The coin just placed

    // Check in both directions (positive and negative)
    for (let i = 1; i < 5; i++) {
      let nx = x + dir[0] * i;
      let ny = y + dir[1] * i;
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && grid[nx][ny] === currentPlayer) {
        count++;
      } else {
        break;
      }
    }

    for (let i = 1; i < 5; i++) {
      let nx = x - dir[0] * i;
      let ny = y - dir[1] * i;
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && grid[nx][ny] === currentPlayer) {
        count++;
      } else {
        break;
      }
    }

    if (count >= 5) {
      return true;  // Win found
    }
  }

  return false;  // No win
}

function gotHands(results) {
  hands = results;
}
