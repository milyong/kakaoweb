class EventEmitter {
    constructor() {
        this.listeners = {};
    }
    on(message, listener) {
        if (!this.listeners[message]) {
            this.listeners[message] = [];
        }
        this.listeners[message].push(listener);
    }
    emit(message, payload = null) {
        if (this.listeners[message]) {
            this.listeners[message].forEach((l) => l(message, payload));
        }
    }

    clear() {
        this.listeners = {};
        }
}

class GameObject {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.dead = false;
        this.type = "";
        this.width = 0;
        this.height = 0;
        this.img = undefined;
    }
    rectFromGameObject() {
        return {
            top: this.y,
            left: this.x,
            bottom: this.y + this.height,
            right: this.x + this.width,
        };
    }
    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
}

class HeroSub extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 33;
        this.height = 25;
        this.type = "HeroSub";
        this.lastFireTime = 0; // 마지막 발사 시간
    }

    fire() {
        const now = Date.now();
        const fireDelay = 500; // 0.5초 간격

        // 처음은 약간 천천히, 이후는 지속적으로 0.5초 간격
        if (now - this.lastFireTime >= fireDelay) {
            gameObjects.push(new Laser(this.x + this.width / 2 - 4, this.y - 10));
            this.lastFireTime = now; // 마지막 발사 시간 업데이트
        }
    }
}

class Hero extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 99;
        this.height = 75;
        this.type = "Hero";
        this.cooldown = 0;
        this.life = 3;
        this.points = 0;
        this.isLongLaserActive = false; // 긴 레이저 활성화 상태
        this.longLaser = null; // 긴 레이저 객체 참조
    }

    fire() {
        if (this.canFire()) {
            gameObjects.push(new Laser(this.x + 45, this.y - 10));
            this.cooldown = 500;
            let id = setInterval(() => {
                if (this.cooldown > 0) {
                    this.cooldown -= 100;
                } else {
                    clearInterval(id);
                }
            }, 100);
        }
    }

    fireLongLaser() {
        if (!this.isLongLaserActive && longLaserImg) {
            console.log("Firing Long Laser!");
            this.longLaser = new LongLaser(this.x + this.width / 2 - 4, this.y - canvas.height);
            gameObjects.push(this.longLaser);
            this.isLongLaserActive = true;
        }
    }

    stopLongLaser() {
        if (this.longLaser) {
            console.log("Stopping Long Laser!");
            this.longLaser.dead = true; // 긴 레이저 제거
            this.longLaser = null;
            this.isLongLaserActive = false;
        }
    }
    
    canFire() {
        return this.cooldown === 0;
    }

    decrementLife() {
        this.life--;
        if (this.life === 0) {
            this.dead = true;
        }
    }

    incrementPoints() {
        this.points += 100;
        }
}

class Laser extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 9;
        this.height = 33;
        this.type = "Laser";
        this.img = laserImg;
        let id = setInterval(() => {
            if (this.y > 0) {
                this.y -= 15;
            } else {
                this.dead = true;
                clearInterval(id);
            }
        }, 100);
    }
}

class LongLaser extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 9; // 기존 Laser와 동일
        this.height = canvas.height; // 화면 전체 높이
        this.type = "LongLaser";
        this.img = longLaserImg;
        console.log("Long Laser created at:", { x: this.x, y: this.y });
    }

    draw(ctx) {
        if (!this.dead && this.img) {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
    }
}


class Enemy extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 98;
        this.height = 50;
        this.type = "Enemy";
        let id = setInterval(() => {
            if (this.y < canvas.height - this.height) {
                this.y += 5;
            } else {
                clearInterval(id);
            }
        }, 300);
    }
}

class Explosion extends GameObject {
    constructor(x, y, img) {
        super(x, y);
        this.width = 90;
        this.height = 90;
        this.type = "Explosion";
        this.img = img;

        // 500ms 후 폭발 제거
        setTimeout(() => {
            this.dead = true;
        }, 100);
    }
}

const Messages = {
    KEY_EVENT_UP: "KEY_EVENT_UP",
    KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
    KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
    KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
    KEY_EVENT_SPACE: "KEY_EVENT_SPACE",
    COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
    GAME_END_LOSS: "GAME_END_LOSS",
    GAME_END_WIN: "GAME_END_WIN",
    KEY_EVENT_ENTER: "KEY_EVENT_ENTER",
};

let heroImg,
    enemyImg,
    laserImg,
    longLaserImg,
    explosionImg,
    canvas,
    ctx,
    gameObjects = [],
    hero,
    heroSub1,
    heroSub2,
    lifeImg,
    eventEmitter = new EventEmitter();
    let keysPressed = {}; // 현재 눌린 키 상태를 추적

    window.addEventListener("keydown", (evt) => {
        keysPressed[evt.key] = true; // 키 눌림 상태 기록
    
        if (evt.key === "ArrowUp") {
            eventEmitter.emit(Messages.KEY_EVENT_UP);
        } else if (evt.key === "ArrowDown") {
            eventEmitter.emit(Messages.KEY_EVENT_DOWN);
        } else if (evt.key === "ArrowLeft") {
            eventEmitter.emit(Messages.KEY_EVENT_LEFT);
        } else if (evt.key === "ArrowRight") {
            eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
        } else if (evt.keyCode === 32) {
            eventEmitter.emit(Messages.KEY_EVENT_SPACE);
        } else if (evt.key === "Enter") {
            eventEmitter.emit(Messages.KEY_EVENT_ENTER);
        } else if (evt.key === "c") {
            if (longLaserImg && hero) {
                hero.fireLongLaser(); // 긴 레이저 발사
            } else {
                console.error("Cannot fire long laser. Image or hero is not ready.");
            }
        }
    });
    
    window.addEventListener("keyup", (evt) => {
        delete keysPressed[evt.key]; // 키 눌림 상태 해제
    
        if (evt.key === "c") {
            if (hero) {
                hero.stopLongLaser(); // 긴 레이저 제거
            }
        }
    });
    
    


function loadTexture(path) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            console.log(`Image loaded: ${path}`);
            resolve(img);
        };
        img.onerror = (err) => {
            console.error(`Failed to load image at ${path}`, err);
            reject(err); // 로드 실패 시 에러 반환
        };
    });
}


function intersectRect(r1, r2) {
    return !(
        r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top
    );
}

function updateGameObjects() {
    const enemies = gameObjects.filter((go) => go.type === "Enemy");
    const lasers = gameObjects.filter((go) => go.type === "Laser");
    const longLaser = gameObjects.filter((go) => go.type === "LongLaser");
    const heroSubs = gameObjects.filter((go) => go.type === "HeroSub");

    heroSubs.forEach((sub) => sub.fire());

    lasers.forEach((l) => {
        enemies.forEach((m) => {
            if (intersectRect(l.rectFromGameObject(), m.rectFromGameObject())) {
                // 충돌 발생
                eventEmitter.emit(Messages.COLLISION_ENEMY_LASER, {
                    first: l,
                    second: m,
                });

                // 폭발 생성
                const explosion = new Explosion(m.x, m.y, explosionImg);
                gameObjects.push(explosion);

                l.dead = true;
                m.dead = true;
            }
        });
    });

    longLaser.forEach((laser) => {
        enemies.forEach((enemy) => {
            if (intersectRect(laser.rectFromGameObject(), enemy.rectFromGameObject())) {
                enemy.dead = true; // 적 비행기 파괴
                hero.incrementPoints(); // 점수 추가
                const explosion = new Explosion(enemy.x, enemy.y, explosionImg); // 폭발 생성
                gameObjects.push(explosion);
            }
        });
    });
    

    enemies.forEach((enemy) => {
        const heroRect = hero.rectFromGameObject();
        if (intersectRect(heroRect, enemy.rectFromGameObject())) {
            eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy });
        }
    });

    gameObjects = gameObjects.filter((go) => !go.dead);

    if (isHeroDead()) {
        eventEmitter.emit(Messages.GAME_END_LOSS);
        return; // 패배 처리 후 승리 검사 방지
    }
    if (isEnemiesDead()) {
        eventEmitter.emit(Messages.GAME_END_WIN);
    }
}





function createEnemies() {
    const MONSTER_TOTAL = 5;
    const MONSTER_WIDTH = MONSTER_TOTAL * 98;
    const START_X = (canvas.width - MONSTER_WIDTH) / 2;
    const STOP_X = START_X + MONSTER_WIDTH;
    for (let x = START_X; x < STOP_X; x += 98) {
        for (let y = 0; y < 50 * 5; y += 50) {
            const enemy = new Enemy(x, y);
            enemy.img = enemyImg;
            gameObjects.push(enemy);
        }
    }
}

function createHero() {
    hero = new Hero(canvas.width / 2 - 45, canvas.height - canvas.height / 4);

    heroSub1 = new HeroSub(
        canvas.width / 2 + 75,
        canvas.height - canvas.height / 4 + 30
    );

    heroSub2 = new HeroSub(
        canvas.width / 2 - 100,
        canvas.height - canvas.height / 4 + 30
    );

    hero.img = heroImg;
    heroSub1.img = heroImg;
    heroSub2.img = heroImg;

    gameObjects.push(hero, heroSub1, heroSub2);
}

function drawGameObjects(ctx) {
    gameObjects.forEach((go) => go.draw(ctx));
}

window.onload = async () => {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    heroImg = await loadTexture("assets/player.png");
    enemyImg = await loadTexture("assets/enemyShip.png");
    laserImg = await loadTexture("assets/laserRed.png");
    longLaserImg = await loadTexture("assets/laserGreen.png");
    explosionImg = await loadTexture("assets/laserGreenShot.png"); // 폭발 이미지 로드
    lifeImg = await loadTexture("assets/life.png");
    
    console.log("LongLaserImg loaded:", longLaserImg);

    createEnemies(ctx, canvas, enemyImg);

    function initGame() {
        gameObjects = [];
        createEnemies();
        createHero();
    
        // 이동 이벤트
        eventEmitter.on(Messages.KEY_EVENT_UP, () => {
            hero.y -= 5;
            heroSub1.y -= 5;
            heroSub2.y -= 5;
        });
        eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
            hero.y += 5;
            heroSub1.y += 5;
            heroSub2.y += 5;
        });
        eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
            hero.x -= 5;
            heroSub1.x -= 5;
            heroSub2.x -= 5;
        });
        eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
            hero.x += 5;
            heroSub1.x += 5;
            heroSub2.x += 5;
        });
        eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
            if (hero.canFire()) {
                hero.fire();
            }
        });
    
        // 충돌 이벤트
        eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
            first.dead = true;
            second.dead = true;
            hero.incrementPoints();
            if (isEnemiesDead()) {
                eventEmitter.emit(Messages.GAME_END_WIN);
            }
        });
    
        eventEmitter.on(Messages.COLLISION_ENEMY_HERO, (_, { enemy }) => {
            enemy.dead = true;
            hero.decrementLife();
            
        });
    
        // 게임 종료 이벤트
        eventEmitter.on(Messages.GAME_END_WIN, () => {
            endGame(true);
        });
        eventEmitter.on(Messages.GAME_END_LOSS, () => {
            endGame(false);
        });
        
        eventEmitter.on(Messages.KEY_EVENT_ENTER, () => {
            resetGame();
        });
    }
    

    initGame();
    let gameLoopId = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        updateGameObjects();
        drawPoints();
        drawLife();
        drawGameObjects(ctx);
    }, 100);

    function endGame(win) {
        clearInterval(gameLoopId);
    
        // 게임 화면이 겹칠 수 있으니, 200ms 지연
        setTimeout(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            if (win) {
                displayMessage(
                    "Victory!!! Pew Pew... - Press [Enter] to start a new game Captain Pew Pew",
                    "green"
                );
            } else {
                displayMessage(
                    "You died !!! Press [Enter] to start a new game Captain Pew Pew"
                );
            }
        }, 200)
    }
    
    function resetGame() {
        if (gameLoopId) {
            clearInterval(gameLoopId); // 게임 루프 중지, 중복 실행 방지
            eventEmitter.clear(); // 모든 이벤트 리스너 제거, 이전 게임 세션 충돌 방지
            initGame(); // 게임 초기 상태 실행
            gameLoopId = setInterval(() => { // 100ms 간격으로 새로운 게임 루프 시작
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "black";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                drawPoints();
                drawLife();
                updateGameObjects();
                drawGameObjects(ctx);
            }, 100);
        }
    }


};

function drawLife() {
    const START_POS = canvas.width - 180;
    for(let i=0; i < hero.life; i++ ) {
        ctx.drawImage(
            lifeImg,
            START_POS + (45 * (i+1) ),
            canvas.height - 37);
    }
}
function drawPoints() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "left";
    drawText("Points: " + hero.points, 10, canvas.height-20);
}
function drawText(message, x, y) {
    ctx.fillText(message, x, y);
}

function isHeroDead() {
    return hero.life <= 0;
}
function isEnemiesDead() {
    const enemies = gameObjects.filter((go) => go.type === "Enemy" &&
!go.dead);
    return enemies.length === 0;
}

function displayMessage(message, color = "red") {
    ctx.font = "30px Arial";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

