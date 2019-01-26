
type Pointer = Phaser.Input.Pointer;
type GameObject = Phaser.GameObjects.GameObject;
import { EventContext } from '../Utils';

export class CardButton extends Phaser.GameObjects.Container {

    constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number, children: GameObject[] = []) {
        super(scene, x, y);
        this.add(new CardButtonGraphics(scene, -w / 2, -h / 2, w, h));
        this.add(children);
    }
}



export class CardButtonGraphics extends Phaser.GameObjects.Graphics {
    fillRoundedRect: (x: number, y: number, w: number, h: number, r: number | { tl: number, tr: number, bl: number, br: number }) => this;
    strokeRoundedRect: (x: number, y: number, w: number, h: number, r: number | { tl: number, tr: number, bl: number, br: number }) => this;

    w: number; h: number;

    constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number) {
        super(scene, {
            x, y,
            fillStyle: { color: 0xfcfcf9, alpha: 1 },
            lineStyle: { width: 5, color: 0xAAAAAA, alpha: 1 },
        });

        this.w = w;
        this.h = h;

        this.drawUpCard()

        this.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
        this.on('pointerover', function (pointer: Pointer, localX: number, localY: number, evt: EventContext) {
            console.log('pointerover');
            this.drawOverCard();
        });
        this.on('pointerout', function (pointer: Pointer, evt: EventContext) {
            console.log('pointerout');
            this.drawUpCard();
        });
        this.on('pointerdown', (pointer: Pointer, localX: number, localY: number, evt: EventContext) => {
            console.log('pointerdown');
            this.drawDownCard();
        });
        this.on('pointerup', (pointer: Pointer, localX: number, localY: number, evt: EventContext) => {
            console.log('pointerup');
            this.drawUpCard();
        });
    }

    drawUpCard() {
        this.clear();
        this.fillStyle(0xfcfcf9, 1);
        this.strokeRoundedRect(0, 0, this.w, this.h, 4);
        this.fillRoundedRect(0, 0, this.w, this.h, 4);
    }
    drawOverCard() {
        this.clear();
        this.fillStyle(0xFFFFAA, 1);
        this.strokeRoundedRect(0, 0, this.w, this.h, 4);
        this.fillRoundedRect(0, 0, this.w, this.h, 4);
    }
    drawDownCard() {
        this.clear();
        this.fillStyle(0xFFAAAA, 1);
        this.strokeRoundedRect(0, 0, this.w, this.h, 4);
        this.fillRoundedRect(0, 0, this.w, this.h, 4);
    }
}
