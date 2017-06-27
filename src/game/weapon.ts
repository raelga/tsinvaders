interface IWeapon {

    readonly cooldown: number;
    readonly bullets: Bullets;
    cool(ammount: number): void;
    fire(source: Phaser.Sprite, target?: Phaser.Group, game?: Phaser.Game): void;

}

interface IBullets extends Phaser.Group {
    image: string;
    speed: number;
}

class Bullets extends Phaser.Group implements IBullets {
    public image: string;
    public speed: number;

    constructor(group: Phaser.Group, image: string, speed: number) {
        super(group.game);
        this.image = image;
        this.speed = speed;

    }
}

export default class Weapon implements IWeapon {

    public cooldown: number = 0;
    public bullets: Bullets;

    private FIRE_COOLDOWN: number = 0;

    constructor(bulletGroup: Phaser.Group,
                bulletImage: string = "bullet",
                bulletSpeed: number = 10,
                fireCooldown: number = 0) {

        this.setupBullets(bulletGroup, bulletImage, bulletSpeed);

        this.FIRE_COOLDOWN = fireCooldown;
        this.resetWeapon();

    }

    private setupBullets(group: Phaser.Group, image: string, speed: number, ammount: number = 30, scale: number = 0.25): void {

        // create the bullet group
        this.bullets = new Bullets(group, image, speed);
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;

        // create the bullets
        this.bullets.createMultiple(ammount, this.bullets.image);
        [
        { name: "scale.x", value: scale },
        { name: "scale.y", value: scale },
        { name: "anchor.x", value: 0.5 },
        { name: "anchor.y", value: 1 },
        { name: "outOfBoundsKill", value: true },
        { name: "checkWorldBounds", value: true },
        ].forEach((s) => this.bullets.setAll(s.name, s.value));

    }

    private resetWeapon(): void {

        this.cooldown = 0;
        this.bullets.killAll();

    }

    public fire(source: Phaser.Sprite, target?: Phaser.Group, game?: Phaser.Game): void  {

        // check cooldown
        if (!this.cooldown) {

            // get a bullet from the bullets pool
            let bullet: Phaser.Sprite = this.bullets.getFirstExists(false);

            // if a bullet is available
            if (bullet) {

                // bullet starting position above the player ship
                bullet.reset(source.x + source.width / 2, source.y + 10);

                if (typeof target === "undefined") {
                    // bullet fired!
                    bullet.body.velocity.y = this.bullets.speed;
                } else {
                    // fire the bullet from this enemy to the player
                    game.physics.arcade.moveToObject(
                        bullet, target,
                    );
                }

                // set up the cooldown
                this.startCooldown();

            }

        }

    }

    public cool = (ammount: number = 1) => { if (this.cooldown) this.cooldown -= ammount; };
    public startCooldown = () => this.cooldown = this.FIRE_COOLDOWN;
}