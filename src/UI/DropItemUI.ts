import { ItemSlot } from "../world/Item";
import { MainScene } from "../scenes/mainScene";
import { CellWorld, Cell } from "../world/CellWorld";
import { Player } from "../world/Player";
import { config, IBlockItemDef, IItemDef } from "../config";
import { EventContext } from "../Utils";
import { CardButton } from "./CardButton";
import { DropEntity } from "../world/Entity";

type Container = Phaser.GameObjects.Container;
type Graphics = Phaser.GameObjects.Graphics;
const Point = Phaser.Geom.Point;

type Pointer = Phaser.Input.Pointer;

export class DropItemUI extends Phaser.GameObjects.Container {
    scene: MainScene;
    button: CardButton;
    static onDirectionChosen = 'onDirectionChosen';

    constructor(scene: MainScene) {
        super(scene, 0, 0);
        this.scene = scene;
        const w = 128;
        const h = 128;
        this.button = new CardButton(scene, 560, 800, w, h, () => {
        });
        this.add(this.button);
    }
    enable(dropEntity: DropEntity) {
        const drop = dropEntity.entityDef.drop;
        const fakeSlot: ItemSlot = new ItemSlot(drop.item, drop.level);
        if (drop.count) fakeSlot.setCount(drop.count);
        this.drawButton(fakeSlot);
        this.setVisible(true);
    }
    disable(): void {
        this.setVisible(false);
    }

    drawButton(slot: ItemSlot) {
        slot.updateButton(this.button);
    }
}
