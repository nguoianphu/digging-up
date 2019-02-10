
type Pointer = Phaser.Input.Pointer;
type GameObject = Phaser.GameObjects.GameObject;
type Container = Phaser.GameObjects.Container;
type Text = Phaser.GameObjects.Text;
type Scene = Phaser.Scene;

import { EventContext, defaultFont } from '../Utils';

export class CardButton extends Phaser.GameObjects.Container {
    cardButtonID: integer;
    iconContainer: Container;
    title: Text;
    countLabel: Text;
    buttonGraphics: CardButtonGraphics;

    constructor(scene: Phaser.Scene, id: integer, x: number, y: number, w: number, h: number, pressedCallback: () => void, droppedCallback: (droppedZoneID: integer) => void) {
        super(scene, x, y);
        this.cardButtonID = id;
        this.buttonGraphics = new CardButtonGraphics(scene, -w / 2, -h / 2, w, h, pressedCallback);
        this.add(this.buttonGraphics);
        // this.add(this.scene.add.zone(
        //     0, 0,
        //     w, h
        // ).setRectangleDropZone(w, h).setData('zoneID', id));
        this.iconContainer = scene.add.container(0, 0);
        this.add(this.iconContainer);


        // this.iconContainer.setInteractive(new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h), Phaser.Geom.Rectangle.Contains);
        // this.scene.input.setDraggable(this.iconContainer);
        // this.iconContainer.disableInteractive();
        let isDragging = false;
        // var zone = this.add.zone(500, 300, 300, 300).setRectangleDropZone(300, 300);
        this.iconContainer.on('drag', (pointer: Pointer, dragX: number, dragY: number) => {
            const { dragStartX, dragStartY } = this.iconContainer.input;
            if (isDragging || Phaser.Math.Distance.Between(dragStartX, dragStartY, dragX, dragY) > 60) {
                this.iconContainer.x = dragX;
                this.iconContainer.y = dragY;
                isDragging = true;
            }
        });

        this.iconContainer.on('dragend', (pointer: Pointer, dragX: number, dragY: number, dropped: boolean) => {
            if (!dropped) {
                this.iconContainer.x = this.iconContainer.input.dragStartX;
                this.iconContainer.y = this.iconContainer.input.dragStartY;
            }
        });

        this.iconContainer.on('drop', (pointer: Pointer, zone: Phaser.GameObjects.Zone) => {
            console.log('dropped', zone.getData('zoneID'));

            droppedCallback(zone.getData('zoneID'));

            this.iconContainer.x = this.iconContainer.input.dragStartX;
            this.iconContainer.y = this.iconContainer.input.dragStartY;
            isDragging = false;
        });

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
            console.log('pointerover');
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
