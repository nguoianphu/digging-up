import { config, blockTypes } from "../config";

export class Cell {
    public name = 'cell';
    public cellID: integer;
    public stack: integer[] = [];
    public physicsType: 'solid' | 'platform' | 'air' = 'solid';
    constructor(name: string = 'structure', cellID: integer, blockType: blockTypes) {
        this.name = name;
        this.cellID = cellID;
        this.stack.push(blockType);
        switch (blockType) {
            case blockTypes.AIR: {
            } break;
            case blockTypes.DIRT: {
            } break;
            case blockTypes.STONE: {
            } break;
            case blockTypes.ROCK: {
            } break;
            case blockTypes.OBSIDIAN: {
            } break;
            default: {
                throw new Error(`Unknown blockType: ${blockType}`);
            }
        }
        this.updatePhysicsType();
    }


    getTopBlock(): integer {
        return this.stack[this.stack.length - 1];
    }

    addBlock() {

    }

    removeTopBlock() {
        this.removeBlock(this.stack.length - 1);
    }

    removeBlock(blockLayerID: integer) {
        this.stack.splice(blockLayerID, 1);
        this.updatePhysicsType();
    }

    updatePhysicsType() {
        this.physicsType = 'air';
        this.stack.forEach((blockType: blockTypes) => {
            const blockDef = config.blocks[blockType];
            if (blockDef.type === 'solid') {
                this.physicsType = 'solid';
            } else if (blockDef.type === 'platform') {
                this.physicsType = 'platform';
            } else if (blockDef.type === 'air') {
                this.physicsType = 'air';
            }
        })
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
    constructor(width: number, height: number) {
        let id = 0;
        this.width = width;
        this.height = height;

        this.midWidth = width / 2;

        this.map = new Array(height).fill(1)
            .map((_, i) => new Array(width).fill(1)
                .map((_, j) => new Cell('Cell', id++, config.blockMap[i][j]))
            );
    }

    getTransposedMap(): Cell[][] {
        return this.transpose(this.map);
    }

    transpose(map: any[][]) {
        return map[0].map((col, i) => map.map(row => row[i]));
    }

    getCell(x: integer, y: integer): Cell {
        if (!this.map[y]) return null;
        if (!this.map[y][x]) return null;
        return this.map[y][x];
    }

    getCells(x: integer, y: integer, w: integer, h: integer) {
        return new Array(w).fill(1).map((_, i) => {
            return this.getTransposedMap()[x + i].slice(y, y + h);
        });
    }

    toString() {
        return 'CellWorld';
    }
}