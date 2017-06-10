/// <reference path="lib/phaser.d.ts" />

var state: State;
var world: World;

var game = new Phaser.Game(
  1600, 1024, Phaser.AUTO, 'tsinvaders',
  { preload: preload, create: create, update: update, render: render }
);

function preload() {

  var assetsPath: String = "assets/base/png/";

  var images = [
    { name: 'playerBullet', file: 'playerBullet.png' },
    { name: 'enemyBullet', file: 'enemyBullet.png' },
    { name: 'player', file: 'player.png' },
    { name: 'background', file: 'background.png' }
  ]; images.forEach(i => game.load.image(i.name, assetsPath + i.file));

  var sprites = [
    { name: 'enemy', file: 'enemy.png', w: 200, h: 200 },
  ]; sprites.forEach(s => game.load.spritesheet(s.name, assetsPath + s.file, s.w, s.h));

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

class Player {

  public ship:     Phaser.Sprite;
  public bullets:  Phaser.Group;
  public lives?: Phaser.Group;

  private cooldown: number = 0;

  private PLAYER_SPEED: number = 300;
  private BULLET_SPEED: number = -600;
  private FIRE_COOLDOWN: number = 10;

  constructor(shipImage: string, bulletImage: string) {

    // Create the player ship
    this.ship = game.add.sprite(game.stage.width / 2, game.stage.height - 100, shipImage),
    game.physics.enable(this.ship, Phaser.Physics.ARCADE);
    this.ship.width = 50;
    this.ship.height = 75;

    // Create the bullet group for the player
    this.bullets = game.add.group()
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
    ]; settings.forEach(s => this.bullets.setAll(s.name, s.value));

  }

  public update() {

    // Reduce the fire cooldown
    if (this.cooldown > 0) this.cooldown--;

    // Reset the velocity to stop the ship
    this.ship.body.velocity.setTo(0, 0);

  }

  public move(x: number = 0, y: number = 0, speed: number = this.PLAYER_SPEED) {

    // Move the ship
    this.ship.body.velocity.setTo(x * speed, y * speed);

  }

  public fire(speed: number = this.BULLET_SPEED) {

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
  }

}

class Enemies {

  ships:    Phaser.Group;
  bullets:  Phaser.Group;

  private cooldown: number = 0;
  
  private BULLET_SPEED: number = 100;
  private FIRE_COOLDOWN: number = 10;

  constructor(shipImage: string = 'enemy', bulletImage: string = 'enemyBullet') {

    // Create the ships group for the enemies
    this.ships = game.add.group()
    this.ships.enableBody = true;
    this.ships.physicsBodyType = Phaser.Physics.ARCADE;

    // Create the enemy fleet
    this.createEnemyFleet();

    // Create the bullet group for the enemies
    this.bullets = game.add.group()
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
    ]; settings.forEach(s => this.bullets.setAll(s.name, s.value));

  }

  public createEnemyFleet(image: string = 'enemy', rows: number = 4, columns: number = 7, difficulty: number = 1) {

    // Set the enemy Ship box Size
    let box = {
      width: 56,
      height: 56,
      spacing: 8,
    }

    // Populate the ememy fleet
    for (var y = 0; y < rows; y++) {
      const xshift = (y % 2) ? 20 : 0;
      for (var x = 0; x < columns; x++) {
        this.setupEnemyShip(
          xshift + x * (box.width + box.spacing),
          y * (box.height + box.spacing),
          box.width,
          box.height,
          image
        );
      }
    }

    // Group staring position
    this.ships.x = 100;
    this.ships.y = 50;

    // Move the group edge to edge and loop
    var tween = game.add.tween(this.ships).to(
      { x: game.width - box.width * columns },
      6000 / (difficulty ? difficulty : 1),
      Phaser.Easing.Linear.None, true, 0, 1000, true
    );

    // Descend on loop
    tween.onRepeat.add(() => this.ships.y += game.height / 10, this);

  }

  private setupEnemyShip(x: number, y: number, width: number, height: number, image: string) {

    // Create the enemy ship
    var ship: Phaser.Sprite = this.ships.create(x, y, image);
    ship.width = width;
    ship.height = height;
    ship.anchor.setTo(0.5, 0.5);

    // Animate the ships
    ship.animations.add('animate', null, 10, true);
    ship.play('animate');
    ship.body.moves = false;

  }

  public update() {

    this.bullets.forEach((b : Phaser.Sprite) => b.angle++);

    // Reduce the fire cooldown
    if (this.cooldown > 0) this.cooldown--;

    if ( (game.rnd.integerInRange(1, 1000) / state.level) < 10 ) {
      this.fire();
    }

  }

  public fire(speed: number = this.BULLET_SPEED) {

    // Check cooldown
    if (!this.cooldown) {
      
      // Get a bullet from the bullets pool
      var bullet = this.bullets.getFirstExists(false);
  
      // If a bullet is available and at least one enemy alive
      if (bullet && this.ships.getFirstAlive()) {
   
        // Randomly select one of them
        var shooter: Phaser.Sprite = this.ships.getRandom();

        // Bullet starting position below the shooter ship
        bullet.reset(shooter.body.x, shooter.body.y);

        // And fire the bullet from this enemy to the player
        game.physics.arcade.moveToObject(
          bullet, world.player.ship,
          this.BULLET_SPEED * state.level
        );

        // Set up the cooldown
        this.cooldown = this.FIRE_COOLDOWN;

      }
    }
  }

}

class State {

  public level = 1;

  private cursors: Phaser.CursorKeys;
  private fireKey: Phaser.Key;

  constructor() {

    this.setupInput();

  }

  private setupInput() {

    // Set keyboard arrows as input
    this.cursors = game.input.keyboard.createCursorKeys();

    // Set spacebar as fire key
    this.fireKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  }

  public update() {

    // Update the player
    world.player.update();

    // Update the enemies
    world.enemies.update();

    // Move the player if right or left arrows are pressed
    if (this.cursors.right.isDown || this.cursors.left.isDown) {
      world.player.move(~~this.cursors.right.isDown - ~~this.cursors.left.isDown, 0);
    }

    // Fire if up arrow or the fire key are pressed
    if (this.cursors.up.isDown || this.fireKey.isDown) {
      world.player.fire();
    };

  }

}

class World {

  public background: Phaser.TileSprite;
  public player: Player;
  public enemies: Enemies;

  constructor() {

    // Initialize the game engine and elements
    game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
    game.physics.startSystem(Phaser.Physics.ARCADE);

    this.setuptBackground();
    this.setupPlayer();
    this.setupEnemies();

  }

  private setuptBackground(image: string = 'background') {

    this.background = game.add.tileSprite(0, 0, game.stage.width, game.stage.height, image);

  }

  private setupPlayer(shipImage: string = 'player', bulletImage: string = 'playerBullet') {

    this.player = new Player(shipImage, bulletImage);

  }

  private setupEnemies(shipImage: string = 'enemy', bulletImage: string = 'enemyBullet') {

    this.enemies = new Enemies(shipImage, bulletImage);

  }

  public update() {

    // Scroll the background to simulate movement
    this.scrollBackground();

  }

  public scrollBackground(x: number = 0, y: number = 3) {

    if (x) this.background.tilePosition.x += x;
    if (y) this.background.tilePosition.y += y;

  }

}
