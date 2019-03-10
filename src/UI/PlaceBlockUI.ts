import { ItemSlot } from "../world/Item";
import { MainScene } from "../scenes/mainScene";
import { CellWorld, Cell } from "../world/CellWorld";
import { Player } from "../world/Player";
import { config, IBlockItemDef } from "../config/config";
import { EventContext } from "../utils/Utils";

type Container = Phaser.GameObjects.Container;
type Graphics = Phaser.GameObjects.Graphics;
const Point = Phaser.Geom.Point;

type Pointer = Phaser.Input.Pointer;

export class PlaceBlockUI extends Phaser.GameObjects.Container {
    scene: MainScene;
    cellWorld: CellWorld;
    buttons: Container[] = [];
    directions = [
        new Point(-1, -1),
        new Point(0, -1),
        new Point(1, -1),
        new Point(-1, 0),
        new Point(0, 0),
        new Point(1, 0),
        new Point(-1, 1),
        new Point(0, 1),
        new Point(1, 1),
    ];
    static onDirectionChosen = 'onDirectionChosen';

    constructor(scene: MainScene, cellWorld: CellWorld) {
        super(scene, 0, 0);
        this.scene = scene;
        this.cellWorld = cellWorld;
    }
    enable(player: Player, viewportX: integer, viewportY: integer, slot: ItemSlot) {
        this.removeAll(true);

        this.buttons = this.directions.map((direction, i) => {
            const { x: dx, y: dy } = direction;
            const w = config.spriteWidth;
            const h = config.spriteHeight;

            const cellX = player.cellX + dx;
            const cellY = player.cellY + dy;
            const button = this.scene.make.container({
                x: (cellX - viewportX) * w,
                y: (cellY - viewportY) * h,
            });

            let wasDown = false;
            button.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);

            button.on('pointerdown', (pointer: Pointer, localX: number, localY: number, evt: EventContext) => {
                // console.log('pointerdown', pointer, localX, localY, evt);
                wasDown = true;
            });
            button.on('pointerup', (pointer: Pointer, localX: number, localY: number, evt: EventContext) => {
                // console.log('pointerdown', pointer, localX, localY, evt);

                if (wasDown) this.emit(PlaceBlockUI.onDirectionChosen, new Point(dx, dy));
            });
            this.scene.input.on('pointerup', () => {
                wasDown = false;
            });

            return button;
        });

        this.add(this.buttons);
        this.updateButtons(player, viewportX, viewportY, slot);
        this.setVisible(true);
    }
    disable(): void {
        this.setVisible(false);
    }

    updateButtons(player: Player, viewportX: integer, viewportY: integer, slot: ItemSlot) {
        if (this.buttons.length <= 0) return;
        this.directions.map((direction, i) => {
            const { x: dx, y: dy } = direction;
            const w = config.spriteWidth;
            const h = config.spriteHeight;

            const cellX = player.cellX + dx;
            const cellY = player.cellY + dy;

            const button = this.buttons[i];
            button.x = (cellX - viewportX) * w;
            button.y = (cellY - viewportY) * h;

            this.drawButton(button, this.cellWorld.getCell(cellX, cellY), slot.itemDef as IBlockItemDef);
        });

    }

    drawButton(button: Container, cell: Cell, itemDef: IBlockItemDef) {
        if (!cell) return;
        button.removeAll(true);
        const w = config.spriteWidth;
        const h = config.spriteHeight;
        const { builds } = itemDef.block;

        const canBuild = (cell.physicsType === 'air'); // TODO: call a canBuild() method

        // const color = canBuild ? 0x00FF00 : 0xFF0000;
        // const buttonGraphics = this.scene.make.graphics({
        //     x: 0, y: 0,
        //     fillStyle: { color: color, alpha: 0.1 },
        //     lineStyle: { width: 5, color: color, alpha: 1 },
        // });
        // buttonGraphics.fillRect(0, 0, w, h);
        // buttonGraphics.strokeRect(0, 0, w, h);

        const color = canBuild ? 22 : 33; // 47
        const buttonGraphics = this.scene.add.image(0, 0, 'simplified_platformer', color).setOrigin(0);
        button.add(buttonGraphics);
    }
}
