
type Pointer = Phaser.Input.Pointer;
type GameObject = Phaser.GameObjects.GameObject;
type Container = Phaser.GameObjects.Container;
type Text = Phaser.GameObjects.Text;
type Scene = Phaser.Scene;

import { EventContext, defaultFont } from '../utils/Utils';
import { CardButtonGraphics } from './CardButton';
import * as Debug from 'debug'

const log = Debug('digging-up:DraggableCardButton:log');
// const warn = Debug('digging-up:DraggableCardButton:warn');
// warn.log = console.warn.bind(console);

export class DraggableCardButton extends Phaser.GameObjects.Container {
    cardButtonID: integer;
    iconContainer: Container;
    title: Text;
    countLabel: Text;
    buttonGraphics: CardButtonGraphics;
    dropZone: Phaser.GameObjects.Zone;

    constructor(scene: Phaser.Scene, id: integer, x: number, y: number, w: number, h: number, pressedCallback: () => void, droppedCallback: (droppedZoneID: integer) => void) {
        super(scene, x, y);
        this.cardButtonID = id;

        this.buttonGraphics = new CardButtonGraphics(scene, -w / 2, -h / 2, w, h, pressedCallback);
        this.add(this.buttonGraphics);

        this.dropZone = this.scene.add.zone(
            0, 0,
            w, h
        ).setRectangleDropZone(w, h)
            .setData('zoneID', id);
        this.add(this.dropZone);

        this.iconContainer = scene.add.container(0, 0);
        this.add(this.iconContainer);


        this.iconContainer.setInteractive(new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h), Phaser.Geom.Rectangle.Contains);
        this.scene.input.setDraggable(this.iconContainer);

        // this.iconContainer.disableInteractive();
        // this.dropZone.disableInteractive();

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
            log('dropped', zone.getData('zoneID'));

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
        // log('updateButtonActive', isActive);

        this.buttonGraphics.isActive = isActive;
        this.buttonGraphics.drawUpCard();
    }

    toggleDrag(val?: boolean) {
        if (val == null) {
            val = !this.iconContainer.input.enabled;
        }
        if (val) {
            this.iconContainer.setInteractive();
            this.dropZone.setInteractive();
        } else {
            this.iconContainer.disableInteractive();
            this.dropZone.disableInteractive();
        }
    }
}
