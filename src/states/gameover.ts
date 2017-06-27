export default class GameOverState extends Phaser.State {

  private score: number = 0;
  private message: string;

  public init(message: string, score: number) {

    this.score = score;
    this.message = message;

  }

  public create(): void {

    this.showGameOverBanner();

    this.game.add.text(this.game.world.width / 3, this.game.world.height / 2, this.message, { font: "50px Arial", fill: FONT_COLOR });
    this.game.add.text(this.game.world.width / 3, this.game.world.height / 2 + 100, "Final Score: " + this.score, { font: "50px Arial", fill: FONT_COLOR });

    this.addButton(
      this.game.world.centerX, this.game.world.height - 100,
      "restart", () => this.game.state.start("play"),
    );

  }

  public showGameOverBanner() {

    let gameover: Phaser.Sprite = this.game.add.sprite(this.game.world.width / 2, this.game.world.height / 2 - 100, "gameover");

    gameover.anchor.setTo(0.5, 0.5);
    gameover.alpha = 0;
    gameover.scale.setTo(0.25);

    this.game.add.tween(gameover).to( { alpha: 1 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);

  }

  private addButton(x: number, y: number, image: string, onClick: Function): void {

    let startButton = this.game.add.button(
      x, y,
      image, onClick, this,
      1, 0, 2,
    );

    startButton.anchor.setTo(0.5, 0.5);
    startButton.scale.setTo(1);

  }


}