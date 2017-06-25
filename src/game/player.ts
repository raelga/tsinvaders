import "p2";
import "pixi";

import "phaser";


export default class Player {

  public ship: Phaser.Sprite;
  public bullets: Phaser.Group;
  public lives: Phaser.Group;

  private explosions: Phaser.Group;

  private cooldown: number = 0;

  private PLAYER_SPEED: number = 300;
  private BULLET_SPEED: number = -600;
  private FIRE_COOLDOWN: number = 10;

  constructor(game: Phaser.Game, shipImage: string, bulletImage: string) {

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
        bullet.reset(this.ship.x, this.ship.y + 8);

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
