import "p2";
import "pixi";

import "phaser";

let state: State;
let world: World;

let game: Phaser.Game = new Phaser.Game(
  1600, 1024, Phaser.AUTO, "tsinvaders",
  { preload: preload, create: create, update: update, render: null },
);

function preload(): void  {

  const assetsPath: String = "assets/base/png/";

  let images: any = [
    { name: "playerBullet", file: "playerBullet.png" },
    { name: "enemyBullet", file: "enemyBullet.png" },
    { name: "player", file: "player.png" },
    { name: "background", file: "background.png" },
  ]; images.forEach((i) => game.load.image(i.name, assetsPath + i.file));

  let sprites: any = [
    { name: "enemy", file: "enemy.png", w: 200, h: 200, f: 6 },
    { name: "explosion", file: "explosion.png", w: 200, h: 200, f: 6 },
    { name: "playerExplosion", file: "playerExplosion.png", w: 96, h: 96, f: 12 },
  ]; sprites.forEach((s) => game.load.spritesheet(s.name, assetsPath + s.file, s.w, s.h, s.f));

}

function create(): void {

  world = new World();
  state = new State();

}

function update(): void {

  state.update();
  world.update();

}

class Player {

  public ship: Phaser.Sprite;
  public bullets: Phaser.Group;
  public lives: Phaser.Group;

  private explosions: Phaser.Group;

  private cooldown: number = 0;

  private PLAYER_SPEED: number = 300;
  private BULLET_SPEED: number = -600;
  private FIRE_COOLDOWN: number = 10;

  constructor(shipImage: string, bulletImage: string) {

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
      { name: "checkWorldBounds", value: true },
    ].forEach((s) => this.bullets.setAll(s.name, s.value));

    // create the explosions pool
    this.explosions = game.add.group();
    this.explosions.createMultiple(30, "playerExplosion");
    [
      { name: "width", value: this.ship.width * 2 },
      { name: "height", value: this.ship.height * 2 },
    ].forEach((s) => this.explosions.setAll(s.name, s.value));

  }

  public update(): void  {

    // reduce the fire cooldown
    if (this.cooldown > 0) {
      this.cooldown--;
    }

    // reset the velocity to stop the ship
    this.ship.body.velocity.setTo(0, 0);

  }

  public move(x: number = 0, y: number = 0, speed: number = this.PLAYER_SPEED): void  {

    // move the ship
    this.ship.body.velocity.setTo(x * speed, y * speed);

  }

  public fire(speed: number = this.BULLET_SPEED): void  {

    // check cooldown
    if (!this.cooldown) {

      // get a bullet from the bullets pool
      let bullet: Phaser.Sprite = this.bullets.getFirstExists(false);

      // ff a bullet is available
      if (bullet) {

        // bullet starting position above the player ship
        bullet.reset(world.player.ship.x, world.player.ship.y + 8);

        // bullet fired!
        bullet.body.velocity.y = speed;

        // set up the cooldown
        this.cooldown = this.FIRE_COOLDOWN;

      }

    }

  }

  private die(): void {

    this.explote();

  }

  private explote(): void {

    const explosion: Phaser.Sprite = this.explosions.getFirstExists(false);

    if (explosion) {

      explosion.reset(this.ship.body.x - this.ship.body.width / 2, this.ship.body.y - this.ship.body.height / 2);
      explosion.animations.add("explode");
      explosion.play("explode", 5, false, true);

    }

  }

  get outOfLives(): boolean {
    return (this.lives.countLiving() > 1);
  }


  public hit(ship: Phaser.Sprite): void {

    let live: Phaser.Sprite = this.lives.getFirstAlive();

    if (live) { live.kill(); }

    ship.kill();
    ship.revive();

    this.die();

  }

}

class Enemies {

  ships:    Phaser.Group;
  bullets:  Phaser.Group;
  private explosions: Phaser.Group;


  private cooldown: number = 0;

  private BULLET_SPEED: number = 100;
  private FIRE_COOLDOWN: number = 10;

  constructor(shipImage: string = "enemy", bulletImage: string = "enemyBullet") {

    // create the ships group for the enemies
    this.ships = game.add.group();
    this.ships.enableBody = true;
    this.ships.physicsBodyType = Phaser.Physics.ARCADE;

    // create the enemy fleet
    this.createEnemyFleet(shipImage, 2, 5);

    // create the bullet group for the enemies
    this.bullets = game.add.group();
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.bullets.enableBody = true;

    // create the bullets pool
    this.bullets.createMultiple(30, bulletImage);
    let settings: any = [
      { name: "width", value: 20 },
      { name: "height", value: 20 },
      { name: "anchor.x", value: 0.5 },
      { name: "anchor.y", value: 1 },
      { name: "outOfBoundsKill", value: true },
      { name: "checkWorldBounds", value: true },
    ]; settings.forEach((s) => this.bullets.setAll(s.name, s.value));

    // create the explosions pool
    this.explosions = game.add.group();
    this.explosions.createMultiple(30, "playerExplosion");

  }

  public createEnemyFleet(image: string = "enemy", rows: number = 3, columns: number = 6, difficulty: number = 1): void  {

    // set the enemy Ship box Size
    const box: any = {
      width: 56,
      height: 56,
      spacing: 8,
    };

    // populate the ememy fleet
    for (let y: number = 0; y < rows; y++) {
      const xshift: number = (y % 2) ? 20 : 0;
      for (let x: number = 0; x < columns; x++) {
        this.setupEnemyShip(
          xshift + x * (box.width + box.spacing),
          y * (box.height + box.spacing),
          box.width,
          box.height,
          image,
        );
      }
    }

    // group staring position
    this.ships.x = 100;
    this.ships.y = 50;

    const duration: number = 6000 - 125 * difficulty;

    // move the group edge to edge and loop
    let tween: Phaser.Tween = game.add.tween(this.ships).to(
      { x: game.width - box.width * columns },
      duration,
      Phaser.Easing.Linear.None, true, 0, duration / 6, true,
    );

    // descend on loop
    tween.onRepeat.add(() => this.ships.y += game.height / 10, this);

  }

  private setupEnemyShip(x: number, y: number, width: number, height: number, image: string): void  {

    // create the enemy ship
    let ship: Phaser.Sprite = this.ships.create(x, y, image);
    ship.width = width;
    ship.height = height;
    ship.anchor.setTo(0.5, 0.5);

    // animate the ships
    ship.animations.add("animate", undefined, 6, true);
    ship.play("animate");
    ship.body.moves = false;

    // add them health
    ship.health = 100;

  }

  public update(): void {

    // add rotation to the bullets
    this.bullets.forEach((b: Phaser.Sprite) => b.angle++, this);
    
    // reduce the fire cooldown
    if (this.cooldown > 0) {
      this.cooldown--;
    }

    if ( (game.rnd.integerInRange(1, 1000) / state.level) < 10 ) {
      this.fire(world.player.ship);
    }

    if (!this.ships.getFirstAlive()) {
      this.ships.reviveAll();
      state.levelUp();
      this.createEnemyFleet( undefined, 5, 5, state.level);
    }

  }

  public fire(target: Phaser.Sprite, speed: number = this.BULLET_SPEED): void {

    // check cooldown
    if (!this.cooldown) {

      // get a bullet from the bullets pool
      let bullet: Phaser.Sprite = this.bullets.getFirstExists(false);

      // if a bullet is available and at least one enemy alive
      if (bullet && this.ships.getFirstAlive()) {

        // randomly select one of them
        let shooter: Phaser.Sprite = this.ships.getRandom();
        
        if (shooter.alive) {
          // bullet starting position below the shooter ship
          bullet.reset(shooter.body.x, shooter.body.y);

          // fire the bullet from this enemy to the player
          game.physics.arcade.moveToObject(
            bullet, target,
            speed + 50 * state.level,
          );

          // set up the cooldown
          this.cooldown = this.FIRE_COOLDOWN;
        }

      }
    }
  }

  private explote(ship: Phaser.Sprite): void {

    const explosion: Phaser.Sprite = this.explosions.getFirstExists(false);

    if (explosion) {

      explosion.reset(ship.body.x - ship.body.width / 2, ship.body.y - ship.body.height / 2);
      explosion.animations.add("explode");
      explosion.play("explode", 15, false, true);

    }

  }

  public hit(ship: Phaser.Sprite): void {

    this.explote(ship);
    ship.kill();

  }

}

class State {

  public score = 0;
  public level = 1;

  private timer: Phaser.Timer;
  private timeUp: Phaser.TimerEvent;

  private scoreOSD: Phaser.Text;
  private timerOSD: Phaser.Text;

  private cursors: Phaser.CursorKeys;
  private fireKey: Phaser.Key;

  public scoreUp = (points: number) => this.score += points;
  public levelUp = () => this.level++;

  constructor() {

    this.setupInput();
    this.setupOSD();

  }

  private setupInput(): void {

    // set keyboard arrows as input
    this.cursors = game.input.keyboard.createCursorKeys();

    // set spacebar as fire key
    this.fireKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  }

  private setupOSD(): void {

    this.scoreOSD = game.add.text(100, 100, "Score: " + this.score, { font: "34px Arial", fill: "#fff" });
    // this.OSD.lives = game.add.text(100, 200, "Lives: " + world.player.lives);
    // this.OSD.level = game.add.text(100, 300, "Level: " + this.level);

    // create a timer
    this.timer = game.time.create();

    // Create a delayed event 2m from now
    this.timeUp = this.timer.add(Phaser.Timer.MINUTE * 2, () => this.timer.stop(), this);
    this.timerOSD = game.add.text(game.width - 100, 100, this.clock(this.timeUp), { font: "34px Arial", fill: "#fff" });

    // Start the tim
    this.timer.start();

  }

  public update(): void {

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

    this.scoreOSD.setText(this.score.toString());
    this.timerOSD.setText(this.clock(this.timeUp));

  }

  private clock (timeEvent: Phaser.TimerEvent): string {
        // Convert seconds (s) to a nicely formatted and padded time string
        const secondsLeft: number = Math.round((timeEvent.delay - this.timer.ms) / 1000);
        const minutes: string = "0" + Math.floor(secondsLeft / 60);
        const seconds: string = "0" + Math.floor(secondsLeft % 60);
        return minutes.substr(-2) + ":" + seconds.substr(-2);
    }

}

class World {

  public background: Phaser.TileSprite;
  public player: Player;
  public enemies: Enemies;

  constructor() {

    // initialize the game engine and elements
    game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
    game.physics.startSystem(Phaser.Physics.ARCADE);

    this.setuptBackground();
    this.setupPlayer();
    this.setupEnemies();

  }

  private setuptBackground(image: string = "background"): void {

    this.background = game.add.tileSprite(0, 0, game.stage.width, game.stage.height, image);

  }

  private setupPlayer(shipImage: string = "player", bulletImage: string = "playerBullet"): void  {

    this.player = new Player(shipImage, bulletImage);

  }

  private setupEnemies(shipImage: string = "enemy", bulletImage: string = "enemyBullet"): void  {

    this.enemies = new Enemies(shipImage, bulletImage);

  }

  public update(): void  {

    // scroll the background to simulate movement
    this.scrollBackground();

    // check collisions between enemy bullets and player
    game.physics.arcade.overlap(
      this.player.ship,
      this.enemies.bullets,
      (ship: Phaser.Sprite, bullet: Phaser.Sprite) => {
        bullet.kill();
        this.player.hit(ship);
      },
    );

    // check collisions between player bullets and enemies
    game.physics.arcade.overlap(
      this.enemies.ships,
      this.player.bullets,
      (ship: Phaser.Sprite, bullet: Phaser.Sprite) => {
        bullet.kill();
        state.scoreUp(ship.health);
        this.enemies.hit(ship);
      },
    );

    // check collisions between player and enemies
    game.physics.arcade.overlap(
      this.player.ship,
      this.enemies.ships,
      (player_ship: Phaser.Sprite, enemy_ship: Phaser.Sprite) => {
        this.enemies.hit(enemy_ship);
        this.player.hit(player_ship);
      },
    );


  }

  public scrollBackground(x: number = 0, y: number = 3): void  {

    this.background.tilePosition.x += x;
    this.background.tilePosition.y += y;

  }

}
