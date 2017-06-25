export default class GameOverState extends Phaser.State {

  private score: number = 0;
  private message: string;

  public init(message: string, score: number) {

    this.score = score;
    this.message = message;

  }

  public create(): void {

    this.game.add.text(this.game.world.height / 3, this.game.world.height / 2 - 100, "Game Over", { font: "50px Arial", fill: "#fff" });
    this.game.add.text(this.game.world.height / 3, this.game.world.height / 2, this.message, { font: "50px Arial", fill: "#fff" });
    this.game.add.text(this.game.world.height / 3, this.game.world.height / 2 + 100, "Final Score: " + this.score, { font: "50px Arial", fill: "#fff" });
    this.game.add.text(this.game.world.height / 3, this.game.world.height - 80, "Press space to restart", { font: "50px Arial", fill: "#fff" });

    // look for spacebar press
    let space: Phaser.Key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    // call play funcion when user press spacebar
    space.onDown.addOnce(this.restart, this);

  }

  public restart = () => this.game.state.start("play");

}