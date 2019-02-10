
import { config, ItemTypes } from '../config';
import { CardButton } from '../UI/CardButton';
import { capitalizeFirstLetter } from '../Utils';

type Container = Phaser.GameObjects.Container;
type Text = Phaser.GameObjects.Text;
type Scene = Phaser.Scene;

export class ItemSlot {
    itemID: integer;
    itemCount: integer;
    level: integer;
    isActive: boolean;

    get itemDef() {
        return config.items[this.itemID];
    }

    constructor(itemID: integer, level: integer) {
        this.itemID = itemID;
        this.level = level;
        this.itemCount = 0;
    }

    clone() {
        const slot = new ItemSlot(this.itemID, this.level);
        slot.itemCount = this.itemCount;
        slot.isActive = this.isActive;
    }

    setCount(itemCount: integer) {
        this.itemCount = itemCount;
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
                const levelString = this.level === 0 ? '' : `+${this.level}`
                title.setText(`${capitalizeFirstLetter(itemDef.name)}${levelString}`);
                const itemCount = this.itemCount == null ? '' : (this.itemCount === -1 ? '∞' : `x${this.itemCount}`) as string;
                countLabel.setText(itemCount);
                if (this.itemCount === -1) {
                    countLabel.setStyle({ fontSize: 60 });
                } else {
                    countLabel.setStyle({ fontSize: 30 });
                }
            } else {
                const levelString = this.level === 0 ? '' : `+${this.level}`
                title.setText(`${capitalizeFirstLetter(itemDef.name)}${levelString}`);
                countLabel.setText('');
            }
        });
    }
}