/// <reference path="lib/phaser.d.ts" />
var state;
var world;
var game = new Phaser.Game(1600, 1024, Phaser.AUTO, 'tsinvaders', { preload: preload, create: create, update: update, render: render });
function preload() {
    var assetsPath = "assets/base/png/";
    var images = [
        { name: 'playerBullet', file: 'playerBullet.png' },
        { name: 'enemyBullet', file: 'enemyBullet.png' },
        { name: 'player', file: 'player.png' },
        { name: 'background', file: 'background.png' }
    ];
    images.forEach(function (i) { return game.load.image(i.name, assetsPath + i.file); });
    var sprites = [
        { name: 'enemy', file: 'enemy.png', w: 200, h: 200 },
    ];
    sprites.forEach(function (s) { return game.load.spritesheet(s.name, assetsPath + s.file, s.w, s.h); });
}
function create() {
    world = new World();
    state = new State();
}
function update() {
    state.update();
    world.update();
}
function render() {
}
var Player = (function () {
    function Player(shipImage, bulletImage) {
        var _this = this;
        this.cooldown = 0;
        this.PLAYER_SPEED = 300;
        this.BULLET_SPEED = -600;
        this.FIRE_COOLDOWN = 10;
        // Create the player ship
        this.ship = game.add.sprite(game.stage.width / 2, game.stage.height - 100, shipImage),
            game.physics.enable(this.ship, Phaser.Physics.ARCADE);
        this.ship.width = 50;
        this.ship.height = 75;
        // Create the bullet group for the player
        this.bullets = game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        // Create the bullets pool
        this.bullets.createMultiple(30, bulletImage);
        var settings = [
            { name: 'width', value: 20 },
            { name: 'height', value: 40 },
            { name: 'anchor.x', value: -0.75 },
            { name: 'anchor.y', value: 1 },
            { name: 'outOfBoundsKill', value: true },
            { name: 'checkWorldBounds', value: true },
        ];
        settings.forEach(function (s) { return _this.bullets.setAll(s.name, s.value); });
    }
    Player.prototype.update = function () {
        // Reduce the fire cooldown
        if (this.cooldown > 0)
            this.cooldown--;
        // Reset the velocity to stop the ship
        this.ship.body.velocity.setTo(0, 0);
    };
    Player.prototype.move = function (x, y, speed) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (speed === void 0) { speed = this.PLAYER_SPEED; }
        // Move the ship
        this.ship.body.velocity.setTo(x * speed, y * speed);
    };
    Player.prototype.fire = function (speed) {
        if (speed === void 0) { speed = this.BULLET_SPEED; }
        // Check cooldown
        if (!this.cooldown) {
            // Get a bullet from the bullets pool
            var bullet = this.bullets.getFirstExists(false);
            // If a bullet is available
            if (bullet) {
                // Bullet starting position above the player ship
                bullet.reset(world.player.ship.x, world.player.ship.y + 8);
                // Bullet fired!
                bullet.body.velocity.y = this.BULLET_SPEED;
                // Set up the cooldown
                this.cooldown = this.FIRE_COOLDOWN;
            }
        }
    };
    return Player;
}());
var Enemies = (function () {
    function Enemies(shipImage, bulletImage) {
        if (shipImage === void 0) { shipImage = 'enemy'; }
        if (bulletImage === void 0) { bulletImage = 'enemyBullet'; }
        var _this = this;
        // Create the ships group for the enemies
        this.ships = game.add.group();
        this.ships.enableBody = true;
        this.ships.physicsBodyType = Phaser.Physics.ARCADE;
        // Create the enemy fleet
        this.createEnemyFleet();
        // Create the bullet group for the enemies
        this.bullets = game.add.group();
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.bullets.enableBody = true;
        // Create the bullets pool
        this.bullets.createMultiple(30, bulletImage);
        var settings = [
            { name: 'width', value: 20 },
            { name: 'height', value: 20 },
            { name: 'anchor.x', value: 0.5 },
            { name: 'anchor.y', value: 1 },
            { name: 'outOfBoundsKill', value: true },
            { name: 'checkWorldBounds', value: true },
        ];
        settings.forEach(function (s) { return _this.bullets.setAll(s.name, s.value); });
    }
    Enemies.prototype.createEnemyFleet = function (image, rows, columns, difficulty) {
        var _this = this;
        if (image === void 0) { image = 'enemy'; }
        if (rows === void 0) { rows = 4; }
        if (columns === void 0) { columns = 7; }
        if (difficulty === void 0) { difficulty = 1; }
        // Set the enemy Ship box Size
        var box = {
            width: 56,
            height: 56,
            spacing: 8,
        };
        // Populate the ememy fleet
        for (var y = 0; y < rows; y++) {
            var xshift = (y % 2) ? 20 : 0;
            for (var x = 0; x < columns; x++) {
                this.setupEnemyShip(xshift + x * (box.width + box.spacing), y * (box.height + box.spacing), box.width, box.height, image);
            }
        }
        // Group staring position
        this.ships.x = 100;
        this.ships.y = 50;
        // Move the group edge to edge and loop
        var tween = game.add.tween(this.ships).to({ x: game.width - box.width * columns }, 6000 / (difficulty ? difficulty : 1), Phaser.Easing.Linear.None, true, 0, 1000, true);
        // Descend on loop
        tween.onRepeat.add(function () { return _this.ships.y += game.height / 10; }, this);
    };
    Enemies.prototype.setupEnemyShip = function (x, y, width, height, image) {
        // Create the enemy ship
        var ship = this.ships.create(x, y, image);
        ship.width = width;
        ship.height = height;
        ship.anchor.setTo(0.5, 0.5);
        // Animate the ships
        ship.animations.add('animate', null, 10, true);
        ship.play('animate');
        ship.body.moves = false;
    };
    return Enemies;
}());
var State = (function () {
    function State() {
        this.setupInput();
    }
    State.prototype.setupInput = function () {
        // Set keyboard arrows as input
        this.cursors = game.input.keyboard.createCursorKeys();
        // Set spacebar as fire key
        this.fireKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    };
    State.prototype.update = function () {
        // Update the player
        world.player.update();
        // Move the player if right or left arrows are pressed
        if (this.cursors.right.isDown || this.cursors.left.isDown) {
            world.player.move(~~this.cursors.right.isDown - ~~this.cursors.left.isDown, 0);
        }
        // Fire if up arrow or the fire key are pressed
        if (this.cursors.up.isDown || this.fireKey.isDown) {
            world.player.fire();
        }
        ;
    };
    return State;
}());
var World = (function () {
    function World() {
        // Initialize the game engine and elements
        game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
        game.physics.startSystem(Phaser.Physics.ARCADE);
        this.setuptBackground();
        this.setupPlayer();
        this.setupEnemies();
    }
    World.prototype.setuptBackground = function (image) {
        if (image === void 0) { image = 'background'; }
        this.background = game.add.tileSprite(0, 0, game.stage.width, game.stage.height, image);
    };
    World.prototype.setupPlayer = function (shipImage, bulletImage) {
        if (shipImage === void 0) { shipImage = 'player'; }
        if (bulletImage === void 0) { bulletImage = 'playerBullet'; }
        this.player = new Player(shipImage, bulletImage);
    };
    World.prototype.setupEnemies = function (shipImage, bulletImage) {
        if (shipImage === void 0) { shipImage = 'enemy'; }
        if (bulletImage === void 0) { bulletImage = 'enemyBullet'; }
        this.enemies = new Enemies(shipImage, bulletImage);
    };
    World.prototype.update = function () {
        // Scroll the background to simulate movement
        this.scrollBackground();
    };
    World.prototype.scrollBackground = function (x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 3; }
        if (x)
            this.background.tilePosition.x += x;
        if (y)
            this.background.tilePosition.y += y;
    };
    return World;
}());
//# sourceMappingURL=tsinvaders.js.map