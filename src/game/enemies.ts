interface ISetting {
  name: string;
  value: string|boolean|number;
}

export default class Enemies {

  ships:    Phaser.Group;
  bullets:  Phaser.Group;
  private explosions: Phaser.Group;

  private level: number = 10;
  private cooldown: number = 0;

  private BULLET_SPEED: number = 100;
  private FIRE_COOLDOWN: number = 10;

  constructor(game: Phaser.Game, shipImage: string = "enemy", bulletImage: string = "enemyBullet") {

    // create the ships group for the enemies
    this.ships = game.add.group();
    this.ships.enableBody = true;
    this.ships.physicsBodyType = Phaser.Physics.ARCADE;

    // create the enemy fleet
    this.createEnemyFleet(game, shipImage, 2, 5);

    // create the bullet group for the enemies
    this.bullets = game.add.group();
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.bullets.enableBody = true;

    // create the bullets pool
    this.bullets.createMultiple(30, bulletImage);
    let settings: ISetting[] = [
      { name: "width", value: 20 },
      { name: "height", value: 20 },
      { name: "anchor.x", value: 0.5 },
      { name: "anchor.y", value: 1 },
      { name: "outOfBoundsKill", value: true },
      { name: "checkWorldBounds", value: true },
    ]; settings.forEach((s: ISetting) => this.bullets.setAll(s.name, s.value));

    // create the explosions pool
    this.explosions = game.add.group();
    this.explosions.createMultiple(30, "playerExplosion");

  }

  public createEnemyFleet(game: Phaser.Game, image: string = "enemy", rows: number = 3, columns: number = 6, difficulty: number = 1): void  {

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
    ship.outOfBoundsKill = true;

    // animate the ships
    ship.animations.add("animate", undefined, 6, true);
    ship.play("animate");
    ship.body.moves = false;

    // add them health
    ship.health = 100;

  }

  public update(target: Phaser.Sprite, game: Phaser.Game): void {

    // add rotation to the bullets
    this.bullets.forEach((b: Phaser.Sprite) => b.angle++, this);

    // reduce the fire cooldown
    if (this.cooldown > 0) {
      this.cooldown--;
    }

    if ( (Math.floor(Math.random() * 1000) / this.level ) < 10 ) {
      this.fire(target, game);
    }

    if (!this.ships.getFirstAlive()) {
      this.ships.reviveAll();
      this.createEnemyFleet( game, undefined, 5, 5, this.level);
    }

  }

  public fire(target: Phaser.Sprite, game: Phaser.Game, speed: number = this.BULLET_SPEED): void {

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
            speed + 50 * this.level,
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
