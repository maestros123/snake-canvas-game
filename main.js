const canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    scoreEl = document.getElementById("score"),
    resetEl = document.getElementById("reset"),
    highScoreEl = document.getElementById("high-score"),
    pauseEl = document.getElementById("pause"),
    gameText = document.getElementById("game__text"),
    levelChoice = document.querySelectorAll('.level'),
    controlsColors = document.querySelectorAll('.controls__color');

let score = 0;

const screenHeight = window.innerHeight // Получаем доступный размер экрана пользователя
const canvasSize = screenHeight - 20;  // Чуть уменьшаем размеры canvas для создания отступов


// Устанавливаем размеры и цвет
const w = (canvas.width = canvasSize);
const h = (canvas.height = canvasSize);

const setScore = () => {
    scoreEl.innerHTML = `Результат: ${score}`;
    if (score >= localStorage.getItem("highScore"))
        localStorage.setItem("highScore", score);
    highScoreEl.innerHTML = `Рекорд: ${localStorage.getItem("highScore")}`;
};

// Установка сложности игры
let difficulty = {
    snakeSpeed: 5,
    itemScore: 1,
    cellCount: 25,
    cellSize: canvasSize / 25,
};

levelChoice.forEach(item => {
    item.addEventListener('change', () => {
        choiceLvl(item.id);
        item.checked = true;
        difficulty.cellSize = canvasSize / difficulty.cellCount;
    });
});

const choiceLvl = (id) => {
    levelChoice.forEach(input => {
        input.checked = false;
    });

    const levels = {
        easy: { snakeSpeed: 5, itemScore: 1, cellCount: 25 },
        medium: { snakeSpeed: 10, itemScore: 2, cellCount: 50 },
        hard: { snakeSpeed: 50, itemScore: 3, cellCount: 75 },
    };
    if (!gameActive) {
        difficulty.snakeSpeed = levels[id].snakeSpeed;
        difficulty.itemScore = levels[id].itemScore;
        difficulty.cellCount = levels[id].cellCount;
    }
};

let gameActive;

// Цветовые вариации змейки
let colors = {
    background: '#0f1423',
    snake: '#6ca270',
    food: '#c14343',
    head: ["#97c290", "#5b7c58", "#a2d6c4"]
};

const choiceColor = (color) => {
    const colorsData = {
        green: {background: '#0f1423', snake: '#6ca270', food: '#c14343', head: ["#A4D4AE", "#658A64", "#F7B538"]},
        yellow: {background: '#000000', snake: '#ffd966', food: '#9b59b6', head: ["#C5E5A5", "#7D6608", "#4B4E6D"]},
        orange: {background: '#ffffff', snake: '#ff8c00', food: '#2ecc71', head: ["#FFB7B2", "#BC4611", "#F6EAC2"]},
        red: {background: '#34495e', snake: '#e74c3c', food: '#f1c40f', head: ["#F0B2A7", "#7E0A0A", "#3D3B8E"]},
        blue: {background: '#bdc3c7', snake: '#3498db', food: '#e91e63', head: ["#A5C9D6", "#425E72", "#FF5A5F"]}
    }

    if (!gameActive) {
        controlsColors.forEach(item => {
            item.classList.remove('controls__color--active');
        })
        colors.background = colorsData[color].background;
        colors.snake = colorsData[color].snake;
        colors.food = colorsData[color].food;
        colors.head = colorsData[color].head;
    }
}

let canvasFillColor = colors.background;

controlsColors.forEach(color => {
    color.addEventListener('click', () => {
        choiceColor(color.id);
        color.classList.add('controls__color--active');
        canvasFillColor = colors.background;
        food.color = colors.food;
    })
})


const randomColor = () => {
    let color;
    color = colors.head[Math.floor(Math.random() * 3)];
    return color;
};

// Установим начальную позицию головы, цвет и направление движения
const head = {
    x: 2,
    y: 1,
    color: randomColor(),
    vX: 0,
    vY: 0,
    draw: () => {
        ctx.fillStyle = head.color;
        ctx.shadowColor = head.color;
        ctx.shadowBlur = 2.5;
        ctx.fillRect(
            head.x * difficulty.cellSize,
            head.y * difficulty.cellSize,
            difficulty.cellSize,
            difficulty.cellSize
        );
    },
};

let tailLength = 4;
let snakeParts = [];

class Tail {
    color = colors.snake;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 2.5;
        ctx.fillRect(
            this.x * difficulty.cellSize,
            this.y * difficulty.cellSize,
            difficulty.cellSize,
            difficulty.cellSize
        );
    }
}

let food = {
    x: Math.floor(Math.random() * difficulty.cellCount),
    y: Math.floor(Math.random() * difficulty.cellCount),
    color: colors.food,
    draw: () => {
        ctx.fillStyle = food.color;
        ctx.shadowColor = food.color;
        ctx.shadowBlur = 5;
        ctx.fillRect(
            food.x * difficulty.cellSize,
            food.y * difficulty.cellSize,
            difficulty.cellSize,
            difficulty.cellSize
        );
    },
};


const setCanvas = () => {
    ctx.fillStyle = canvasFillColor;
    ctx.fillRect(0, 0, w, h);
};


const drawSnake = () => {
    snakeParts.forEach((part) => {
        part.draw();
    });

    snakeParts.push(new Tail(head.x, head.y));

    if (snakeParts.length > tailLength) {
        snakeParts.shift();
    }
    head.color = randomColor();
    head.draw();
};

const updateSnakePosition = () => {
    head.x += head.vX;
    head.y += head.vY;
};

const changeDir = (e) => {
    let key = e.keyCode;

    if (key === 68 || key === 39) {
        changeD(1,0, -1)
    }
    if (key === 65 || key === 37) {
        changeD(-1,0, 1)
    }
    if (key === 87 || key === 38) {
        changeD(0,-1, 1);
    }
    if (key === 83 || key === 40) {
        changeD(0,1, -1)
    }
};

const changeD = (x, y, num) => {
    if (y === 0) {
        if (head.vX === num) return;
    } else {
        if (head.vY === num) return;
    }
    head.vX = x;
    head.vY = y;
    gameActive = true;
    return;
}

const foodCollision = () => {
    let foodCollision = false;
    snakeParts.forEach((part) => {
        if (part.x === food.x && part.y === food.y) {
            foodCollision = true;
        }
    });
    if (foodCollision) {
        food.x = Math.floor(Math.random() * difficulty.cellCount);
        food.y = Math.floor(Math.random() * difficulty.cellCount);
        score += difficulty.itemScore;
        tailLength += difficulty.itemScore;
    }
};

const isGameOver = () => {
    let gameOver = false;
    snakeParts.forEach((part) => {
        if (part.x === head.x && part.y === head.y) {
            gameOver = true;
        }
    });

    if (head.x < 0 || head.y < 0 || head.x > difficulty.cellCount - 1 || head.y > difficulty.cellCount - 1) {
        gameOver = true;
    }

    return gameOver;
};

//Показываем надпись
const showText = (text) => {
    gameText.style.display = "block";
    gameText.innerHTML = text;
};

addEventListener("keydown", changeDir);

const PlayButton = (show) => {
    if (!show) {
        gameText.style.display = "none";
    } else {
        gameText.style.display = "block";
    }
};

const pauseGame = () => {
    gameActive = false;
    if (!gameActive) {
        pauseEl.classList.remove('pause-active')
        pauseEl.classList.add('pause-not-active')
        showText('Пауза')
    }
    if (!isGameOver()) PlayButton(true);
};

pauseEl.addEventListener("click", pauseGame);


const animate = () => {
    setCanvas();
    drawSnake();
    food.draw();
    if (gameActive) {
        PlayButton(false);
        pauseEl.removeAttribute('class');
        pauseEl.setAttribute('class', 'pause-active');
        updateSnakePosition();
        if (isGameOver()) {
            showText("Конец игры!");
            return;
        }
    }
    setScore();
    foodCollision();
    setTimeout(animate, 1000 / difficulty.snakeSpeed);
};

const resetGame = () => {
    newGame();
};


const newGame = () => {
    if (isGameOver()) {
        score = 0;
        snakeParts = [];
        tailLength = 4;
        gameActive = false;
        head.x = 2;
        head.y = 1;
        head.vX = 0;
        head.vY = 0;
        showText('Нажмите любую кнопку, чтобы начать игру')
        animate()
    }
}

resetEl.addEventListener("click", resetGame);


animate();


