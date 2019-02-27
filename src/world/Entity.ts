import { config, IDropEntityDef, IEntityDef, IChestEntityDef, IEnemyEntityDef } from "../config/config";
import { Scene } from "phaser";
import { ItemSlot } from "./Item";
import { CellWorld } from "./CellWorld";
import { IEnemyDef, EntityBehavior } from "../config/_EnemyTypes";
import { MainScene } from "../scenes/mainScene";


export interface IQueueEntity {
    lastActionTurnID: integer;
    fatigue: integer;
    name: string;
    action: (scene: MainScene, actionQueue: IQueueEntity[]) => Promise<void>;
}

let _entities: Entity[] = [];

export abstract class Entity extends Phaser.GameObjects.Container {
    public entityID: integer = -1;
    public entityDef: IEntityDef = null; // TODO: make it optional. some entities are from def and some are not
    public name: string = null;
    public type: string = null;

    public behaviors: EntityBehavior[] = [];

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

    public static getActionQueue(): IQueueEntity[] {
        const entities: unknown[] = (_entities
            .filter(entity => !!entity)
            .filter(entity => entity.behaviors.includes('queue'))
        );
        return entities as IQueueEntity[];
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

export class EnemyEntity extends Entity implements IQueueEntity {

    public enemyName: string;
    public behaviors: EntityBehavior[];
    public enemyDef: IEnemyDef;

    public lastActionTurnID = -1;
    public fatigue: integer = 0;

    public entityDef: IDropEntityDef;
    constructor(scene: Scene, cellWorld: CellWorld, entityDef: IEnemyEntityDef, cellX: number, cellY: number) {
        super(scene, cellWorld, entityDef, cellX, cellY);

        const { enemyID } = entityDef.enemy;
        this.enemyDef = config.enemies[enemyID];
        const { enemyName, behaviors, key, frame } = this.enemyDef;

        this.enemyName = enemyName;
        this.behaviors = behaviors;
        const sprite = scene.make.image({
            x: config.spriteWidth / 2,
            y: config.spriteHeight / 2,
            key,
            frame,
        });

        this.add(sprite);
    }

    async action() {
        this.fatigue += 10;
    }

}