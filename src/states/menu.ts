export default class MenuState extends Phaser.State {

  public create(): void {

    this.setupBackground();

    // game logo
    this.game.add.sprite(this.game.world.centerX, this.game.world.centerY / 2, "game").anchor.setTo(0.5, 0.5);

    this.game.add.text(80, this.game.world.height - 80, "Press space to start", { font: "50px Arial", fill: "#fff" });

    // look for spacebar press
    let space: Phaser.Key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    // call play funcion when user press spacebar
    space.onDown.addOnce(this.play, this);

    this.addButton(
      this.game.world.centerX, this.game.world.height * 2 / 3,
      "start", () => this.game.state.start("play"),
      0.25,
    );

  }

  private addButton(x: number, y: number, image: string, onClick: Function, scale: number = 0.5): void {

    let startButton = this.game.add.button(
      x, y,
      image, onClick, this,
      1, 0, 2,
    );

    startButton.anchor.setTo(0.5, 0.5);
    startButton.scale.setTo(scale);

  }

  private setupBackground = (image: string = "background") => this.game.add.tileSprite(0, 0, this.game.width, this.game.height, image);
  public play = () => this.game.state.start("play");

}