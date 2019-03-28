
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
import { DraggableCardButton } from './DraggableCardButton';
import { MainScene } from '../scenes/mainScene';
import { DropEntity, Entity } from '../world/Entity';
import { Player } from '../world/Player';
import { DropItemUI } from './DropItemUI';
import { config, IDropEntityDef } from '../config/config';

const log = Debug('digging-up:BackpackPanel:log');
const warn = Debug('digging-up:BackpackPanel:warn');
warn.log = console.warn.bind(console);

export interface interactionResult {
    backpackChanged: boolean;
}

export class BackpackPanel extends Phaser.GameObjects.Container {

    private padding = 8;
    private bg: Container;
    private buttonContainer: Container;
    private slotButtons: DraggableCardButton[];
    private buttonClose: Image;
    private dropItemUI: DropItemUI;

    private resolve: null | ((a: interactionResult) => void) = null;
    private player: Player;
    backpackChanged: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number) {
        super(scene, x, y);
        this.width = w;
        this.height = h;

        const rect = scene.make.graphics({
            x: 0, y: 0,
            fillStyle: { color: 0xEEEEEE, alpha: 1 },
        })
        rect.fillRect(0, 0, w, h);
        this.add(rect);

        this.createSlotButtons();
        this.createDropItemUI();
        this.createCloseButton();
    };

    createSlotButtons(): void {
        const padding = 4;
        const buttonWidth = (this.width - padding * 5) / 4;
        const buttonHeight = 128;

        this.buttonContainer = this.scene.add.container(0, this.height - buttonHeight);
        this.add(this.buttonContainer);

        this.slotButtons = new Array(4).fill(1).map((_, i) => {
            const mainScene = this.scene as MainScene;
            return (new DraggableCardButton(
                this.scene, i,
                0 + padding + buttonWidth / 2 + (buttonWidth + padding) * i, - padding + buttonHeight / 2,
                buttonWidth, buttonHeight,
                () => this.onSlotButtonPressed(i),
                (droppedZoneID: number) => {
                    if (!this.player.tempDrop) throw new Error('tempDrop should not be null now');
                    mainScene.onItemDragDropped(i, droppedZoneID);
                    this.dropItemUI.enable(this.player.tempDrop);
                    this.backpackChanged = true;
                }
            ));
        });
        this.buttonContainer.add(this.slotButtons);
    }


    createDropItemUI() {
        this.dropItemUI = new DropItemUI(this.scene as MainScene, (droppedZoneID: integer) => {
            const mainScene = this.scene as MainScene;
            if (!this.player.tempDrop) throw new Error('tempDrop should not be null now');
            mainScene.onItemDragDropped(-1, droppedZoneID);
            this.dropItemUI.enable(this.player.tempDrop);
            this.backpackChanged = true;
        });

        this.add(this.dropItemUI);
        // this.dropItemUI.disable();
    }

    createCloseButton(): void {
        this.add(this.buttonClose = this.scene.add.image(this.width, 0, 'button_close'));
        this.buttonClose.setInteractive();
        this.buttonClose.on('pointerup', () => {
            this.close();
        })
    }

    onSlotButtonPressed(i: number): void {
        warn(`onSlotButtonPressed(${i}) for non-drag interface (later)`);
    }

    setUp(player: Player) {
        this.player = player;
        if (!this.player.tempDrop) throw new Error('tempDrop should not be null now');
        this.player.on(Player.onItemUpdated, this.updateSlotButton, this);
        this.dropItemUI.enable(this.player.tempDrop);
        this.slotButtons.forEach((_, slotID) => this.updateSlotButton(slotID));
    }

    updateSlotButton(slotID: integer) {
        this.player.slots[slotID].updateButton(this.slotButtons[slotID]);
    }

    async interact(): Promise<interactionResult> {
        return new Promise((resolve, reject) => {
            this.resolve = (a: interactionResult) => resolve(a);
        });
    }

    close(isSilent = false): void {
        this.player.off(Player.onItemUpdated, this.updateSlotButton, this, false);
        // do clean up
        if (!isSilent && this.resolve) this.resolve({ backpackChanged: false });
    }
}
