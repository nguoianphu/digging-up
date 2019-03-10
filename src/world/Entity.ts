import { config, IDropEntityDef, IEntityDef, IChestEntityDef, IEnemyEntityDef } from "../config/config";
import { Scene } from "phaser";
import { ItemSlot } from "./Item";
import { CellWorld } from "./CellWorld";
import { IEnemyDef, EntityBehavior, IFaceLeftRightEnemyDef } from "../config/_EnemyTypes";
import { MainScene } from "../scenes/mainScene";
import { Immutable } from "../utils/ImmutableType";


export interface IQueueEntity {
    oldCellX: integer;
    oldCellY: integer;
    cellX: integer;
    cellY: integer;
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

    public oldCellX: integer;
    public oldCellY: integer;

    protected cellWorld: CellWorld;

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
        this.cellX = this.oldCellX = cellX;
        this.cellY = this.oldCellY = cellY;
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
    public enemyDef: Immutable<IEnemyDef>;

    public lastActionTurnID = -1;
    public fatigue: integer = 0;

    public entityDef: IEntityDef;

    public sprite: Phaser.GameObjects.Sprite = null;

    constructor(scene: Scene, cellWorld: CellWorld, entityDef: IEnemyEntityDef, cellX: number, cellY: number) {
        super(scene, cellWorld, entityDef, cellX, cellY);

        const { enemyID } = entityDef.enemy;
        this.enemyDef = config.enemies[enemyID];
        const { enemyName, behaviors, key, frame } = this.enemyDef;

        this.enemyName = enemyName;
        this.behaviors = [...behaviors];
        this.sprite = scene.make.sprite({
            x: config.spriteWidth / 2,
            y: config.spriteHeight / 2,
            key,
            frame,
        });

        this.add(this.sprite);
    }

    async action(scene: MainScene, actionQueue: IQueueEntity[]) {
        const rand = Math.random();
        if (rand > 0.2) {
            const dx = Math.random() > 0.5 ? -1 : 1;
            await this.move(scene, dx, 0);
        } else {
            // do nothing
            this.fatigue += 10;

        }
    }

    async move(scene: MainScene, dx: integer, dy: integer) {
        // console.log(`movePlayer(${dx}, ${dy})`, new Error());
        this.oldCellX = this.cellX;
        this.oldCellY = this.cellY;

        let newCellX = Phaser.Math.Clamp(this.cellX + dx, 0, this.cellWorld.width - 1);
        let newCellY = Phaser.Math.Clamp(this.cellY + dy, 0, this.cellWorld.height - 1);

        let destCell = this.cellWorld.getCell(newCellX, newCellY);
        if (newCellX === this.cellX && newCellY === this.cellY) {
            // do something if touch world boundary or decided to not move
        } else if (destCell) {
            // interact with cell
            let worldChanged = false;
            let canMove = true;

            if (destCell.physicsType === 'solid') {
                canMove = false;
            }
            if (!canMove) {
                newCellX = this.cellX;
                newCellY = this.cellY;
            } else {
                this.fatigue += 20;
                this.cellX = newCellX;
                this.cellY = newCellY;

                if (this.behaviors.includes('faceLeftRight')) {
                    this.updateFaceLeftRight(this.cellX - this.oldCellX);
                }

                const viewportLeft = scene.viewportX;
                const viewportTop = scene.viewportY;
                const viewportRight = viewportLeft + config.viewWidth;
                const viewportBottom = viewportTop + config.viewHeight - 1;
                console.log(`${viewportLeft}, ${viewportRight}, ${viewportTop}, ${viewportBottom}; ${this.cellX}, ${this.cellY}`);
                
                function pointIsInView(x: integer, y: integer) {
                    return (
                        (viewportLeft <= x && x < viewportRight) &&
                        (viewportTop <= y && y < viewportBottom)
                    );
                }
                let inView = false;
                if (pointIsInView(this.cellX, this.cellY)) {
                    console.log('inView A');
                    inView = true;
                }
                if (pointIsInView(this.oldCellX, this.oldCellY)) {
                    console.log('inView B');
                    inView = true;
                }


                return new Promise((resolve) => {
                    scene.add.tween({
                        targets: [this],
                        x: config.spriteWidth * (this.cellX),
                        y: config.spriteHeight * (this.cellY),
                        duration: inView ? config.movementTweenSpeed : 1,
                        ease: 'Linear',
                        onStart: () => {
                            this.sprite.play('slime_walk');
                        },
                        onComplete: () => {
                            this.sprite.play('slime_idle');
                            resolve();
                        },
                    });
                });

            }
        }
    }

    updateFaceLeftRight(facingDir: integer) {
        const faceLeftRight = (this.enemyDef as IFaceLeftRightEnemyDef).faceLeftRight;
        const spriteDir = faceLeftRight.spriteFacingRight ? 1 : -1;
        const scaleDir = spriteDir * facingDir;

        this.sprite.setScale(scaleDir, this.sprite.scaleY);
    }
}