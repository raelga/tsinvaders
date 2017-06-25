import "p2";
import "pixi";

import "phaser";

import BootState from "./states/boot";
import GameOverState from "./states/gameover";
import LoadState from "./states/load";
import MenuState from "./states/menu";
import PlayState from "./states/play";

class Game extends Phaser.Game {

    constructor(config: Phaser.IGameConfig) {
        super (config);

        this.state.add("boot", BootState);
        this.state.add("load", LoadState);
        this.state.add("menu", MenuState);
        this.state.add("play", PlayState);
        this.state.add("gameover", GameOverState);

        this.state.start("boot");

    }

}

function startGame(): void {

    let gameWidth: number   = typeof DEFAULT_GAME_WIDTH !== "undefined" ? DEFAULT_GAME_WIDTH : 1920;
    let gameHeight: number  = typeof DEFAULT_GAME_HEIGHT !== "undefined" ? DEFAULT_GAME_HEIGHT : 1200;

    // There are a few more options you can set if needed, just take a look at Phaser.IGameConfig
    let gameConfig: Phaser.IGameConfig = {
        width:          gameWidth,
        height:         gameHeight,
        renderer:       Phaser.AUTO,
        parent:         "",
        transparent:    false,
        antialias:      false,
        state:          this,
        physicsConfig:  Phaser.Physics.ARCADE,
    };

    new Game(gameConfig);

}

window.onload = () => startGame();