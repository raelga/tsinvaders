/*
 * The Boot State - We are simply going to start the physics system, and then call the Load State
 */

export default class BootState extends Phaser.State {

    public create(): void {

        // set scale mode
        this.game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;

        // center game
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;

        // execute next state
        this.game.state.start("load");

    }

}