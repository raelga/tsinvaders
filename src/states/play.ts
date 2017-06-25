import "p2";
import "pixi";

import "phaser";

import Enemies from "../game/enemies";
import Player from "../game/player";
import Weapon from "../game/weapon";

export default class Play extends Phaser.State {

  public background: Phaser.TileSprite;
  public player: Player;
  public enemies: Enemies;

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

  public init(): void {
    this.score = 0;
  }

  public create(): void {

    this.setupBackground();
    this.setupPlayer();
    this.setupEnemies();
    this.setupInput();
    this.setupOSD();

  }

  private setupBackground(image: string = "background"): void {

    this.background = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, image);

  }

  private setupPlayer(shipImage: string = "player", bulletImage: string = "playerBullet"): void  {

    this.player = new Player(
      this.add.sprite(this.game.width / 2, this.game.height - 100, shipImage),
      this.add.group(),
      new Weapon(this.add.group(), bulletImage, -600, 10),
    );

    this.physics.enable(this.player.ship, Phaser.Physics.ARCADE);

  }

  private setupEnemies(shipImage: string = "enemy", bulletImage: string = "enemyBullet"): void  {

    this.enemies = new Enemies(this.game, shipImage, bulletImage);

  }

  public update(): void  {

    // scroll the background to simulate movement
    this.scrollBackground();

    // update the player
    this.player.update();

    // update the enemies
    this.enemies.update(this.player.ship, this.game);

    // move the player if right or left arrows are pressed
    this.player.move(
      (this.cursors.right.isDown && this.player.ship.x + this.player.ship.width < this.game.width ? 1 : 0) - (this.cursors.left.isDown && this.player.ship.x > 0 ? 1 : 0),
      0,
    );

    // fire if up arrow or the fire key are pressed
    if (this.cursors.up.isDown || this.fireKey.isDown) {
      this.player.fire();
    }

    // check collisions
    this.checkCollisions();

    this.scoreOSD.setText(this.score.toString());
    this.timerOSD.setText(this.clock(this.timeUp));

    // check lives
    if (this.player.outOfLives) {
      this.gameover();
    }
  }

  private checkCollisions(): void {

    // check collisions between enemy bullets and player
    this.physics.arcade.overlap(
      this.player.ship,
      this.enemies.bullets,
      (ship: Phaser.Sprite, bullet: Phaser.Sprite) => {
        bullet.kill();
        this.player.hit(ship);
      },
    );

    // check collisions between player bullets and enemies
    this.physics.arcade.overlap(
      this.enemies.ships,
      this.player.weapon.bullets,
      (ship: Phaser.Sprite, bullet: Phaser.Sprite) => {
        bullet.kill();
        this.scoreUp(ship.health);
        this.enemies.hit(ship);
      },
    );

    // check collisions between player and enemies
    this.game.physics.arcade.overlap(
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


  private setupInput(): void {

    // set keyboard arrows as input
    this.cursors = this.game.input.keyboard.createCursorKeys();

    // set spacebar as fire key
    this.fireKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  }

  private setupOSD(): void {

    this.scoreOSD = this.game.add.text(100, 100, "Score: " + this.score, { font: "34px Arial", fill: "#fff" });
    // this.OSD.lives = game.add.text(100, 200, "Lives: " + world.player.lives);
    // this.OSD.level = game.add.text(100, 300, "Level: " + this.level);

    // create a timer
    this.timer = this.game.time.create();

    // Create a delayed event 2m from now
    // this.timeUp = this.timer.add(Phaser.Timer.MINUTE * 2, () => { this.timer.stop(); this.gameover(); }, this);
    this.timeUp = this.timer.add(Phaser.Timer.MINUTE * 2, () => this.timesUp(), this);
    this.timerOSD = this.game.add.text(this.game.width - 100, 100, this.clock(this.timeUp), { font: "34px Arial", fill: "#fff" });

    // Start the timer
    this.timer.start();

  }

  private clock (timeEvent: Phaser.TimerEvent): string {
        // Convert seconds (s) to a nicely formatted and padded time string
        const secondsLeft: number = Math.round((timeEvent.delay - this.timer.ms) / 1000);
        const minutes: string = "0" + Math.floor(secondsLeft / 60);
        const seconds: string = "0" + Math.floor(secondsLeft % 60);
        return minutes.substr(-2) + ":" + seconds.substr(-2);
    }

  private timesUp(): void {
      this.timerOSD.setText("Times up!");
      this.gameover();
  }

  private gameover(): void {

    this.game.state.start("gameover", false, false, this.score);

  }

}