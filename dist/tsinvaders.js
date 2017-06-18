/// <reference path="../node_modules/phaser/typescript/phaser.d.ts" />
var state;
var world;
var game = new Phaser.Game(1600, 1024, Phaser.AUTO, "tsinvaders", { preload: preload, create: create, update: update, render: null });
function preload() {
    var assetsPath = "assets/base/png/";
    var images = [
        { name: "playerBullet", file: "playerBullet.png" },
        { name: "enemyBullet", file: "enemyBullet.png" },
        { name: "player", file: "player.png" },
        { name: "background", file: "background.png" }
    ];
    images.forEach(function (i) { return game.load.image(i.name, assetsPath + i.file); });
    var sprites = [
        { name: "enemy", file: "enemy.png", w: 200, h: 200, f: 6 },
        { name: "explosion", file: "explosion.png", w: 200, h: 200, f: 6 },
        { name: "playerExplosion", file: "playerExplosion.png", w: 96, h: 96, f: 12 }
    ];
    sprites.forEach(function (s) { return game.load.spritesheet(s.name, assetsPath + s.file, s.w, s.h, s.f); });
}
function create() {
    world = new World();
    state = new State();
}
function update() {
    state.update();
    world.update();
}
var Player = (function () {
    function Player(shipImage, bulletImage) {
        var _this = this;
        this.cooldown = 0;
        this.PLAYER_SPEED = 300;
        this.BULLET_SPEED = -600;
        this.FIRE_COOLDOWN = 10;
        // create the player ship
        this.ship = game.add.sprite(game.stage.width / 2, game.stage.height - 100, shipImage),
            game.physics.enable(this.ship, Phaser.Physics.ARCADE);
        this.ship.scale.setTo(0.25);
        // create the player lives group
        this.lives = game.add.group();
        // create the bullet group for the players
        this.bullets = game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        // create the bullets pool
        this.bullets.createMultiple(30, bulletImage);
        [
            { name: "width", value: 20 },
            { name: "height", value: 40 },
            { name: "anchor.x", value: -0.75 },
            { name: "anchor.y", value: 1 },
            { name: "outOfBoundsKill", value: true },
            { name: "checkWorldBounds", value: true }
        ].forEach(function (s) { return _this.bullets.setAll(s.name, s.value); });
        // create the explosions pool
        this.explosions = game.add.group();
        this.explosions.createMultiple(30, 'playerExplosion');
        [
            { name: "width", value: this.ship.width * 2 },
            { name: "height", value: this.ship.height * 2 }
        ].forEach(function (s) { return _this.explosions.setAll(s.name, s.value); });
    }
    Player.prototype.update = function () {
        // reduce the fire cooldown
        if (this.cooldown > 0) {
            this.cooldown--;
        }
        // reset the velocity to stop the ship
        this.ship.body.velocity.setTo(0, 0);
    };
    Player.prototype.move = function (x, y, speed) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (speed === void 0) { speed = this.PLAYER_SPEED; }
        // move the ship
        this.ship.body.velocity.setTo(x * speed, y * speed);
    };
    Player.prototype.fire = function (speed) {
        if (speed === void 0) { speed = this.BULLET_SPEED; }
        // check cooldown
        if (!this.cooldown) {
            // get a bullet from the bullets pool
            var bullet = this.bullets.getFirstExists(false);
            // ff a bullet is available
            if (bullet) {
                // bullet starting position above the player ship
                bullet.reset(world.player.ship.x, world.player.ship.y + 8);
                // bullet fired!
                bullet.body.velocity.y = this.BULLET_SPEED;
                // set up the cooldown
                this.cooldown = this.FIRE_COOLDOWN;
            }
        }
    };
    Player.prototype.die = function () {
        var live = this.lives.getFirstAlive();
        if (live) {
            live.kill();
        }
        this.explote();
        this.ship.kill;
    };
    Player.prototype.explote = function () {
        var explosion = this.explosions.getFirstExists(false);
        if (explosion) {
            explosion.reset(this.ship.body.x - this.ship.body.width / 2, this.ship.body.y - this.ship.body.height / 2);
            explosion.animations.add('explode');
            explosion.play('explode', 5, false, true);
        }
    };
    Object.defineProperty(Player.prototype, "outOfLives", {
        get: function () {
            return (this.lives.countLiving() > 1);
        },
        enumerable: true,
        configurable: true
    });
    Player.prototype.hit = function () {
        this.die();
    };
    return Player;
}());
var Enemies = (function () {
    function Enemies(shipImage, bulletImage) {
        if (shipImage === void 0) { shipImage = "enemy"; }
        if (bulletImage === void 0) { bulletImage = "enemyBullet"; }
        var _this = this;
        this.cooldown = 0;
        this.BULLET_SPEED = 100;
        this.FIRE_COOLDOWN = 10;
        // create the ships group for the enemies
        this.ships = game.add.group();
        this.ships.enableBody = true;
        this.ships.physicsBodyType = Phaser.Physics.ARCADE;
        // create the enemy fleet
        this.createEnemyFleet();
        // create the bullet group for the enemies
        this.bullets = game.add.group();
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.bullets.enableBody = true;
        // create the bullets pool
        this.bullets.createMultiple(30, bulletImage);
        var settings = [
            { name: "width", value: 20 },
            { name: "height", value: 20 },
            { name: "anchor.x", value: 0.5 },
            { name: "anchor.y", value: 1 },
            { name: "outOfBoundsKill", value: true },
            { name: "checkWorldBounds", value: true },
        ];
        settings.forEach(function (s) { return _this.bullets.setAll(s.name, s.value); });
        // create the explosions pool
        this.explosions = game.add.group();
        this.explosions.createMultiple(30, 'playerExplosion');
    }
    Enemies.prototype.createEnemyFleet = function (image, rows, columns, difficulty) {
        var _this = this;
        if (image === void 0) { image = "enemy"; }
        if (rows === void 0) { rows = 4; }
        if (columns === void 0) { columns = 7; }
        if (difficulty === void 0) { difficulty = 1; }
        // set the enemy Ship box Size
        var box = {
            width: 56,
            height: 56,
            spacing: 8,
        };
        // populate the ememy fleet
        for (var y = 0; y < rows; y++) {
            var xshift = (y % 2) ? 20 : 0;
            for (var x = 0; x < columns; x++) {
                this.setupEnemyShip(xshift + x * (box.width + box.spacing), y * (box.height + box.spacing), box.width, box.height, image);
            }
        }
        // group staring position
        this.ships.x = 100;
        this.ships.y = 50;
        // move the group edge to edge and loop
        var tween = game.add.tween(this.ships).to({ x: game.width - box.width * columns }, 6000 / (difficulty ? difficulty : 1), Phaser.Easing.Linear.None, true, 0, 1000, true);
        // descend on loop
        tween.onRepeat.add(function () { return _this.ships.y += game.height / 10; }, this);
    };
    Enemies.prototype.setupEnemyShip = function (x, y, width, height, image) {
        // create the enemy ship
        var ship = this.ships.create(x, y, image);
        ship.width = width;
        ship.height = height;
        ship.anchor.setTo(0.5, 0.5);
        // animate the ships
        ship.animations.add("animate", null, 6, true);
        ship.play("animate");
        ship.body.moves = false;
    };
    Enemies.prototype.update = function () {
        // this.bullets.forEach((b: Phaser.Sprite) => b.angle++);
        // reduce the fire cooldown
        if (this.cooldown > 0) {
            this.cooldown--;
        }
        if ((game.rnd.integerInRange(1, 1000) / state.level) < 10) {
            this.fire(world.player.ship);
        }
    };
    Enemies.prototype.fire = function (target, speed) {
        if (speed === void 0) { speed = this.BULLET_SPEED; }
        // check cooldown
        if (!this.cooldown) {
            // get a bullet from the bullets pool
            var bullet = this.bullets.getFirstExists(false);
            // if a bullet is available and at least one enemy alive
            if (bullet && this.ships.getFirstAlive()) {
                // randomly select one of them
                var shooter = this.ships.getRandom();
                // bullet starting position below the shooter ship
                bullet.reset(shooter.body.x, shooter.body.y);
                // fire the bullet from this enemy to the player
                game.physics.arcade.moveToObject(bullet, target, this.BULLET_SPEED * state.level);
                // set up the cooldown
                this.cooldown = this.FIRE_COOLDOWN;
            }
        }
    };
    Enemies.prototype.explote = function (ship) {
        var explosion = this.explosions.getFirstExists(false);
        if (explosion) {
            explosion.reset(ship.body.x - ship.body.width / 2, ship.body.y - ship.body.height / 2);
            explosion.animations.add('explode');
            explosion.play('explode', 15, false, true);
        }
    };
    Enemies.prototype.hit = function (ship) {
        this.explote(ship);
        ship.kill();
    };
    return Enemies;
}());
var State = (function () {
    function State() {
        this.level = 10;
        this.setupInput();
    }
    State.prototype.setupInput = function () {
        // set keyboard arrows as input
        this.cursors = game.input.keyboard.createCursorKeys();
        // set spacebar as fire key
        this.fireKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    };
    State.prototype.update = function () {
        // update the player
        world.player.update();
        // update the enemies
        world.enemies.update();
        // move the player if right or left arrows are pressed
        world.player.move((this.cursors.right.isDown ? 1 : 0) - (this.cursors.left.isDown ? 1 : 0), 0);
        // fire if up arrow or the fire key are pressed
        if (this.cursors.up.isDown || this.fireKey.isDown) {
            world.player.fire();
        }
    };
    return State;
}());
var World = (function () {
    function World() {
        // initialize the game engine and elements
        game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
        game.physics.startSystem(Phaser.Physics.ARCADE);
        this.setuptBackground();
        this.setupPlayer();
        this.setupEnemies();
    }
    World.prototype.setuptBackground = function (image) {
        if (image === void 0) { image = "background"; }
        this.background = game.add.tileSprite(0, 0, game.stage.width, game.stage.height, image);
    };
    World.prototype.setupPlayer = function (shipImage, bulletImage) {
        if (shipImage === void 0) { shipImage = "player"; }
        if (bulletImage === void 0) { bulletImage = "playerBullet"; }
        this.player = new Player(shipImage, bulletImage);
    };
    World.prototype.setupEnemies = function (shipImage, bulletImage) {
        if (shipImage === void 0) { shipImage = "enemy"; }
        if (bulletImage === void 0) { bulletImage = "enemyBullet"; }
        this.enemies = new Enemies(shipImage, bulletImage);
    };
    World.prototype.update = function () {
        var _this = this;
        // scroll the background to simulate movement
        this.scrollBackground();
        // check colisions between enemy bullets and player
        game.physics.arcade.overlap(this.player.ship, this.enemies.bullets, function (player, bullet) {
            bullet.kill();
            _this.player.hit();
        });
        // check colisions between player bullets and enemies
        game.physics.arcade.overlap(this.enemies.ships, this.player.bullets, function (ship, bullet) {
            bullet.kill();
            _this.enemies.hit(ship);
        });
    };
    World.prototype.scrollBackground = function (x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 3; }
        this.background.tilePosition.x += x;
        this.background.tilePosition.y += y;
    };
    return World;
}());
//# sourceMappingURL=tsinvaders.js.map