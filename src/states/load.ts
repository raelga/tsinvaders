/*
  The Load State - We display a ‘loading’ text, load our assets, and call the Menu State
*/

import path = require("path");

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

    const imageAssetsPath: string = typeof ASSETS_PATH !== "undefined" ? path.join(ASSETS_PATH, "/images") : "assets/images";

    [
      { name: "playerBullet", file: "playerBullet.png" },
      { name: "enemyBullet", file: "enemyBullet.png" },
      { name: "player", file: "player.png" },
      { name: "background", file: "background.png" },
      { name: "gameover", file: "gameover.png" },
    ].forEach((i: IImage) => this.game.load.image(i.name, path.join(imageAssetsPath, i.file)));

    [
      { name: "enemy", file: "enemy.png", width: 200, height: 200, frames: 6 },
      { name: "explosion", file: "explosion.png", width: 200, height: 200, frames: 6 },
      { name: "playerExplosion", file: "playerExplosion.png", width: 96, height: 96, frames: 12 },
      { name: "start", file: "start.png", width: 1920, height: 400, frames: 3 },
      { name: "restart", file: "restart.png", width: 304, height: 60, frames: 1 },
    ].forEach((s: ISprite) => this.game.load.spritesheet(s.name, path.join(imageAssetsPath, s.file), s.width, s.height, s.frames));

  }

  public create(): void {

      this.game.state.start("menu");

  }

}