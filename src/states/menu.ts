export default class MenuState extends Phaser.State {

  public create(): void {

    this.game.add.text(80, 80, "TS Invaders", { font: "50px Arial", fill: "#fff" });
    this.game.add.text(80, this.game.world.height - 80, "Press space to start", { font: "50px Arial", fill: "#fff" });

    // look for spacebar press
    let space: Phaser.Key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    // call play funcion when user press spacebar
    space.onDown.addOnce(this.play, this);

  }

  public play = () => this.game.state.start("play");

}