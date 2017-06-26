import Weapon from "./weapon";

export default class Player {

  public ship: Phaser.Sprite;
  public bullets: Phaser.Group;
  public weapon: Weapon;
  private explosions: Phaser.Group;

  public lives: number = 5;

  private PLAYER_SPEED: number = 500;

  constructor(ship: Phaser.Sprite, explosions: Phaser.Group, weapon: Weapon) {

    // attach the ship
    this.ship = ship;
    this.ship.scale.set(0.25);

    // create the explosions pool
    this.explosions = explosions;
    this.explosions.createMultiple(30, "playerExplosion");
    [
      { name: "width", value: this.ship.width * 2 },
      { name: "height", value: this.ship.height * 2 },
    ].forEach((s) => this.explosions.setAll(s.name, s.value));

    // attach the player weapon
    this.weapon = weapon;

  }

  public update(): void  {

    // reduce the fire cooldown
    this.weapon.cool();

    // reset the velocity to stop the ship
    this.ship.body.velocity.setTo(0, 0);

  }

  public move(x: number = 0, y: number = 0, speed: number = this.PLAYER_SPEED): void  {

    // move the ship
    this.ship.body.velocity.setTo(x * speed, y * speed);

  }

  private die(): void {

    if (this.lives) this.lives--;
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
    return (this.lives < 1);
  }

  public hit(ship: Phaser.Sprite): void {

    ship.kill();

    this.die();

  }

  public fire = () => this.weapon.fire(this.ship);

  public respawn = (x: number, y: number) => { this.ship.revive(); this.ship.position.setTo(x, y); };

}
