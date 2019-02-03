
type Pointer = Phaser.Input.Pointer;
type GameObject = Phaser.GameObjects.GameObject;
type Container = Phaser.GameObjects.Container;
type Text = Phaser.GameObjects.Text;
type Scene = Phaser.Scene;

import { EventContext, defaultFont } from '../Utils';

export class CardButton extends Phaser.GameObjects.Container {
    iconContainer: Container;
    title: Text;
    countLabel: Text;
    buttonGraphics: CardButtonGraphics;

    constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number, pressedCallback: () => void) {
        super(scene, x, y);
        this.buttonGraphics = new CardButtonGraphics(scene, -w / 2, -h / 2, w, h, pressedCallback);
        this.add(this.buttonGraphics);
        this.iconContainer = scene.add.container(0, 0);
        this.add(this.iconContainer);

        this.title = scene.make.text({
            x: 0, y: 50,
            text: '',
            style: {
                fontSize: 30,
                color: '#000000',
                align: 'center',
                fontFamily: defaultFont,
            },
            origin: { x: 0.5, y: 0.5 },
        });
        this.add(this.title);

        this.countLabel = scene.make.text({
            x: 50, y: 20,
            text: ' ',
            style: {
                fontSize: 30,
                color: '#000000',
                align: 'center',
                fontFamily: defaultFont,
            },
            origin: { x: 0.5, y: 0.5 },
        });
        this.add(this.countLabel);
    }

    updateChildren(callback: (scene: Scene, iconContainer: Container, title: Text, countLabel: Text) => void) {
        callback(this.scene, this.iconContainer, this.title, this.countLabel);
    }

    updateButtonActive(isActive: boolean) {
        // console.log('updateButtonActive', isActive);

        this.buttonGraphics.isActive = isActive;
        this.buttonGraphics.drawUpCard();
    }
}



export class CardButtonGraphics extends Phaser.GameObjects.Graphics {
    fillRoundedRect: (x: number, y: number, w: number, h: number, r: number | { tl: number, tr: number, bl: number, br: number }) => this;
    strokeRoundedRect: (x: number, y: number, w: number, h: number, r: number | { tl: number, tr: number, bl: number, br: number }) => this;

    w: number; h: number;
    isActive: boolean;
    wasDown: boolean = false;
    pressedCallback: () => void;

    constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number, pressedCallback: () => void) {
        super(scene, {
            x, y,
            fillStyle: { color: 0xfcfcf9, alpha: 1 },
            lineStyle: { width: 5, color: 0xAAAAAA, alpha: 1 },
        });

        this.w = w;
        this.h = h;

        this.drawUpCard();

        this.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);

        this.wasDown = false;
        this.on('pointerover', function (pointer: Pointer, localX: number, localY: number, evt: EventContext) {
            // console.log('pointerover');
            this.drawOverCard();
        });
        this.on('pointerout', function (pointer: Pointer, evt: EventContext) {
            // console.log('pointerout');
            this.drawUpCard();
        });
        this.on('pointerdown', (pointer: Pointer, localX: number, localY: number, evt: EventContext) => {
            // console.log('pointerdown');
            this.drawDownCard();
            this.wasDown = true;
        });
        this.on('pointerup', (pointer: Pointer, localX: number, localY: number, evt: EventContext) => {
            // console.log('pointerup');
            this.drawUpCard();
            if (this.wasDown) {
                pressedCallback();
            }
        });
        this.scene.input.on('pointerup', () => {
            this.wasDown = false;
        })
    }

    drawUpCard() {
        this.clear();
        const bgColor = (this.isActive ? 0xfcfcf9 : 0xcccccc);
        this.fillStyle(bgColor, 1);
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
