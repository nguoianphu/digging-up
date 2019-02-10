import { config, IDropEntityDef, IEntityDef, IChestEntityDef } from "../config";
import { Scene } from "phaser";
import { ItemSlot } from "./Item";
import { CellWorld } from "./CellWorld";


let _entities: Entity[] = [];

export abstract class Entity extends Phaser.GameObjects.Container {
    public entityID: integer = -1;
    public entityDef: IEntityDef = null;
    public name: string = null;
    public type: string = null;

    public cellX: integer;
    public cellY: integer;

    private cellWorld: CellWorld;

    public static getEntityID() {
        return _entities.length;
    }

    public static getAllEntities(): Entity[] {
        return _entities.slice();
    }

    public static getEntityByID(entityID: integer): Entity {
        return _entities[entityID];
    }
    public static destroyEntity(entity: Entity) {
        _entities[entity.entityID].destroy();
        _entities[entity.entityID] = null;
    }


    constructor(scene: Scene, cellWorld: CellWorld, entityDef: IEntityDef, cellX: number, cellY: number) {
        super(scene, cellX * config.spriteWidth, cellY * config.spriteHeight);
        this.cellX = cellX;
        this.cellY = cellY;
        this.cellWorld = cellWorld;
        this.entityID = Entity.getEntityID();
        _entities.push(this);

        this.entityDef = { ...entityDef };
        const { name, type } = this.entityDef;
        this.name = name;
        this.type = type;
    }

    destroyEntity() {
        // this.cellWorld.removeEntity(this.cellX, this.cellY, this);
        Entity.destroyEntity(this);

        this.destroy();
    }

}

export class DropEntity extends Entity {

    public entityDef: IDropEntityDef;
    public slot: ItemSlot = null;

    constructor(scene: Scene, cellWorld: CellWorld, dropDef: IDropEntityDef, cellX: number, cellY: number) {
        super(scene, cellWorld, dropDef, cellX, cellY);
        const { drop } = dropDef;
        const { item, level, itemCount } = drop;

        this.setSlotAndUpdateGraphics(new ItemSlot(item, level, itemCount));
    }

    setSlotAndUpdateGraphics(slot: ItemSlot) {
        this.slot = slot;

        const itemDef = config.items[this.slot.itemID];

        this.removeAll(true);

        const itemIcon = this.scene.make.image({
            x: config.spriteWidth / 2,
            y: config.spriteHeight / 4 * 3,
            key: itemDef.sprites[this.slot.level].key,
            frame: itemDef.sprites[this.slot.level].frame,
            scale: 0.5,
        });
        this.add(itemIcon);
    }
}

export class ChestEntity extends Entity {

    public entityDef: IDropEntityDef;
    constructor(scene: Scene, cellWorld: CellWorld, chestDef: IChestEntityDef, cellX: number, cellY: number) {
        super(scene, cellWorld, chestDef, cellX, cellY);
        const { chest } = chestDef;

        const chestSprite = scene.make.image({
            x: config.spriteWidth / 2,
            y: config.spriteHeight / 4 * 3,
            key: chest.key,
            frame: chest.frame,
        });
        this.add(chestSprite);
    }

}

