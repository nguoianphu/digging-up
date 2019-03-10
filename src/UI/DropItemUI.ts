import { ItemSlot } from "../world/Item";
import { MainScene } from "../scenes/mainScene";
import { CellWorld, Cell } from "../world/CellWorld";
import { Player } from "../world/Player";
import { config, IBlockItemDef, IItemDef } from "../config/config";
import { EventContext } from "../utils/Utils";
import { CardButton } from "./CardButton";
import { DropEntity } from "../world/Entity";
import { DraggableCardButton } from "./DraggableCardButton";

type Container = Phaser.GameObjects.Container;
type Graphics = Phaser.GameObjects.Graphics;
const Point = Phaser.Geom.Point;

type Pointer = Phaser.Input.Pointer;

export class DropItemUI extends Phaser.GameObjects.Container {
    scene: MainScene;
    button: CardButton;
    static onDirectionChosen = 'onDirectionChosen';

    constructor(scene: MainScene, parentCallback:(droppedZoneID: number)=>void) {
        super(scene, 0, 0);
        this.scene = scene;
        const w = 128;
        const h = 128;
        this.button = new DraggableCardButton(scene, -1, 100, 100, w, h,
            () => {
                //
            },
            (droppedZoneID: number) => {
                parentCallback(droppedZoneID);
            }
        );
        this.add(this.button);
    }
    enable(dropEntity: DropEntity) {
        const dropSlot = dropEntity.slot;
        this.drawButton(dropSlot);
        this.setVisible(true);
    }
    disable(): void {
        this.setVisible(false);
    }

    drawButton(slot: ItemSlot) {
        slot.updateButton(this.button);
    }
}
