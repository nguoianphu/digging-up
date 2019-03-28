import { config, IEntityDef, IDropEntityDef, IChestEntityDef, IEnemyEntityDef } from "../config/config";
import { Entity, DropEntity, ChestEntity, EnemyEntity } from "./Entity";
import { Scene } from "phaser";
import { MainScene } from "../scenes/mainScene";
import { BlockTypes } from "../config/_BlockTypes";
import { Immutable } from "../utils/ImmutableType";
import * as Debug from 'debug'

const log = Debug('digging-up:CellWorld:log');
// const warn = Debug('digging-up:CellWorld:warn');
// warn.log = console.warn.bind(console);

export class Cell {
    public name = 'cell';
    public cellID: integer;
    public stack: integer[] = [];
    public entityStack: integer[] = [];
    public physicsType: 'solid' | 'platform' | 'air' | 'entity' = 'air';
    constructor(name: string = 'structure', cellID: integer) {
        this.name = name;
        this.cellID = cellID;
        this.updatePhysicsType();
    }


    getTopBlock(): integer {
        return this.stack[this.stack.length - 1];
    }

    addBlock(blockType: BlockTypes) {
        if (blockType == null) return;
        this.stack.push(blockType);
        this.updatePhysicsType();
    }

    removeTopBlock() {
        this.removeBlock(this.stack.length - 1);
    }

    removeBlock(blockLayerID: integer) {
        this.stack.splice(blockLayerID, 1);
        this.updatePhysicsType();
    }

    addEntity(entity: Entity): void {
        if (!entity) return;
        this.entityStack.push(entity.entityID);
        this.updatePhysicsType();
    }

    removeEntity(entity: Entity) {
        const entityStackIndex = this.entityStack.indexOf(entity.entityID);

        if (entityStackIndex === -1) throw new Error(`removeEntity: entityID not found in stack: ${entity.entityID}`);
        this.entityStack.splice(entityStackIndex);
        this.updatePhysicsType();
    }

    updatePhysicsType() {
        this.physicsType = 'air';
        this.stack.forEach((blockType: BlockTypes) => {
            const blockDef = config.blocks[blockType];
            if (blockDef.type === 'solid') {
                this.physicsType = 'solid';
            } else if (blockDef.type === 'platform') {
                this.physicsType = 'platform';
            } else if (blockDef.type === 'air') {
                this.physicsType = 'air';
            }
        });
        if (this.entityStack.length > 0 && this.physicsType === 'air') {
            this.physicsType = 'entity';
        }
    }

    toString() {
        return this.name;
    }
}
export class CellWorld {
    /**
     * An i,j -coordinate map of map cells.
     * change to x,y coordinate by `getTransposedMap()`
     */
    public map: Cell[][];
    width: number;
    height: number;
    midWidth: number;
    scene: MainScene;
    constructor(scene: MainScene, width: number, height: number) {
        this.scene = scene;
        this.initMap(width, height);
    }

    initMap(width: number, height: number) {

        this.width = width;
        this.height = height;

        this.midWidth = width / 2;

        let id = 0;
        this.map = new Array(height).fill(1)
            .map((_, i) => new Array(width).fill(1)
                .map((_, j) => {
                    const newCell = new Cell('Cell', id++);

                    return newCell;
                })
            );
    }

    loadWorld(blockMap: Immutable<(string | number)[][]>) {
        const mapWidth = blockMap.reduce((acc, col) => Math.max(acc, col.length), 0);
        const mapHeight = blockMap.length;
        log(`loadWorld (width=${mapWidth}, height=${mapHeight})`);

        if (mapWidth !== this.width || mapHeight !== this.height) {
            this.initMap(mapWidth, mapHeight);
        }
        (this.map
            .forEach((col, i) =>
                col.forEach((cell, j) => {
                    const blockType = blockMap[i][j];
                    // log(`(${i},${j}): ${blockType}`);

                    if (typeof blockType === 'string' && (blockType.startsWith('$') || blockType.startsWith('!'))) {
                        const entityID = parseInt(blockType.slice(1), 10);
                        if (Number.isNaN(entityID)) throw new Error(`entityID isNaN: ${entityID}`);
                        this.entityFactory(this.scene, cell, config.entities[entityID], j, i);

                    } else if (typeof blockType === 'number') {
                        cell.addBlock(blockType);
                    }
                    // switch (blockType) {
                    //     case BlockTypes.AIR: {
                    //     } break;
                    //     case BlockTypes.DIRT: {
                    //     } break;
                    //     case BlockTypes.STONE: {
                    //     } break;
                    //     case BlockTypes.ROCK: {
                    //     } break;
                    //     case BlockTypes.OBSIDIAN: {
                    //     } break;
                    //     default: {
                    //         throw new Error(`Unknown blockType: ${blockType}`);
                    //     }
                    // }
                })
            )
        );
    }

    getTransposedMap(): Cell[][] {
        return this.transpose(this.map);
    }

    transpose(map: any[][]) {
        return map[0].map((col, i) => map.map(row => row[i]));
    }

    getCell(x: integer, y: integer): Cell {
        const i = y;
        const j = x;
        if (!this.map[i]) throw new Error(`Cell not found (x=${x}, y=${y})`);
        if (!this.map[i][j]) throw new Error(`Cell not found (x=${x}, y=${y})`);
        return this.map[i][j];
    }

    getCells(x: integer, y: integer, w: integer, h: integer) {
        return new Array(w).fill(1).map((_, i) => {
            return this.getTransposedMap()[x + i].slice(y, y + h);
        });
    }

    entityFactory(scene: Scene, cell: Cell, entityDef: IEntityDef, cellX: number, cellY: number): Entity {
        let entity: Entity;
        switch (entityDef.type) {
            case 'drop': {
                entity = new DropEntity(scene, this, entityDef as IDropEntityDef, cellX, cellY);
            } break;
            case 'chest': {
                entity = new ChestEntity(scene, this, entityDef as IChestEntityDef, cellX, cellY);
            } break;
            case 'enemy': {
                entity = new EnemyEntity(scene, this, entityDef as IEnemyEntityDef, cellX, cellY);
            } break;
            default:
                throw new Error(`unknown entityDef.type = ${entityDef.type}`)
        }
        this.scene.view.add(entity);
        cell.addEntity(entity);
        return entity;
    }


    toString() {
        return 'CellWorld';
    }
}