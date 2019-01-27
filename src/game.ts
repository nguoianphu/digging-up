

/// <reference path="../phaser.d.ts"/>

import "phaser";
import { MainScene } from "./scenes/mainScene";

import { config } from './config';

// main game configuration
const phaserConfig: GameConfig = {
    width: config.spriteWidth * config.viewWidth,
    height: config.spriteHeight * config.viewHeight,
    disableContextMenu: true,
    type: Phaser.AUTO,
    parent: "game",
    scene: MainScene,
    zoom: 1,
    pixelArt: true,
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
    var game = new Game(phaserConfig);

    // setTimeout(() => {
    // }, 100);
    function handleSizeUpdate(event?: Event) {
        const ww = window.innerWidth / Number(phaserConfig.width);
        const hh = window.innerHeight / Number(phaserConfig.height);

        const min = Math.min(ww, hh);
        console.log('handleSizeUpdate', window.innerWidth, ww, window.innerHeight, hh, min);

        game.canvas.style.width = `${min * Number(phaserConfig.width)}px`;
        game.canvas.style.height = `${min * Number(phaserConfig.height)}px`;
    }

    if (!window.location.search.includes('video')) {
        window.addEventListener('resize', handleSizeUpdate);

        console.log('init handleSizeUpdate');
        handleSizeUpdate();
    }
};

