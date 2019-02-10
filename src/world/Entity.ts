import { config, IDropEntityDef, IEntityDef, IChestEntityDef } from "../config";
import { Scene } from "phaser";


let _entities: Entity[] = [];

export abstract class Entity extends Phaser.GameObjects.Container {
    public entityID: integer = -1;
    public entityDef: IEntityDef = null;
    public name: string = null;
    public type: string = null;

    public cellX: integer;
    public cellY: integer;

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


    constructor(scene: Scene, entityDef: IEntityDef, cellX: number, cellY: number) {
        super(scene, cellX * config.spriteWidth, cellY * config.spriteHeight);
        this.cellX = cellX;
        this.cellY = cellY;
        this.entityID = Entity.getEntityID();
        _entities.push(this);

        this.entityDef = { ...entityDef };
        const { name, type } = this.entityDef;
        this.name = name;
        this.type = type;
    }

}

export class DropEntity extends Entity {

    public entityDef: IDropEntityDef;
    public item: integer;
    public level: integer;
    public itemCount: integer;
    constructor(scene: Scene, dropDef: IDropEntityDef, cellX: number, cellY: number) {
        super(scene, dropDef, cellX, cellY);
        const { drop } = dropDef;

        this.item= drop.item;
        this.level= drop.level;
        this.itemCount= drop.itemCount;

        const itemDef = config.items[this.item];

        const itemIcon = scene.make.image({
            x: config.spriteWidth / 2,
            y: config.spriteHeight / 4 * 3,
            key: itemDef.sprites[this.level].key,
            frame: itemDef.sprites[this.level].frame,
            scale: 0.5,
        });
        this.add(itemIcon);
    }

}

export class ChestEntity extends Entity {

    public entityDef: IDropEntityDef;
    constructor(scene: Scene, chestDef: IChestEntityDef, cellX: number, cellY: number) {
        super(scene, chestDef, cellX, cellY);
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

