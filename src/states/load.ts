/*
  The Load State - We display a ‘loading’ text, load our assets, and call the Menu State
*/

interface IFile {
  name: string;
  file: string;
}

interface IImage extends IFile {
  width?: number;
  height?: number;
}

interface ISprite extends IImage {
  frames?: number;
}

export default class LoadState extends Phaser.State {

  public preload(): void {

    this.game.add.text(100, 100, "Loading assets...", { font: "34px Arial", fill: "#fff" });

    const assetsPath: String = typeof ASSETS_PATH !== "undefined" ? ASSETS_PATH : "assets/base/png/";

    [
      { name: "playerBullet", file: "playerBullet.png" },
      { name: "enemyBullet", file: "enemyBullet.png" },
      { name: "player", file: "player.png" },
      { name: "background", file: "background.png" },
    ].forEach((i: IImage) => this.game.load.image(i.name, assetsPath + i.file));

    [
      { name: "enemy", file: "enemy.png", width: 200, height: 200, frames: 6 },
      { name: "explosion", file: "explosion.png", width: 200, height: 200, frames: 6 },
      { name: "playerExplosion", file: "playerExplosion.png", width: 96, height: 96, frames: 12 },
    ].forEach((s: ISprite) => this.game.load.spritesheet(s.name, assetsPath + s.file, s.width, s.height, s.frames));

  }

  public create(): void {

      this.game.state.start("menu");

  }

}