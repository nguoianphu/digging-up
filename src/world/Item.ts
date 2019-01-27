
import { config, ItemTypes } from '../config';
import { CardButton } from '../UI/CardButton';

type Container = Phaser.GameObjects.Container;
type Text = Phaser.GameObjects.Text;
type Scene = Phaser.Scene;

export class Slot {
    itemID: integer;
    count: integer;
    level: integer;
    isActive: boolean;

    get itemDef() {
        return config.items[this.itemID];
    }

    constructor(itemID: integer, level: integer) {
        this.itemID = itemID;
        this.level = level;
        this.count = this.itemDef.uses;
    }

    setCount(count: integer) {
        this.count = count;
    }

    updateButton(button: CardButton) {
        button.updateButtonActive(this.isActive);
        button.updateChildren((scene: Scene, iconContainer: Container, title: Text, countLabel: Text) => {
            const itemDef = this.itemDef;
            iconContainer.removeAll(true);
            if (this.itemID !== ItemTypes.EMPTY) {
                const { key, frame, scale } = itemDef.sprites[this.level];

                const icon = scene.make.image({
                    key, frame,
                    x: 0,
                    y: 0,
                    scale: scale || 1,
                });
                iconContainer.add(icon);
            }
            const levelString = this.level === 0 ? '' : `+${this.level}`
            title.setText(`${itemDef.name}${levelString}`);
            const count = (this.count === -1 ? '∞' : this.count) as string;
            countLabel.setText(count);
        });
    }
}