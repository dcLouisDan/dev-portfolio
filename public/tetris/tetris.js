const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");
const previewCanvas = document.getElementById("nextShape");
const previewCtx = previewCanvas.getContext("2d");
const holdCanvas = document.getElementById("holdShape");
const holdCtx = holdCanvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const finalScoreDisplay = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");
const startBtn = document.getElementById("startBtn");
const gameContainer = document.getElementById("gameContainer");
const canvasContainer = document.getElementById("canvasContainer");
const startMenu = document.getElementById("startMenu");
const gameOverMenu = document.getElementById("gameOverMenu");
const pausedText = document.querySelector(".paused-text");

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const PREVIEW_BLOCK_SIZE = 10;
const COMPLETED_LINE_INDEX = 8;
const SHADOW_COLOR_INDEX = 9;

const CANVAS_WIDTH = COLS * BLOCK_SIZE;
const CANVAS_HEIGHT = ROWS * BLOCK_SIZE;

const FLASH_DURATION = 100; // milliseconds
const TICK_SPEED_MS = 10;
const DEFAULT_SPEED = 100;
const PIECES_PER_SPEED_INCREASE = 10;
const SPEED_INCREASE_AMOUNT = 5;

const BASE_PIECE_SCORE = 25;
const LINE_CLEAR_BONUS = 100;

const gridArrayEmpty = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
const gridArrayState = Array.from(gridArrayEmpty, (row) => [...row]);
const colors = [
  "#00000000", // Empty
  "#5bbbecff",
  "#fff31cff",
  "#9e3ff6ff",
  "#f5345eff",
  "#3ada40ff",
  "#e08534ff",
  "#3339ecff",
  "#ffffffff",
  "#323232ff", // Completed line
];

const strokeColor = [
  "rgba(173, 173, 173, 0)", // Empty
  "#3a7895ff",
  "#a09914ff",
  "#6f2daeff",
  "#a42540ff",
  "#2a9b2dff",
  "#8b5322ff",
  "#1a1e7eff",
  "#f1fd4aff",
  "#7a7a7aff",
];

const shapes = [
  {
    geometry: [
      [1, 0, 0, 0],
      [1, 0, 0, 0],
      [1, 0, 0, 0],
      [1, 0, 0, 0],
    ],
    color: colors[1],
    size: 4,
  },
  {
    geometry: [
      [2, 2],
      [2, 2],
    ],
    color: colors[2],
    size: 2,
  },
  {
    geometry: [
      [3, 0, 0],
      [3, 3, 0],
      [3, 0, 0],
    ],
    color: colors[3],
    size: 3,
  },
  {
    geometry: [
      [0, 4, 0],
      [4, 4, 0],
      [4, 0, 0],
    ],
    color: colors[4],
    size: 3,
  },
  {
    geometry: [
      [5, 0, 0],
      [5, 5, 0],
      [0, 5, 0],
    ],
    color: colors[5],
    size: 3,
  },
  {
    geometry: [
      [6, 0, 0],
      [6, 0, 0],
      [6, 6, 0],
    ],
    color: colors[6],
    size: 3,
  },
  {
    geometry: [
      [7, 7, 0],
      [7, 0, 0],
      [7, 0, 0],
    ],
    color: colors[7],
    size: 3,
  },
];

// rotation states: 0 = 0, 1=90, 2=180, 3=270
const cursor = { x: Math.floor(COLS / 2) - 1, y: -4, rotation: 3 };
let currentShape = get_random_shape();
let nextShape = get_random_shape();
let holdShape = null;
let gameState = "playing"; // "playing", "paused", "flashing", "gameover"
let flashStartTime = 0;
let speed = DEFAULT_SPEED;
let tickCounter = 0;
let pieceCounter = 0;
let score = 0;

function init_canvas() {
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  ctx.fillStyle = "#494949ff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function reset_game() {
  copy_grid_array(gridArrayEmpty, gridArrayState);
  spawn_new_shape();
  gameState = "playing";
  speed = DEFAULT_SPEED;
  tickCounter = 0;
  pieceCounter = 0;
  score = 0;
}

function calc_drop_position() {
  let dropY = cursor.y;
  while (!check_collision(cursor.x, dropY + 1, currentShape, gridArrayState)) {
    dropY++;
  }
  return dropY;
}

function init_controls() {
  startBtn.addEventListener("click", () => {
    if (gameState === "menu" || gameState === "gameover") {
      reset_game();
    }
  });

  restartBtn.addEventListener("click", () => {
    if (gameState === "gameover") {
      reset_game();
    }
  });

  document.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "q":
        if (gameState === "playing") {
          gameState = "menu";
        }
        break;
      case "x":
        if (gameState != "playing") return;
        if (holdShape === null) {
          holdShape = currentShape;
          spawn_new_shape();
          draw_preview();
        } else {
          const temp = currentShape;
          currentShape = holdShape;
          holdShape = temp;
          draw_preview();
        }
        break;
      case "p":
        if (gameState === "playing") {
          gameState = "paused";
        } else if (gameState === "paused") {
          gameState = "playing";
        }
        break;
      case "r":
        reset_game();
        break;
      case "ArrowUp":
      case "z":
        if (
          !check_collision(
            cursor.x,
            cursor.y,
            currentShape,
            gridArrayState,
            (cursor.rotation + 1) % 4
          )
        ) {
          cursor.rotation = (cursor.rotation + 1) % 4;
        }
        break;
      case "ArrowDown":
        if (
          !check_collision(cursor.x, cursor.y + 1, currentShape, gridArrayState)
        )
          cursor.y += 1;
        break;
      case "ArrowLeft":
        if (
          !check_collision(cursor.x - 1, cursor.y, currentShape, gridArrayState)
        )
          cursor.x -= 1;
        break;
      case "ArrowRight":
        if (
          !check_collision(cursor.x + 1, cursor.y, currentShape, gridArrayState)
        )
          cursor.x += 1;
        break;
      case " ":
        if (gameState === "playing") {
          lock_piece(calc_drop_position());
        }
    }
  });
}

function draw_block(
  x,
  y,
  color,
  strokeColor = "#000000ff",
  blockSize = BLOCK_SIZE,
  canvasContext = ctx
) {
  canvasContext.fillStyle = color;
  canvasContext.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
  canvasContext.strokeStyle = strokeColor;
  canvasContext.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
}

function copy_grid_array(src, dest) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      dest[r][c] = src[r][c];
    }
  }
}

function rotate_shape(x, y, shape, rotation, onRotate = (x, y, shape) => {}) {
  switch (rotation) {
    case 0:
      for (let r = 0; r < shape.size; r++) {
        for (let c = 0; c < shape.geometry[r].length; c++) {
          if (shape.geometry[r][c] !== 0) {
            onRotate(x + c, y + r, shape);
          }
        }
      }
      break;
    case 1:
      for (let r = 0; r < shape.size; r++) {
        for (let c = 0; c < shape.geometry[r].length; c++) {
          if (shape.geometry[r][c] !== 0) {
            onRotate(x + shape.size - 1 - r, y + c, shape);
          }
        }
      }
      break;
    case 2:
      for (let r = 0; r < shape.size; r++) {
        for (let c = 0; c < shape.geometry[r].length; c++) {
          if (shape.geometry[r][c] !== 0) {
            onRotate(x + shape.size - 1 - c, y + shape.size - 1 - r, shape);
          }
        }
      }
      break;
    case 3:
      for (let r = 0; r < shape.size; r++) {
        for (let c = 0; c < shape.geometry[r].length; c++) {
          if (shape.geometry[r][c] !== 0) {
            onRotate(x + r, y + shape.size - 1 - c, shape);
          }
        }
      }
  }
}

function draw_shape(
  x,
  y,
  shape,
  isShadow = false,
  blockSize = BLOCK_SIZE,
  canvasContext = ctx,
  rotation = cursor.rotation,
  onDrawBlock = (r, c) => {}
) {
  rotate_shape(x, y, shape, rotation, (drawX, drawY, shape) => {
    draw_block(
      drawX,
      drawY,
      isShadow ? colors[SHADOW_COLOR_INDEX] : shape.color,
      isShadow
        ? strokeColor[SHADOW_COLOR_INDEX]
        : strokeColor[colors.indexOf(shape.color)],
      blockSize,
      canvasContext
    );
    onDrawBlock(drawY, drawX);
  });
}

function check_collision(x, y, shape, grid, rotation = cursor.rotation) {
  let collision = false;

  rotate_shape(x, y, shape, rotation, (checkX, checkY, shape) => {
    if (checkY >= ROWS || checkX < 0 || checkX >= COLS) {
      collision = true;
    } else if (checkY >= 0 && grid[checkY][checkX] !== 0) {
      collision = true;
    }
  });
  return collision;
}

function draw_grid() {
  ctx.strokeStyle = "#515151ff";
  for (let r = 0; r <= ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * BLOCK_SIZE);
    ctx.lineTo(CANVAS_WIDTH, r * BLOCK_SIZE);
    ctx.stroke();
  }

  for (let c = 0; c <= COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * BLOCK_SIZE, 0);
    ctx.lineTo(c * BLOCK_SIZE, CANVAS_HEIGHT);
    ctx.stroke();
  }
}

function draw_preview_hold_shape() {
  draw_preview(holdCtx, holdCanvas, holdShape);
}

function draw_preview(
  canvasContext = previewCtx,
  canvasElement = previewCanvas,
  previewShape = nextShape
) {
  let previewCanvasHeight = 0;
  let previewCanvasWidth = 0;
  canvasContext.fillStyle = "#1f1f1f";
  canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);

  rotate_shape(0, 0, previewShape, 0, (r, c, shape) => {
    previewCanvasHeight = Math.max(
      previewCanvasHeight,
      (c + 1) * PREVIEW_BLOCK_SIZE
    );
    previewCanvasWidth = Math.max(
      previewCanvasWidth,
      (r + 1) * PREVIEW_BLOCK_SIZE
    );
  });
  canvasElement.width = previewCanvasWidth;
  canvasElement.height = previewCanvasHeight;
  draw_shape(0, 0, previewShape, false, PREVIEW_BLOCK_SIZE, canvasContext, 0);
  console.log(canvasElement.width, canvasElement.height);
}

function draw_grid_state() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const colorIndex = gridArrayState[r][c];
      if (colorIndex !== 0) {
        draw_block(c, r, colors[colorIndex], strokeColor[colorIndex]);
      }
    }
  }
}

function clear_grid_display() {
  ctx.fillStyle = "#494949ff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  draw_grid();
}

function lock_shape(x, y, shape, rotation) {
  rotate_shape(x, y, shape, cursor.rotation, (lockX, lockY, shape) => {
    if (lockY >= 0 && lockY < ROWS && lockX >= 0 && lockX < COLS) {
      gridArrayState[lockY][lockX] = colors.indexOf(shape.color);
    }
  });
}

function get_random_shape() {
  const randomIndex = Math.floor(Math.random() * shapes.length);
  return shapes[randomIndex];
}

function spawn_new_shape() {
  cursor.x = Math.floor(COLS / 2) - 1;
  cursor.y = -nextShape.size;
  cursor.rotation = 0;
  currentShape = nextShape;
  nextShape = get_random_shape();
}

function lock_piece(y = cursor.y) {
  // Lock the shape in place
  lock_shape(cursor.x, y, currentShape, gridArrayState);
  // Spawn a new shape
  spawn_new_shape();
  draw_preview();
  pieceCounter++;
  score += BASE_PIECE_SCORE;
  if (pieceCounter % PIECES_PER_SPEED_INCREASE === 0 && speed > 1) {
    speed -= SPEED_INCREASE_AMOUNT;
  }
}

function init_game() {
  draw_preview();
  setInterval(() => {
    if (gameState !== "playing" || speed <= 0 || tickCounter++ % speed !== 0)
      return;
    if (
      !check_collision(cursor.x, cursor.y + 1, currentShape, gridArrayState)
    ) {
      cursor.y += 1;
    } else {
      lock_piece();
    }
  }, TICK_SPEED_MS);
}

function check_gameover() {
  for (let c = 0; c < COLS; c++) {
    if (gridArrayState[0][c] !== 0) {
      return true;
    }
  }
  return false;
}

function check_line_completion() {
  let completedLines = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (
      gridArrayState[r].every(
        (cell) => cell !== 0 && cell !== COMPLETED_LINE_INDEX
      )
    ) {
      const rowArray = gridArrayState[r];
      rowArray.forEach((_, index) => (rowArray[index] = COMPLETED_LINE_INDEX));
      completedLines++;
    }
  }

  if (completedLines > 0) {
    score += (LINE_CLEAR_BONUS * completedLines * (completedLines + 1)) / 2;
  }

  return completedLines > 0;
}

function clear_completed_lines() {
  let allCleared = true;
  do {
    allCleared = false;
    gridArrayState.forEach((row, rowIndex) => {
      if (row.every((cell) => cell === COMPLETED_LINE_INDEX)) {
        gridArrayState.splice(rowIndex, 1);
        gridArrayState.unshift(Array(COLS).fill(0));
        allCleared = true;
      }
    });
  } while (allCleared);
}

function game_loop() {
  clear_grid_display();
  scoreDisplay.textContent = score;
  if (check_gameover()) {
    gameState = "gameover";
    ctx.fillStyle = "#000000cc";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = "#ffffff";
    ctx.font = "48px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Game Over", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  }

  switch (gameState) {
    case "menu":
      startMenu.classList.remove("hidden");
      gameContainer.classList.add("hidden");
      canvasContainer.classList.remove("paused");
      break;
    case "paused":
      startMenu.classList.add("hidden");
      gameContainer.classList.remove("hidden");
      canvasContainer.classList.add("paused");
      pausedText.classList.remove("hidden");
      draw_shape(cursor.x, calc_drop_position(), currentShape, true);
      draw_shape(cursor.x, cursor.y, currentShape);
      draw_grid_state();
      break;

    case "playing":
      gameOverMenu.classList.add("hidden");
      startMenu.classList.add("hidden");
      gameContainer.classList.remove("hidden");
      canvasContainer.classList.remove("paused");
      pausedText.classList.add("hidden");
      draw_shape(cursor.x, calc_drop_position(), currentShape, true);
      draw_shape(cursor.x, cursor.y, currentShape);
      if (holdShape !== null) {
        draw_preview_hold_shape();
      }
      // draw_shape(0, 0, nextShape, false, PREVIEW_BLOCK_SIZE, previewCtx, 0);
      draw_grid_state();
      if (check_line_completion()) {
        gameState = "flashing";
        flashStartTime = performance.now();
      }
      break;
    case "flashing":
      draw_grid_state();
      if (performance.now() - flashStartTime > FLASH_DURATION) {
        clear_completed_lines();
        gameState = "playing";
      }
      break;
    case "gameover":
      gameOverMenu.classList.remove("hidden");
      gameContainer.classList.add("hidden");
      finalScoreDisplay.textContent = score;
      break;
  }
  requestAnimationFrame(game_loop);
}

init_canvas();
init_controls();
init_game();
game_loop();
