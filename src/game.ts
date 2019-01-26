

/// <reference path="../phaser.d.ts"/>

import "phaser";
import { MainScene } from "./scenes/mainScene";

// main game configuration
const config: GameConfig = {
    width: 16 * 10 * 5,
    height: 16 * 10 * 8,
    disableContextMenu: true,
    type: Phaser.AUTO,
    parent: "game",
    scene: MainScene,
    // physics: {
    //     default: "matter",
    //     matter: {
    //         // debug: true,
    //     }
    // },
};

// game class
export class Game extends Phaser.Game {
    constructor(config: GameConfig) {
        super(config);
    }
}

// when the page is loaded, create our game instance
window.onload = () => {
    var game = new Game(config);

    // setTimeout(() => {
    // }, 100);
    function handleSizeUpdate(event?: Event) {
        const ww = window.innerWidth / Number(config.width);
        const hh = window.innerHeight / Number(config.height);

        const min = Math.min(ww, hh);
        console.log('handleSizeUpdate', window.innerWidth, ww, window.innerHeight, hh, min);

        game.canvas.style.width = `${min * Number(config.width)}px`;
        game.canvas.style.height = `${min * Number(config.height)}px`;
    }

    if (!window.location.search.includes('video')) {
        window.addEventListener('resize', handleSizeUpdate);

        console.log('init handleSizeUpdate');
        handleSizeUpdate();
    }
};

