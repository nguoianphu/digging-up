import { ItemSlot } from "../world/Item";
import { MainScene } from "../scenes/mainScene";
import { CellWorld } from "../world/CellWorld";
import { Player } from "../world/Player";
import { config } from "../config";

const Container = Phaser.GameObjects.Container;
const Point = Phaser.Geom.Point;

export class PlaceBlockUI extends Container {
    scene: MainScene;
    cellWorld: CellWorld;
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

    constructor(scene: MainScene, cellWorld: CellWorld) {
        super(scene, 0, 0);
        this.scene = scene;
        this.cellWorld = cellWorld;
    }
    enable(player: Player, viewPortX: integer, viewPortY: integer, slot: ItemSlot) {
        this.removeAll(true);

        const buttons = this.directions.map((direction) => {
            const { x: dx, y: dy } = direction;
            const button = this.scene.make.container({
                x: (player.cellX - viewPortX + dx) * config.spriteWidth,
                y: (player.cellY - viewPortY + dy) * config.spriteHeight,
            })
            const buttonGraphics = this.scene.make.graphics({
                x: 0, y: 0,
                fillStyle: { color: 0xffffff, alpha: 0.3 },
                lineStyle: { width: 5, color: 0x00FF00, alpha: 1 },
            });
            buttonGraphics.fillRect(0, 0, config.spriteWidth, config.spriteHeight);
            buttonGraphics.strokeRect(0, 0, config.spriteWidth, config.spriteHeight);

            button.add(buttonGraphics);

            return button;
        });

        this.add(buttons);
        this.setVisible(true);
    }
    disable(): void {
        this.setVisible(false);
    }
}