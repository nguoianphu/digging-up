
type Pointer = Phaser.Input.Pointer;
type GameObject = Phaser.GameObjects.GameObject;
type Container = Phaser.GameObjects.Container;
type Image = Phaser.GameObjects.Image;
type Graphics = Phaser.GameObjects.Graphics;
type Text = Phaser.GameObjects.Text;
type Scene = Phaser.Scene;

import { EventContext, defaultFont } from '../utils/Utils';
import { ItemTypes } from '../config/_ItemTypes';
import * as Debug from 'debug'

const log = Debug('digging-up:ButtonBar:log');
// const warn = Debug('digging-up:ButtonBar:warn');
// warn.log = console.warn.bind(console);

export class ButtonBar extends Phaser.GameObjects.Container {

    private _backpackButton: BackpackButton;
    private padding = 8;

    public static onBackpackButtonPressed = 'onBackpackButtonPressed';

    constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number) {
        super(scene, x, y);
        this.width = w;
        this.height = h;

        const rect = scene.make.graphics({
            x: 0, y: 0,
            fillStyle: { color: 0xAAAAAA, alpha: 0.5 },
        })
        rect.fillRect(0, 0, w, h);
        this.add(rect);

        this._backpackButton = new BackpackButton(
            scene,
            w - this.padding - 128 / 2,
            h - 128 / 2 - this.padding,
            () => this.emit(ButtonBar.onBackpackButtonPressed)
        );
        this.add(this._backpackButton);
    };

    setHP(hp: integer, hpMax: integer) {

    }

    setBackpackButtonIcon(iconType: BackpackButtonTypes) {
        return this._backpackButton.setIcon(iconType);
    }
}

export enum BackpackButtonTypes {
    NORMAL,
    PICK_ITEM,
}

export class BackpackButton extends Phaser.GameObjects.Container {

    bg: Graphics;
    icon: Image;

    constructor(scene: Phaser.Scene, x: number, y: number, onClick: () => void) {
        super(scene, x, y);

        this.add(this.bg = scene.make.graphics({
            x: 0, y: 0,
            fillStyle: { color: 0x66584F, alpha: 1 },
        }));
        this.bg.fillCircle(0, 0, 64);

        this.add(this.icon = scene.make.image({
            x: 0, y: 0,
            key: 'icon_backpack',
            frame: null,
        }));

        this.setUpClick(onClick);
    }
    setUpClick(onClick: () => void): void {
        this.setInteractive(
            new Phaser.Geom.Circle(0, 0, 64),
            Phaser.Geom.Circle.Contains
        );

        this.on('pointerup', (pointer: Pointer) => {
            onClick();
        })
    }

    setIcon(iconType: BackpackButtonTypes) {
        log(`setIcon(${iconType})`);

        switch (iconType) {
            case BackpackButtonTypes.NORMAL: {
                this.icon.setTexture('icon_backpack');
            } break;
            case BackpackButtonTypes.PICK_ITEM: {
                this.icon.setTexture('icon_take');
            } break;
        }
    }
}