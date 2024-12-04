function loadTexture(path) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            resolve(img);
        };
    });
}

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

    canFire() {
        return this.cooldown === 0;
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
};

let heroImg,
    enemyImg,
    laserImg,
    explosionImg,
    canvas,
    ctx,
    gameObjects = [],
    hero,
    heroSub1,
    heroSub2,
    eventEmitter = new EventEmitter();

window.addEventListener("keyup", (evt) => {
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
    }
});

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

    gameObjects = gameObjects.filter((go) => !go.dead);
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
    explosionImg = await loadTexture("assets/laserGreenShot.png"); // 폭발 이미지 로드

    createEnemies(ctx, canvas, enemyImg);

    function initGame() {
        gameObjects = [];
        createEnemies();
        createHero();

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

        eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
            first.dead = true;
            second.dead = true;
        });
    }

    initGame();
    setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawGameObjects(ctx);
        updateGameObjects();
    }, 100);
};
